var fs = require('fs');
var path = require('path');
var _ = require('underscore');

var fsext = require('../fsext');
var CompileProcess = require('./compile-process');

module.exports = Compiler;

/**
 * `Compiler` is the class for compiling awfco (AWF Compiled Object).
 *
 * An instance of this class is responsible to compile (transpile) some type of
 * source to valid es5 script code along with bundled css, module dependency and
 * source map.
 *
 * This class should not be subclassed. Pass in a `compileFunc` when instantiating
 * instead.
 *
 * `compileFunc` is an function implementing specific compile process. It will be 
 * called as an object method, the object will contain the following property and
 * methods which may be accessed through this:
 *
 * opt: compiler input options with the following keys:
 *         moduleName : default import/export name for the module
 *         importPath : path of the module used for importing
 *       relativePath : path of the source file relative to project root
 *       absolutePath : system normalized absolute file path of the source file
 *      sourceContent : the text content of the source code
 *              extra : extra options that may be passed to the compiler
 *
 * success(): called on a successful compile, marks the end of compilation.
 *      Tip: set result on jsOutput, jsMap, cssOutput, cssMap defined on `this`
 *
 * reject(): called on failure (e.g. syntax error), marks the end of compilation.
 *      reject(message:string, line:number, column:number)
 *      reject(message:string, pos:Object<{path, content, line, column}>)
 *      reject(errors:Array)
 *
 * depends(): called if this compiled module logically depends on another compiled 
 *            module and that depended module should precede in the linking process.
 *      depends(moduleName:string)
 *
 * watch(): called if this compiled object should be recompiled when a source file
 *          other than the directly pointed one is changed.
 *      watch(sourceAbsolutePath:string)
 *
 * Tip: The `compileFunc` function call context object can be extended by extending 
 * the prototype property of the function.
 *
 * Hint: all line and column numbers are zero based
 **/
function Compiler(compileFunc) {
    if (typeof this != 'object' || !(this instanceof Compiler)) {
        return new Compiler(compileFunc);
    }
    this.CompileProcess = CompileProcess.derive(compileFunc);
}

/**
 * Compile `fpath` to `target`, with `dir` as project root
 * Return a promise
 */
Compiler.prototype.compile = function(fpath, target, dir, extra) {
    return new Promise(proc.bind(this));
    function proc(accept, reject) {
        if (typeof dir == 'object') {
            extra = dir;
            dir = '.';
        } else if (!dir) {
            dir = '.';
        }
        fs.readFile(fpath, 'utf-8', gotFile.bind(this));
		function gotFile(err, content) {
            if (err) {
                accept();
            } else {
                var opt = {};
                opt.relativePath = fsext.normalizePath(path.relative(dir, fpath));
                opt.absolutePath = fsext.normalizePath(path.resolve(fpath));
                opt.target = fsext.normalizePath(path.resolve(target));
                opt.moduleName = Compiler.moduleName(opt.relativePath);
                opt.importPath = Compiler.importPath(opt.relativePath);
                opt.extra = extra || {};
                opt.sourceContent = content;
                var compileProcess = new (this.CompileProcess)();
                compileProcess.compile(opt).then(accept).catch(function(err) {
                    console.warn(err.stack);
                });
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
    return fsext.normalizePath(ret);
};
