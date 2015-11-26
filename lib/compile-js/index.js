var fs = require('fs');
var path = require('path');
var babel = require('babel-core');
var _ = require('underscore');
var sourceMapCombine = require('combine-source-map');

//console.log('Initialize JS compiler');
//require('babel-preset-react');
//console.log('Loaded react syntax');
//require('babel-preset-stage-0');
//console.log('Loaded JavaScript sugars');
//require('babel-preset-es2015');
//console.log('Loaded ES2015 syntax');
//
//console.log('JS compiler ready');


module.exports.compile = function(fpath, target, callback) {
    fs.readFile(fpath, 'utf-8', function(err, content) {
        if (err) {
            callback(err);
        } else {
            var out;
            var info;
            var modules = require('./modules-hook')(fpath);
            try {
                var result = babel.transform(content, {
                    filename: fpath,
                    plugins: [modules.plugin],
                    presets: ['es2015'],//,'stage-0','react'],
                    sourceMaps: true,
                    highlightCode: false
                });
                var i = 0;
                while (true) {
                    i++;
                    var reqName = 'AWFrequire' + i;
                    if (result.code.indexOf(reqName) < 0) {
                        break;
                    }
                }
                info = {
                    dep:modules.dependencies,
                    path:modules.modPath,
                    reqIndex: i
                };
                var code = '(' + JSON.stringify(modules.modName) + ', function(module, exports, require) {\n';
                code += result.code;
                code += '\n});';
                out = {
                    code: code,
                    map: result.map
                };
            } catch(err) {
                console.warn(err.stack);
                err = err.toString() + "\n" + err.codeFrame;
                console.warn(err);
                info = {
                    dep:[],
                    path:modules.modPath,
                    reqIndex: 0
                };
                out = '();console.error(' + JSON.stringify(err) + ')';
                out = {
                    code: out,
                    map: false
                }
            }
            info = JSON.stringify(info);
            out = JSON.stringify(out);
            callback = _.after(2, callback);
            fs.writeFile(target, out, callback);
            fs.writeFile(target + '_info', info, callback);
        }
    });
};

module.exports.link = function(flist, target, callback) {
    var mods = {};
    var next = _.after(flist.length, sort);
    var reqIndex = 0;
    for (var k in flist) {
        (function(compileFile) {
            var infoFile = compileFile + '_info';
            fs.readFile(infoFile, function(err, content) {
                if (err) {
                    console.warn(infoFile, err);
                    next();
                    return;
                }
                var info;
                try {
                    info = JSON.parse(content);
                } catch(err) {
                    console.warn(infoFile, 'corrupt content');
                    next();
                    return;
                }
                if (info.reqIndex > reqIndex)
                    reqIndex = info.reqIndex;
                info.fpath = compileFile;
                var dep = info.dep;
                info.dep = {};
                info.used = {};
                info.wait = dep.length;
                info.loaded = false;
                for (var k in dep) {
                    info.dep[dep[k]] = 1;
                }
                mods[info.path] = info;
                next();
            });
        })(flist[k]);
    }
    function sort() {
        var sorted = [];
        var unmet = {};
        _(_.sortBy(_.values(mods), 'path')).each(function check(mod) {
            _(mod.dep).each(function(__, dep) {
                var depMod = mods[dep];
                if (depMod) {
                    if (depMod.loaded) {
                        mod.wait--;
                        delete mod[dep]
                    } else {
                        depMod.used[mod.path] = 1;
                    }
                }
            });
            unmet[mod.path] = 1;
            if (mod.wait == 0) {
                delete unmet[mod.path];
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
                return mod.path + ' is missing dependencies:\n\t' + Object.keys(mod.dep).join('\n\t');
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
                console.warn(err);
                out.push(err);
            });
            out.push('Tip: prepend @ to import path to disable dependency check. e.g. import \'@./ExampleModule\'');
            out = 'console.error(' + JSON.stringify(out.join("\n")) + ')';
            fs.writeFile(target, out, callback);
        } else {
            combine(sorted);
        }
    }
    function notCircular(mod, visited) {
        if (mod.ignore)
            return false;
        if (visited) {
            if (visited[mod.path]) {
                throw Object.keys(visited);
            }
        } else {
            visited = {}
        }
        visited[mod.path] = 1;
        _(mod.dep).each(function(__, dep) {
            dep = mods[dep];
            if (dep) {
                notCircular(dep, visited);
            }
        });
        delete visited[mod.path];
    }
    function combine(sorted) {
        var reqName = 'AWFrequire' + reqIndex;
        var out = fs.createWriteStream(target);
        var scombine = sourceMapCombine.create();
        fs.readFile(require.resolve('./awf-require.js'), 'utf-8', function(err, content) {
            if (err) {
                console.warn(err);
            } else {
                content = content.replace(/AWFrequire/g, reqName);
                if(out.write(content)) {
                    next();
                } else {
                    out.on('drain', next);
                }
            }
        });
        function next() {
            var mod = sorted.shift();
            if (!mod) {
                console.log(scombine.base64());
                out.end();
                out.on('finish', callback);
            } else {
                fs.readFile(mod.fpath, function(err, content) {
                    if (err) {
                        console.warn(mod.fpath, err);
                        next();
                        return;
                    }
                    out.write(reqName);
                    try {
                        content = JSON.parse(content);
                    } catch(err) {
                        console.error(mod.fpath, 'corrupt compile');
                        next();
                        return;
                    }
                    scombine.addFile(content.map, {line:1});
                    if(out.write(content.code)) {
                        next();
                    } else {
                        out.on('drain', next);
                    }
                });
            }
        };
    }
};

