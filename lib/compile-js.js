var fs = require('fs');
var path = require('path');
var tsc = require('typescript-compiler');

module.exports.compile = function(fpath, target, raw, callback) {
    if (typeof raw == 'function') {
        callback = raw;
        raw = false;
    }
    fs.readFile(fpath, 'utf-8', function(err, content) {
        if (err) {
            callback(err);
        } else {
            var out;
            parseImport(content);
            if (raw) {
                out = content;
            } else {
                var input = {};
                input[fpath + '.FAKE_FILE_NAME.ts'] = content;

                out = tsc.compileStrings(input, '', '', function(err) {
                    err = err.formattedMessage;
                    err = err.replace(/\.FAKE_FILE_NAME\.ts/g, '');
                    console.warn(err);
                });
            }
            fs.writeFile(target, out, callback);
        }
    });
};

module.exports.link = function(flist, target, callback) {

};
