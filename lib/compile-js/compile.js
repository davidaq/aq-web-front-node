var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var babel = require('babel-core');
var sourcemap = require('sourcemap-codec');

module.exports = compile;

console.log('Initialize JS compiler');
require('babel-preset-react');
console.log('Loaded react syntax');
require('babel-preset-stage-0');
console.log('Loaded JavaScript sugars');
var es2015 = [
    'arrow-functions',
    'block-scoped-functions',
    'block-scoping',
    'classes',
    'computed-properties',
    'constants',
    'destructuring',
    'for-of',
    'function-name',
    'literals',
    'object-super',
    'parameters',
    'shorthand-properties',
    'spread',
    'sticky-regex',
    'template-literals',
    'typeof-symbol',
    'unicode-regex',
    [
        require('babel-plugin-transform-es2015-modules-commonjs'),
        {allowTopLevelThis:true}
    ]
];
for (var k in es2015) {
    if (es2015[k] instanceof Array) {
        continue;
    }
    console.log(es2015[k]);
    es2015[k] = require('babel-plugin-transform-es2015-' + es2015[k]);
}
console.log('Loaded ES2015 syntax');

console.log('JS compiler ready');

function compile(fpath, target, callback, relativeTo) {
    if (!relativeTo) {
        relativeTo = '.';
    }
    fs.readFile(path.join(relativeTo, fpath), 'utf-8', function(err, content) {
        if (err) {
            callback(err);
        } else {
            var out;
            var mods = require('./modules-hook')(fpath.replace(/\.jsx\.html$/i, '.js'));
            var plugins = [mods.plugin].concat(es2015);
            var jsx = fpath.match(/\.jsx(\.html)?$/i);
            if (jsx) {
                plugins.push(require('./jsx-view')());
                mods.dependencies.push('View');
            }
            try {
                var result = babel.transform(content, {
                    filename: fpath,
                    plugins: plugins,
                    presets: ['stage-0','react'],
                    comments: false,
                    compact: true,
                    sourceMaps: true,
                    highlightCode: false
                });
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
            var info = {
                dep:mods.dependencies,
                path:mods.modPath,
                source:fpath
            };
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
