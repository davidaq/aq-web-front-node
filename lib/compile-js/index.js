var fs = require('fs');
var path = require('path');
var babel = require('babel-core');

console.log('Initialize JS compiler');
require('babel-preset-react');
console.log('Loaded react syntax');
require('babel-preset-stage-0');
console.log('Loaded JavaScript sugars');
require('babel-preset-es2015');
console.log('Loaded ES2015 syntax');

console.log('JS compiler ready');


module.exports.compile = function(fpath, target, callback) {
    fs.readFile(fpath, 'utf-8', function(err, content) {
        if (err) {
            callback(err);
        } else {
            var out;
            try {
                var modules = require('./modules-hook')(fpath);
                var result = babel.transform(content, {
                    filename: fpath,
                    plugins: [modules.plugin],
                    presets: ['es2015','stage-0','react'],
                    compact: true,
                    sourceMaps: true
                });
                out = {
                    code:result.code,
                    map:result.map,
                    dep:modules.dependencies
                };
            } catch(err) {
                err = err.toString() + "\n" + err.codeFrame;
                console.warn(err);
                out = {
                    code:'console.error(' + JSON.stringify(err) + ')',
                    map:{},
                    dep:[]
                };
            }
            out = JSON.stringify(out);
            fs.writeFile(target, out, callback);
        }
    });
};

module.exports.link = function(flist, target, callback) {
    var loaded = {};
    for (var k in flist)
    console.log('Link', flist);
};
