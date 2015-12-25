"use strict";
var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var SourceMap = require('./compiler/sourcemap');
var dir = require('./dir');
var fsext = require('./fsext');

module.exports = link;

var builtin = (function() {

})();

function link(flist, target, conf, callback) {
    new Link(flist, target, conf).begin(callback);
}

function Link(flist, target, conf) {
    this.flist = flist;
    this.target = target;
    this.conf = conf;
    this.libs = conf.libs;

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
    }).then(parse.bind(this)).catch(catchError);
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
                var watchInfo = dir.fetch(watch);
                if (!watchInfo || watchInfo.time > myTime) {
                    watchFileChanged = true;
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
            fs.writeFile(jsTarget, out, this.callback);
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
    console.log(this.mods);
};


function link(flist, target, conf, callback) {
    target = target.replace(/\.(css|js)$/i, '');
    var jsTarget = target + '.js';
    var cssTarget = target + '.css';
    var jsMapTarget = path.join(target, '_build', 'js.map');
    var cssMapTarget = path.join(target, '_build', 'css.map');
    
    if (flist.length == 0) {
        return callback();
    }
    var mods = {};
    var includes = {};
    var watchFileChanged = false;

    //= load mod info listed in flist
    (function() {
    })();

    //= sort modules by dependency and path name, check for dependency error
    function sort() {
        if (watchFileChanged) {
            callback();
            return;
        }
        var sorted = [];
        var unmet = {};
        _(_.sortBy(_.values(mods), 'importPath')).each(function check(mod) {
            _(mod.dep).each(function(__, dep) {
                var depMod = mods[dep];
                if (depMod) {
                    if (depMod.loaded) {
                        mod.wait--;
                        delete mod.dep[dep]
                    } else {
                        depMod.used[mod.importPath] = 1;
                    }
                } else if(includable[dep] || externs[dep]) {
                    mod.wait--;
                    delete mod.dep[dep];
                    includes[dep] = 1;
                }
            });
            unmet[mod.importPath] = 1;
            if (mod.wait == 0) {
                delete unmet[mod.importPath];
                mod.loaded = true;
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
        unmet = Object.keys(unmet);
        unmet = _(unmet).map(function(mod) {
            mod = mods[mod];
            if (mod.ignore)
                return false;
            try {
                notCircular(mod);
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
        if (unmet.length) {
            var out = ['Link error'];
            _(unmet).each(function(err) {
                out.push(err);
            });
            out.push('Tip: prepend @ to import path to disable dependency check. e.g. import \'@./ExampleModule\'');
            out = 'console.error(' + JSON.stringify(out.join("\n")) + ')';
            fs.writeFile(jsTarget, out, callback);
        } else {
            combine(sorted);
        }
    }
    function notCircular(mod, visited) {
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
        _(mod.dep).each(function(__, dep) {
            dep = mods[dep];
            if (dep) {
                notCircular(dep, visited);
            }
        });
        delete visited[mod.importPath];
    }
    function combine(sorted) {
        var jsOut = fs.createWriteStream(jsTarget);
        var cssOut = fs.createWriteStream(cssTarget);

        var jsMap = new SourceMap();
        var cssMap = new SourceMap();

		jsOut.write('(function() {\n');
        jsMap.mappings.push([]);

        if (includes.UIComponent) {
            includes['React'] = 1;
            includes['ReactDOM'] = 1;
        }
        includes = Object.keys(includes);
        addFromRes('awf', function() {
            nextRes();
        });
        function nextRes() {
            var res = includes.shift();
            if (!res) {
                nextMod();
            } else if (externs[res]) {
                var extern = externs[res];
                var content = '$$$AWF$$$.extern.push(' + JSON.stringify(extern) + ');' 
                    + '$$$AWF$$$.define("' + res + '", function(module) {module.exports=window.' + extern.id + ';});';
                jsMap.mappings.push([]);
                fsext.writeStream(jsOut, content + '\n').then(nextRes);
            } else {
                addFromRes(res, nextRes);
            }
        }
        function nextMod() {
            var mod = sorted.shift();
            if (!mod) {
                var waitAll = _.after(4, callback);
                fs.writeFile(jsMapTarget, jsMap.toString(), waitAll);
                jsOut.on('finish', waitAll);
				jsOut.write('})();\n//# sourceMappingURL=' + path.basename(target) + '/_build/js.map');
                jsOut.end();
                fs.writeFile(cssMapTarget, cssMap.toString(), waitAll);
				cssOut.write('\n/*# sourceMappingURL=' + path.basename(target) + '/_build/css.map */');
                cssOut.on('finish', waitAll);
                cssOut.end();
            } else {
                fsext.unpack(mod.compileFile, {
                    jsOutput: '',
                    jsMap: false,
                    cssOutput: '',
                    cssMap: false
                }).then(function(content) {
                    var next = _.after(2, nextMod);
                    if (content.jsOutput) {
                        fsext.writeStream(jsOut, content.jsOutput).then(next);
                        if (content.jsMap) {
                            jsMap.append(content.jsMap);
                        }
                    } else {
                        next();
                    }
                    if (content.cssOutput) {
                        fsext.writeStream(cssOut, content.cssOutput).then(next);
                        if (content.cssMap) {
                            cssMap.append(content.cssMap);
                        }
                    } else {
                        next();
                    }
                }).catch(catchError);
            }
        };
        function addFromRes(name, next) {
            var fpath = require.resolve('./res/' + name);
            var minPath = fpath.replace(/\.js$/i, '.min.js');
            fs.stat(fpath, function(err, fstat) {
                if (err) {
                    console.warn(err);
                    return next();
                }
                fs.stat(minPath, function(err, minStat) {
                    if (!err && minStat && minStat.mtime.getTime() >= fstat.mtime.getTime())
                        fpath = minPath;
                    fs.readFile(fpath, 'utf-8', function(err, content) {
                        if (err) {
                            console.warn(err);
                            next();
                        } else {
                            var lines = content.split('\n').length;
                            for (var i = 0; i < lines; i++) {
                                jsMap.mappings.push([]);
                            }
                            fsext.writeStream(jsOut, content + '\n').then(next);
                        }
                    });
                });
            });
        }
    }
    function catchError(err) {
        console.log(err.stack || err);
        callback();
    }
}
