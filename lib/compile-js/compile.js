var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var babel = require('babel-core');
var sourcemap = require('sourcemap-codec');

module.exports = compile;

//console.log('Initialize JS compiler');
//require('babel-preset-react');
//console.log('Loaded react syntax');
//require('babel-preset-stage-0');
//console.log('Loaded JavaScript sugars');
//require('babel-preset-es2015');
//console.log('Loaded ES2015 syntax');
//
//console.log('JS compiler ready');

function compile(fpath, target, callback, relativeTo) {
    if (!relativeTo) {
        relativeTo = '.';
    }
    fs.readFile(path.join(relativeTo, fpath), 'utf-8', function(err, content) {
        if (err) {
            callback(err);
        } else {
            var out;
            var info;
            var mods = require('./modules-hook')(fpath);
            var plugins = [mods.plugin];
            if (fpath.match(/\.jsx\.html$/i)) {
                plugins.push(require('./jsx-view'));
            }

            try {
                var result = babel.transform(content, {
                    filename: fpath,
                    plugins: plugins,
                    presets: ['react'],
                    //presets: ['es2015','stage-0','react'],
                    comments: false,
                    compact: true,
                    sourceMaps: true,
                    highlightCode: false
                });
                info = {
                    dep:mods.dependencies,
                    path:mods.modPath,
                    source:fpath
                };
                if (plugins[1]) {
                    console.log(result.code);
                    process.exit(0);
                }
                var code = '$$$AWF_require$$$(' 
                        + JSON.stringify(mods.modName) 
                        + ', function(module, exports, require) {\n';
                code += result.code;
                code += '\n});\n';
                result.map = sourcemap.decode(result.map.mappings);
                _(result.map).each(function(line) {
                    _(line).each(function(item) {
                        if (item.length > 4)
                            item.splice(4);
                    });
                });
                result.map.push([]);
                result.map.unshift([]);
                out = {
                    code: code,
                    map: result.map,
                    source: content
                };
            } catch(err) {
                var loc = err.loc || {line:0,column:0};
                err = err.toString() + "\n" + err.codeFrame;
                console.warn(err);
                info = {
                    dep:[],
                    path:mods.modPath,
                    source:fpath
                };
                out = 'console.error(' + JSON.stringify(err) + ')\n';
                out = {
                    code: out,
                    map: [[
                        [0, 0, loc.line, loc.column],
                        [15, 0, loc.line, loc.column],
                        [out.length - 1, 0, loc.line, loc.column]
                        ]],
                    source: content
                }
            }
            info = JSON.stringify(info);
            out = JSON.stringify(out);
            callback = _.after(2, callback);
            fs.writeFile(path.join(relativeTo, target), out, callback);
            fs.writeFile(path.join(relativeTo, target) + '_info', info, callback);
        }
    });
}

if (process.env.IS_FORK) {
    process.on('message', function(job) {
        compile(job.fpath, job.target, function() {
            process.send(job.jobid);
        }, job.relativeTo);
    });
}
