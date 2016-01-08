"use strict";
var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var SourceMap = require('./compiler/sourcemap');
var dir = require('./dir');
var fsext = require('./fsext');
var downloadLib = require('./download-lib');

module.exports = link;

var linkerReady = new (require('./state'))();

var builtIn = {};
var libExtend = {};
var AWF = '';
(function() {
    var resDir = path.dirname(require.resolve('./res/awf'));
    var next = _.after(3, function() {
        linkerReady.set();
    });
    load(path.join(resDir, 'built-in'), builtIn, next);
    load(path.join(resDir, 'extend'), libExtend, next);
    fs.readFile(path.join(resDir, 'awf.min.js'), function(err, content) {
        if (err) return process.exit(1);
        AWF = content.toString();
        next();
    });
    function load(dir, obj, callback) {
        fs.readdir(dir, function(err, list) {
            if (err) return process.exit(1);
            list = list.filter(function(v) {
                return v.match(/\.min\.js$/i);
            });
            var next = _.after(list.length + 1, callback);
            list.map(function(v) {
                fs.readFile(path.join(dir, v), 'utf-8', function(err, content) {
                    if (err) return process.exit(1);
                    obj[v.split('.')[0]] = content;
                    next();
                });
            });
            next();
        });
    }
})();

function link(flist, target, conf, callback) {
    linkerReady.run(function() {
        new Link(flist, target, conf).begin(callback);
    });
}

function Link(flist, target, conf) {
    this.flist = flist;
    this.target = target;
    this.conf = conf;
    this.libs = conf.libs;
    if (this.libs.React)
        this.libs.React.global = true;
    if (this.libs.ReactDOM)
        this.libs.ReactDOM.global = true;

    this.jsTarget = target + '.js';
    this.cssTarget = target + '.css';
    this.jsMapTarget = path.join(target, conf.build_dir, 'js.map');
    this.cssMapTarget = path.join(target, conf.build_dir, 'css.map');

    this.mods = {};
    this.uses = {};
}

Link.prototype.begin = function(callback) {
    this.callback = callback;
    if (this.flist.length == 0) {
        return callback();
    }
    this.loadMods();
};

Link.prototype.loadMods = function() {
    var mods = this.mods;
    var next = _.after(this.flist.length, this.sort.bind(this));
    for (var k in this.flist) {
        this.loadMod(this.flist[k], next);
    }
};

Link.prototype.loadMod = function(compileFile, next) {
    fsext.unpack(compileFile, {
        relativePath: '',
        importPath: '',
        dep: [],
        watch: []
    }).then(parse.bind(this)).catch(this.catchError.bind(this));
    var mods = this.mods;
    function parse(info, err) {
        if (err) {
            console.warn(compileFile, err);
            next();
            return;
        }
        var myTime = dir.fetch(compileFile);
        if (myTime) {
            myTime = myTime.time;
            for (var i = 0; i < info.watch.length; i++) {
                var watch = info.watch[i];
                if (path.isAbsolute(watch) || watch.substr(0, 2) == '..')
                    continue;
                var watchInfo = dir.fetch(watch);
                if (!watchInfo || watchInfo.time > myTime) {
                    this.watchFileChanged = true;
                    fs.unlink(compileFile, next);
                    return;
                }
            }
        }
        info.compileFile = compileFile;
        if (mods[info.importPath]) {
            var out = "Link Error: Modules with duplicate import path ["
                + info.importPath + "]: \n\t" + info.relativePath + "\n\t" + mods[info.importPath].relativePath
                + "\nTip: extensions are not included in the import path";
            out = 'console.error(' + JSON.stringify(out) + ')';
            fs.writeFile(this.jsTarget, out, this.callback);
            return;
        }
        var dep = info.dep;
        info.dep = {};
        info.used = {};
        info.wait = 0;
        info.loaded = false;
        for (var k in dep) {
            if (!info.dep[dep[k]]) {
                info.dep[dep[k]] = 1;
                info.wait++;
            }
        }
        mods[info.importPath] = info;
        next();
    }
};

