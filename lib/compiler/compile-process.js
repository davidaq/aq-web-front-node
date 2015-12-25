"use strict";
var _ = require('underscore');
var path = require('path');

var SourceMap = require('./sourcemap');
var fsext = require('../fsext');

module.exports = CompileProcess;

function CompileProcess() {
    this.jsOutput = '';
    this.jsMap = new SourceMap();
    this.cssOutput = '';
    this.cssMap = new SourceMap();
    this.depdenecies = {};
    this.watches = {};
}

CompileProcess.derive = function(compileFunc) {
    if (typeof compileFunc != 'function') {
        throw new Error('Must provide a compile function!');
    }
    var ret = function() {
        CompileProcess.apply(this, arguments);
    };
    ret.prototype = compileFunc.prototype;
    ret.prototype.__proto__ = CompileProcess.prototype;
    ret.prototype._compileFunc = compileFunc;
    return ret;
}

/**
 * Begin the compile process as a promise
 */
CompileProcess.prototype.compile = function(opt) {
    this.opt = opt;
    this.watch(opt.relativePath);
    return new Promise(this._compile.bind(this));
};

CompileProcess.prototype._compile = function(callback) {
    this._callback = callback;
    try {
        this._compileFunc();
    } catch(e) {
        console.error(e.stack || e);
    }
};

CompileProcess.prototype.depends = function(mod) {
    this.depdenecies[mod] = 1;
};

CompileProcess.prototype.watch = function(fpath) {
    this.watches[fpath] = 1;
};

CompileProcess.prototype.success = function() {
    if (this.jsOutput) {
        if (!this.jsOutput.match(/\n\r?\s*$/)) {
            this.jsOutput += '\n';
        }
        this.jsOutput = '$$$AWF$$$.define(' 
                + JSON.stringify(this.opt.importPath) 
                + ', function(module, exports, require) {\n'
                + this.jsOutput
                + '});\n';
        this.jsMap.mappings.unshift([]);
        this.jsMap.mappings.push([]);
    }
    this._end();
};

CompileProcess.prototype.reject = function(msg, line, column) {
    if (msg instanceof Array) {
        for (var i = 0; i < msg.length; i++) {
            var item = msg[i];
            item.path = item.path || this.opt.relativePath;
            item.content = item.content || this.opt.sourceContent;
            item.line = item.line - 0 || 0;
            item.column = item.column - 0 || 0;
        }
        this._reject(msg);
    } else if (typeof msg == 'string') {
        this.reject([{message:msg, line:line, column: column}]);
    } else if (typeof msg == 'object') {
        this.reject([msg]);
    } else {
        console.log(msg);
        throw new Error('Bad call to reject');
    }
};

CompileProcess.prototype._reject = function(errors) {
    for (var i = 0; i < errors.length; i++) {
        var error = errors[i];
        var msg = 'console.error(' + JSON.stringify(error.message) + ');';
        this.jsOutput += msg;
        var idx = this.jsMap.addfile(error.path, error.content);
        this.jsMap.append([[
            [0, idx, error.line, error.column],
            [msg.length - 1, idx, error.line, error.column]
        ]]);
    }
    this._end();
};

CompileProcess.prototype._end = function() {
    var ret = this.opt;
    var target = ret.target;
    delete ret.extra;
    delete ret.target;

    ret.dep = Object.keys(this.depdenecies);
    ret.watch = Object.keys(this.watches);
    if (this.jsOutput) {
        ret.jsOutput = this.jsOutput;
        ret.jsMap = this.jsMap.toJSON();
    }
    if (this.cssOutput) {
        ret.cssOutput = this.cssOutput;
        ret.cssMap = this.cssMap.toJSON();
    }
    fsext.pack(target, ret).then(this._callback.bind(this));
};
