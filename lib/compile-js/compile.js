var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var babel = require('babel-core');

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

function compile(fpath, target, callback) {
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
                    //presets: ['es2015'],//,'stage-0','react'],
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
}