Link.prototype.sort = function() {
    if (this.watchFileChanged) {
        this.callback();
        return;
    }
    var mods = this.mods;
    var libs = this.libs;
    var sorted = [];
    var unmet = {};
    var useLib = this.useLib = {};
    _.sortBy(_.values(mods), 'importPath').map(function check(mod) {
        if (mod.isSorted)
            return;
        _(mod.dep).each(function(__, dep) {
            var depMod = mods[dep];
            if (libs[dep] || builtIn[dep]) {
                mod.wait--;
                delete mod.dep[dep];
                useLib[dep] = 1;
            } else if(depMod) {
                if (depMod.loaded) {
                    mod.wait--;
                    delete mod.dep[dep]
                } else {
                    depMod.used[mod.importPath] = 1;
                }
            }
        });
        unmet[mod.importPath] = 1;
        if (mod.wait == 0) {
            delete unmet[mod.importPath];
            mod.loaded = true;
            mod.isSorted = true;
            sorted.push(mod);
            _(mod.used).each(function(__, user) {
                var userMod = mods[user];
                if (userMod) {
                    check(userMod);
                }
            });
            mod.used = {};
        }
    });
    var unmetList = Object.keys(unmet);
    var notCircular = this.notCircular.bind(this);
    unmetList = unmetList.map(function(mod) {
        mod = mods[mod];
        if (mod.ignore)
            return false;
        try {
            notCircular(mod);
            for (var k in mod.dep) {
                if (unmet[k]) {
                    return false;
                }
            }
            return mod.importPath + ' is missing dependencies:\n\t' + Object.keys(mod.dep).join('\n\t');
        } catch(visited) {
            _(visited).each(function(v) {
                mods[v].ignore = true;
            });
            return 'Circular import is not allowed:\n\t' + visited.join('\n\t');
        }
    }).filter(function(v) {
        return !!v;
    });
    if (unmetList.length) {
        var out = ['Link error'];
        unmetList.map(function(err) {
            out.push(err);
        });
        out.push('Tip: prepend @ to import path to disable dependency check. e.g. import \'@./ExampleModule\'');
        console.log(out.join('\n'));
        out = 'console.error(' + JSON.stringify(out.join("\n")) + ');';
        fs.writeFile(this.jsTarget, out, this.callback);
        fs.writeFile(this.cssTarget, '');
    } else {
        this.sorted = sorted;
        this.fetchLibs();
    }
};

Link.prototype.notCircular = function(mod, visited) {
    if (mod.ignore)
        return false;
    if (visited) {
        if (visited[mod.importPath]) {
            throw Object.keys(visited);
        }
    } else {
        visited = {}
    }
    visited[mod.importPath] = 1;
    var self = this;
    _(mod.dep).each(function(__, dep) {
        dep = self.mods[dep];
        if (dep) {
            self.notCircular(dep, visited);
        }
    });
    delete visited[mod.importPath];
};

Link.prototype.fetchLibs = function() {
    this.useLib['es5-shim'] = 1;
    this.useLib['es5-sham'] = 1;
    this.useLib['json3'] = 1;
    var self = this;
    this.libContent = {};
    var useLibList = Object.keys(this.useLib);
    var next = _.after(useLibList.length + 1, this.combine.bind(this));
    useLibList.map(function(k) {
        if (builtIn[k])
            return next();
        var lib = self.libs[k];
        if (lib && lib.inline) {
            var url = self.conf.debug ? lib.debug || lib.url : lib.url;
            downloadLib(k, url, self.conf.build_dir, function(content) {
                if (!content) {
                    content = 'Link error, unable to download library "' + k + '" with url: ' + lib.url;
                    content = 'console.error(' + JSON.stringify(content) + ');';
                }
                self.libContent[k] = content;
                next();
            });
        } else {
            next();
        }
    });
    next();
};

