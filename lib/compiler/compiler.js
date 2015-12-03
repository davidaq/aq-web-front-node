var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var fsext = require('../fsext');

module.exports = Compiler;

/**
 * `Compiler` is the class for compiling jco (JavaScript Compiled Object).
 * An instance of this class is responsible to compile (transpile) some type of
 * source to valid es5 script code along with module dependency and source map.
 *
 * This class should not be subclassed, but to pass in a `compileFunc ` instead.
 *
 *
 * `compileFunc` is an async function implementing specific compile process: 
 *      compileFunc(opt:KeyValue, success:Function, reject:Function)
 *
 * `opt` is the compiler input with the following keys:
 *         moduleName : default import/export name for the module
 *         importPath : path of the module used for importing
 *       relativePath : path of the source file relative to project root
 *       absolutePath : system normalized absolute file path of the source file
 *      sourceContent : the text content of the source code
 *              extra : extra options that may be passed to the compiler
 *
 * `success` is the callback function called on successful compile:
 *      success(outputCode:string, sourceMap:Array, dependency:Array)
 *
 * `reject` is the callback function called on failure (e.g. syntax error):
 *      reject(message:string, line:number, column:number)
 *      reject(message:string, pos:Object<{path, content, line, column}>)
 *      reject(errors:Array)
 *
 *  Line and column numbers are zero based
 **/
function Compiler(compileFunc) {
    if (typeof this != 'object' || !(this instanceof Compiler)) {
        return new Compiler(compileFunc);
    }
    if (typeof compileFunc != 'function') {
        throw new Error('Must provide a compile function!');
    }
    this.compileFunc = compileFunc;
}

/**
 * Compile `fpath `to `target`, with `dir` as project root
 * Return a promise
 */
Compiler.prototype.compile = function(fpath, target, dir, extra) {
    var self = this;
    return new Promise(proc);
    function proc(accept, reject) {
        if (typeof dir == 'object') {
            extra = dir;
            dir = '.';
        } else if (!dir) {
            dir = '.';
        }
        fs.readFile(fpath, 'utf-8', gotFile);
		function gotFile(err, content) {
            if (err) {
                accept();
            } else {
                var opt = {};
                opt.relativePath = normalizePath(path.relative(dir, fpath));
                opt.absolutePath = normalizePath(path.resolve(fpath));
                opt.moduleName = Compiler.moduleName(opt.relativePath);
                opt.importPath = Compiler.importPath(opt.relativePath);
                opt.extra = extra || {};
                opt.sourceContent = content;
                self.compileFunc(opt, success, error);
                function success(output, map, dependency) {
                    output = '$$$AWF$$$.define(' 
                            + JSON.stringify(opt.importPath) 
                            + ', function(module, exports, require) {\n'
                            + output
                            + '\n});\n';
                    map = map || [];
                    var sources = [];
                    if (typeof map == 'object' && !(map instanceof Array)) {
                        sources = map.source;
                        map = map.map;
                    }
					var nmap = [];
                    var lastLine;
                    nmap.push(lastLine = [[0,0,0,0]]);
                    _(map).each(function(line) {
                        _(line).each(function(item) {
                            if (item.length > 4)
                                item.splice(4);
                        });
                        nmap.push(lastLine = line);
                    });
                    nmap.push(lastLine);
                    nmap.sources = sources;
					result(output, nmap, dependency);
                }
                function error(msg, line, column) {
                    if (msg instanceof Array) { 
                        var output = '';
                        var sourceIndexMap = {};
                        var sourceIndex = 0;
                        var map = [];
                        map.sources = [];
                        for (var i = 0; i < msg.length; i++) {
                            var item = msg[i];
                            var idx = 0;
                            if (typeof item.line == 'object') {
                                var sitem = item.line;
                                item.line = sitem.line - 0 || 0;
                                item.column = sitem.column - 0 || 0;
                                idx = sourceIndexMap[sitem.path];
                                if (!idx) {
                                    idx = sourceIndexMap[sitem.path] = sourceIndex++;
                                    map.sources[idx] = {
                                        path: sitem.path,
                                        content: sitem.content
                                    };
                                }
                            } else {
                                item.line = item.line - 0 || 0;
                                item.column = item.column - 0 || 0;
                                idx = sourceIndexMap[opt.relativePath];
                                if (!idx) {
                                    idx = sourceIndexMap[opt.relativePath] = sourceIndex++;
                                    map.sources[idx] = {
                                        path: opt.relativePath,
                                        content: opt.sourceContent
                                    };
                                }
                            }
                            output += 'console.error(' + JSON.stringify(item.message) + ');\n';
                            map.push([
                                [0, idx, item.line, item.column],
                                [output.length - 1, idx, item.line, item.column]
                            ]);
                        }
                        result(output, map);
                    } else {
                        error([{message:msg, line:line, column:column}]);
                    }
                }
				function result(output, map, dependency) {
                    var ret = opt;
                    delete ret.extra;
                    ret.dep = _.unique(dependency || []);
                    console.log(map.sources);
                    if (map.sources && map.sources.length > 0) {
                        ret.sources = map.sources;
                        map = map.slice(0);
                        for (var i = 0; i < ret.sources.length; i++) {
                            ret.sources[i].content += '\n\n// ' + ret.sources[i].path;
                        }
                    } else {
                        ret.sourceContent += '\n\n// ' + ret.relativePath;
                    }
					ret.output = output;
					ret.map = map;
                    fsext.pack(target, ret).then(accept);
                    console.log(ret);
				}
            }
        }
    };
};

Compiler.moduleName = function(fpath) {
    var path = require('path');
    var name = path.basename(fpath);
	name = name.split('.')[0] || '';
    name = name.replace(/[^$a-zA-Z0-9_$]+/g, '_');
    if (name.match(/^[0-9]/))
        name = '_' + name;
    return name;
};

Compiler.importPath = function(fpath, contextPath) {
    var ret = fpath;
	var isRelative = !!ret.match(/\.\.?[\/\\]/);
	var name = Compiler.moduleName(ret);
	ret = path.dirname(ret);
    if (name != 'index') {
        ret = path.join(ret, name);
    }
    if (contextPath && isRelative) {
		ret = path.join(path.dirname(contextPath), ret);
    }
    return normalizePath(ret);
};

function normalizePath(fpath) {
    return path.normalize(fpath).replace(/\\+/g, '/');
}