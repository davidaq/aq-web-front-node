var path = require('path');
var fs = require('fs');
var sourcemap = require('sourcemap-codec');
var Sass = require('./libsass');
var uuid = require('uuid').v4;

module.exports = compile;

var reuselist = [];

function compile(inOpt, success, reject) {
    var sass = reuselist.pop();
    if (!sass) {
        sass = new Sass();
        sass.options({
            style: 'compressed'
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
        var vpath = request.resolved;
        if (vpath[0] == '/' || vpath[0] == '\\') {
            vpath = vpath.substr(1);
        }
        var dir = path.dirname(vpath);
        var inc = path.basename(vpath);
        var candidates = [];
        candidates.push(path.join(dir, inc));
        candidates.push(path.join(dir, '_' + inc));
        candidates.push(path.join(dir, inc + '.scss'));
        candidates.push(path.join(dir, '_' + inc + '.scss'));
        candidates.push(path.join(dir, inc + '.sass'));
        candidates.push(path.join(dir, '_' + inc + '.sass'));
        candidates.push(path.join(dir, inc + '.css'));
        candidates.push(path.join(dir, '_' + inc + '.css'));
        candidates.push(path.join(dir, inc + '/index.scss'));
        candidates.push(path.join(dir, inc + '/_index.scss'));
        candidates.push(path.join(dir, inc + '/index.sass'));
        candidates.push(path.join(dir, inc + '/_index.sass'));
        candidates.push(path.join(dir, inc + '/index.css'));
        candidates.push(path.join(dir, inc + '/_index.css'));
        vpath = vpath.replace(/[\/\\]+/, '/');
        if (contents[vpath]) {
            callback({
                content:contents[vpath]
            });
        } else {
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
                            contents[vpath] = content;
                            callback({
                                content:content
                            });
                        }
                    });
                }
            })();
        }
    });

    contents[inOpt.relativePath] = inOpt.sourceContent;
    var wrapName = uuid();
    wrapName = new Buffer(wrapName.replace('-'), 'hex').toString('base64');
    wrapName = wrapName.replace(/=+$/, '')
        .replace('+', '_0')
        .replace(/[^a-zA-Z0-9_]/, '_1');
    wrapName = '_AQW_' + wrapName;
    var inContent = inOpt.sourceContent;
    inContent = '.' + wrapName + '{ ' + inContent + ' }';
    sass.compile(inContent, {
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
            var map = sourcemap.decode(result.map.mappings);
            var nmap = {
                map:map,
                source:[]
            };
            for (var i = 0; i < result.map.sources.length; i++) {
                var spath = result.map.sources[i];
                spath = spath.replace(/[\/\\]+/, '/');
                nmap.source.push({
                    path: spath,
                    content: contents[spath]
                });
            }
            var text = result.text;
            var smap = new Buffer(JSON.stringify(result.map)).toString('base64');
            text += '\n\n/*# sourceMappingURL=data:application/json;base64,' + smap + ' */'
            text = 'return $$$AWF$$$.stylesheet(' + JSON.stringify(wrapName) + '\n,' + JSON.stringify(text) + '\n);'
            success(text, nmap);
        }
    });
}

