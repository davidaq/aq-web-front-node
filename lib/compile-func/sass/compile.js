var path = require('path');
var fs = require('fs');
var Sass = require('./libsass');
var uuid = require('uuid').v4;

module.exports = compile;

var reuselist = [];

function compile(inOpt, success, reject) {
    var sass = reuselist.pop();
    if (!sass) {
        sass = new Sass();
        sass.options({
            style: 'compact'
        });
    }
    var osuccess = success;
    success = function() {
        sass.clearFiles(function() {
            reuselist.push(sass);
        });
        osuccess.apply(this, arguments);
    };
    var oreject = reject;
    reject = function() {
        sass.clearFiles(function() {
            reuselist.push(sass);
        });
        oreject.apply(this, arguments);
    };

    var rootDir = path.normalize(inOpt.absolutePath).replace(
        path.normalize(inOpt.relativePath), ''
    );

    var contents = {};
    
    sass.importer(function(request, callback) {
        var dir = path.dirname(request.previous);
        dir = path.join(dir, path.dirname(request.current));
        var inc = path.basename(request.current);
        var candidates = [];
        candidates.push(path.join(dir, inc));
        candidates.push(path.join(dir, inc + '.scss'));
        candidates.push(path.join(dir, inc + '.sass'));
        candidates.push(path.join(dir, inc + '.css'));
        candidates.push(path.join(dir, '_' + inc));
        candidates.push(path.join(dir, '_' + inc + '.scss'));
        candidates.push(path.join(dir, '_' + inc + '.sass'));
        candidates.push(path.join(dir, '_' + inc + '.css'));
        (function next() {
            var fpath = candidates.shift();
            if (!fpath) {
                callback({
                    error: 'Can not find importable file.'
                });
            } else {
                fs.readFile(path.join(rootDir, fpath), function(err, content) {
                    if (err) {
                        next();
                    } else {
                        content = content.toString('utf-8');
                        contents[request.current] = content;
                        callback({
                            content:content
                        });
                    }
                });
            }
        })();
        console.log(request);
    });

    contents[inOpt.relativePath] = inOpt.sourceContent;
    var wrapName = uuid();
    wrapName = new Buffer(wrapName.replace('-'), 'hex').toString('base64');
    wrapName = wrapName.replace('=', '')
        .replace('+', '_')
        .replace(/[^a-zA-Z0-9_]/, '-');
    wrapName = '-AQW-' + wrapName;
    var inContent = inOpt.sourceContent;
    inContent = '.' + wrapName + '{' + inContent + '}';
    sass.compile(inOpt.sourceContent, {
        inputPath: inOpt.relativePath,
        indentedSyntax: !!inOpt.relativePath.match(/\.sass$/i)
    }, function(result) {
        if (result.status) {
            if (result.file == inOpt.relativePath 
                && result.column && result.line === 1) {
                result.column -= wrapName.length + 2;
            }
            if (result.file) {
                reject(result.formatted, {
                    path: result.file,
                    content: contents[result.file] || '',
                    line: result.line - 1 || 0,
                    column: result.column - 1 || 0
                });
            } else {
                reject(result.formatted, result.line - 1 || 0, result.column - 1 || 0);
            }
        } else {
            success('', [[[0,0,0,0]]]);
        }
        console.log(result);
    });
}