Link.prototype.combine = function() {
    this.jsOut = fs.createWriteStream(this.jsTarget);
    this.cssOut = fs.createWriteStream(this.cssTarget);
    this.jsMap = new SourceMap();
    this.jsMap.sourceRoot = '../';
    this.cssMap = new SourceMap();
    this.cssMap.sourceRoot = '../';

    this.jsOut.writeNoMap = (function(content) {
        this.jsOut.write(content + '\n');
        for (var i = content.split('\n').length; i > 0; i--)
            this.jsMap.mappings.push([]);
    }).bind(this);

    this.jsOut.writeNoMap('(function() {');
    this.jsOut.writeNoMap('var DEBUG=' + (this.conf.debug ? 'true' : 'false') + ';');
    this.jsOut.writeNoMap(AWF);
    for (var k in this.libs) {
        if (!builtIn[k] && this.useLib[k]) {
            var lib = this.libs[k];
            var keyStr = JSON.stringify(k);
            if (!lib.inline) {
                this.jsOut.writeNoMap('$$$AWF$$$.lib[' + keyStr + ']=' + JSON.stringify({
                    url: this.conf.debug ? lib.debug || lib.url : lib.url,
                    exports: lib.exports
                }) + ';');
                this.jsOut.writeNoMap('$$$AWF$$$.use[' + keyStr + ']=1;')
            }
            this.jsOut.writeNoMap('$$$AWF$$$.define(' + keyStr + ', function(module, exports, require) {');
            if (lib.inline) {
                this.jsOut.writeNoMap(this.libContent[k]);
                this.jsOut.writeNoMap('exports = module.exports;');
            } else if (lib.exports) {
                this.jsOut.writeNoMap('module.exports = exports = window[' + JSON.stringify(lib.exports) + '];');
            }
            if (libExtend[k]) {
                this.jsOut.writeNoMap(libExtend[k]);
            }
            this.jsOut.writeNoMap('}, true);');
            if (lib.global && lib.exports.match(/^[a-z_$][a-z0-9_$]*$/i)) {
                this.jsOut.writeNoMap('var ' + lib.exports + '=$$$AWF$$$.require(' + keyStr + ');');
            }
        }
    }
    for (var k in this.useLib) {
        if (builtIn[k]) {
            this.jsOut.writeNoMap(builtIn[k]);
        }
    }
    var self = this;
    nextMod();
    function nextMod() {
        var mod = self.sorted.shift();
        if (!mod) {
            var waitAll = _.after(4, self.callback);
            fs.writeFile(self.jsMapTarget, self.jsMap.toString(), waitAll);
            self.jsOut.on('finish', waitAll);
            self.jsOut.write('})();\n//# sourceMappingURL=' + path.basename(self.target) + '/' + self.conf.build_dir + '/js.map');
            self.jsOut.end();
            fs.writeFile(self.cssMapTarget, self.cssMap.toString(), waitAll);
            self.cssOut.write('\n/*# sourceMappingURL=' + path.basename(self.target) + '/' + self.conf.build_dir + '/css.map */');
            self.cssOut.on('finish', waitAll);
            self.cssOut.end();
        } else if(builtIn[mod.importPath] || self.libs[mod.importPath]) {
            var content = 'Module ' + mod.importPath + ' is overwritten by library with the same name';
            content = 'console.warn(' + JSON.stringify(content) + ');';
            self.jsOut.writeNoMap(content);
        } else {
            fsext.unpack(mod.compileFile, {
                jsOutput: '',
                jsMap: false,
                cssOutput: '',
                cssMap: false
            }).then(function(content) {
                var next = _.after(2, nextMod);
                if (content.jsOutput) {
                    fsext.writeStream(self.jsOut, content.jsOutput).then(next);
                    if (content.jsMap) {
                        self.jsMap.append(content.jsMap);
                    }
                } else {
                    next();
                }
                if (content.cssOutput) {
                    fsext.writeStream(self.cssOut, content.cssOutput).then(next);
                    if (content.cssMap) {
                        self.cssMap.append(content.cssMap);
                    }
                } else {
                    next();
                }
            }).catch(self.catchError.bind(self));
        }
    };
};

Link.prototype.catchError = function(err) {
    console.warn(err.stack || err);
    this.callback();
};
