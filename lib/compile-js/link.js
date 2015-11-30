var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var sourcemap = require('sourcemap-codec');

module.exports = link;

function link(flist, target, callback) {
    var mods = {};
    var includes = {};
    var includable = [
        'View',
        'EventEmitter'
    ];

    (function(inc) {
        includable = {};
        for (var i = 0; i < inc.length; i++) {
            includable[inc[i]] = 1;
        }
    })(includable);

    //= load mod info listed in flist
    (function() {
        var next = _.after(flist.length, sort);
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
					if (mods[info.path]) {
						var out = "Link Error: Modules with duplicate import path ["
							+ info.path + "]: \n\t" + info.source + "\n\t" + mods[info.path].source
							+ "\nTip: extensions are not included in the import path";
						out = 'console.error(' + JSON.stringify(out) + ')';
						fs.writeFile(target, out, callback);
						return;
					}
                    info.fpath = compileFile;
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
                    mods[info.path] = info;
                    next();
                });
            })(flist[k]);
        }
    })();

    //= sort modules by dependency and path name, check for dependency error
    function sort() {
        var sorted = [];
        var unmet = {};
        _(_.sortBy(_.values(mods), 'path')).each(function check(mod) {
            _(mod.dep).each(function(__, dep) {
                var depMod = mods[dep];
                if (depMod) {
                    if (depMod.loaded) {
                        mod.wait--;
                        delete mod.dep[dep]
                    } else {
                        depMod.used[mod.path] = 1;
                    }
                } else if(includable[dep]) {
                    mod.wait--;
                    delete mod.dep[dep];
                    includes[dep] = 1;
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
        var out = fs.createWriteStream(target);
		out.write('(function() {\n');
        var combineMap = {
            version: 3,
            file: path.basename(target),
            sources: [],
            sourcesContent: [],
            names: [],
            mappings: [[]],
        };
        var sourceIndex = 0;
        if (includes.View) {
            includes['react-dom.min'] = 1;
            includes['react-with-addons.min'] = 1;
        }
        includes = Object.keys(includes);
        addFromRes('awf', function() {
            nextRes();
        });
        function nextRes() {
            var res = includes.pop();
            if (!res) {
                nextMod();
            } else {
                addFromRes(res, nextRes);
            }
        }
        function nextMod() {
            var mod = sorted.shift();
            if (!mod) {
                combineMap.mappings = sourcemap.encode(combineMap.mappings);
                var map = JSON.stringify(combineMap);
				out.write('})();\n//# sourceMappingURL=' + path.basename(target) + '.map');
                out.end();
                out.on('finish', function() {
                    fs.writeFile(target + '.map', map, function(err) {
                        callback();
                    });
                });
            } else {
                fs.readFile(mod.fpath, function(err, content) {
                    if (err) {
                        console.warn(mod.fpath, err);
                        nextMod();
                        return;
                    }
                    try {
                        content = JSON.parse(content);
                    } catch(err) {
                        console.error(mod.fpath, 'corrupt compile');
                        nextMod();
                        return;
                    }
                    if (content.map) {
                        combineMap.sources[sourceIndex] = mod.source;
                        combineMap.sourcesContent[sourceIndex] = content.source;
                        _(content.map).each(function(line) {
                            _(line).each(function(item) {
                                item[1] = sourceIndex;
                            });
                            combineMap.mappings.push(line);
                        });
                        sourceIndex++;
                    } else {
                        var lines = (content.code.match(/\n/g) || []).length;
                        for (var i = 0; i < lines; i++) {
                            combineMap.mappings.push([]);
                        }
                    }
                    if(out.write(content.code)) {
                        nextMod();
                    } else {
                        out.on('drain', nextMod);
                    }
                });
            }
        };
        function addFromRes(name, next) {
            fs.readFile(require.resolve('./res/' + name), 'utf-8', function(err, content) {
                if (err) {
                    console.warn(err);
                } else {
                    var lines = (content.match(/\n/g) || []).length;
                    for (var i = 0; i < lines; i++) {
                        combineMap.mappings.push([]);
                    }
                    if(out.write(content)) {
                        next();
                    } else {
                        out.on('drain', next);
                    }
                }
            });
        }
    }
}
