var path = require('path');
var fs = require('fs');
var uuid = require('uuid').v4;
var Sass = require('./libsass');
var fsext = require('../../fsext');

module.exports = compile;

var reuselist = [];

function compile() {
    var inOpt = this.opt;
    var sass = reuselist.pop();
    if (!sass) {
        sass = new Sass();
        sass.options({
            style: 'compressed'
        });
    }
    var self = this;
    function success() {
        sass.clearFiles(function() {
            reuselist.push(sass);
        });
        self.success.apply(self, arguments);
    }
    function reject() { 
        sass.clearFiles(function() {
            reuselist.push(sass);
        });
        self.reject.apply(self, arguments);
    }

    var rootDir = path.normalize(inOpt.absolutePath).replace(
        path.normalize(inOpt.relativePath), ''
    );

    var contents = {};
    var nameMap = {};
    
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
        vpath = fsext.normalizePath(vpath);
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
                            nameMap[vpath] = fpath;
                            console.log('FEED', content);
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
    wrapName += '-' + inOpt.moduleName;
    wrapName = wrapName.replace(/=/g, '')
        .replace(/\+/g, '_0')
        .replace(/[^a-zA-Z0-9_\-]/g, '_1');
    wrapName = '_AQW_' + wrapName;
    var inContent = inOpt.sourceContent;
    inContent = '.' + wrapName + '{ ' + inContent + ' }';
    sass.compile(inContent, {
        inputPath: inOpt.relativePath,
        indentedSyntax: !!inOpt.relativePath.match(/\.sass$/i)
    }, function(result) {
        if (result.status) {
            if (result.file) {
                if (result.file == inOpt.relativePath 
                    && result.column && result.line === 1) {
                    result.column -= wrapName.length + 3;
                }
                reject({
                    message: result.formatted,
                    path: nameMap[result.file] || result.file,
                    content: contents[result.file] || '',
                    line: result.line - 1 || 0,
                    column: result.column - 1 || 0
                });
            } else {
                reject(result.formatted || 'Unknow error');
            }
        } else {
            self.jsOutput = 'module.exports=' + JSON.stringify(wrapName) + ';\n';
            self.jsMap.mappings.push([]);

            self.cssOutput = result.text;
            var nmap = {
                file: [],
                content: [],
                mappings: result.map.mappings
            }
            for (var i = 0; i < result.map.sources.length; i++) {
                var spath = fsext.normalizePath(result.map.sources[i]);
                nmap.file.push(spath);
                nmap.content.push(contents[spath] || '');
            }
            self.cssMap.append(nmap);
            success();
        }
    });
}

