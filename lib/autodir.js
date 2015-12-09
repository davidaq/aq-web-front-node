"use strict";

var path = require('path');
var EventEmitter = require('events').EventEmitter;
var chokidar = require('chokidar');
var fs = require('fs');
var fsext = require('./fsext');
var State = require('./State');

function AutoDir(options) {
    EventEmitter.call(this);

    this.innerEvent = new EventEmitter();

    this._readyState = new State();
    this._beginState = new State();
    this._fnodes = {};
    this._mapping = {};

    setTimeout((function() {
        this.watcher = chokidar.watch('.', {
            ignored: this._isIgnored.bind(this),
            persistent: 'persistent' in options ? !!options.persistent : true,
            depth: 9,
            ignorePermissionErrors: true,
            atomic: true
        })
        .on('add', (function(fpath, stat) {
            var fnode = new Fnode(this, fpath, stat, false);
            this.on('init', fnode);
        }).bind(this))
        .on('change', (function(fpath) {
            var fnode = new Fnode(this, fpath, null, true);
            this.on('change', fnode);
        }).bind(this))
        .on('unlink', (function() {

        }).bind(this))
        .on('ready', (function() {

        }).bind(this));
    }).bind(this), 1);
}

AutoDir.prototype.__proto__ = EventEmitter.prototype;

AutoDir.prototype.ignore = function(fpath) {

};

AutoDir.prototype.close = function() {

};

AutoDir.prototype.fetch = function(fpath, cb) {

};

AutoDir.prototype.ready = function(cb) {
    this._readyState.run(cb);
};

function Fnode(autoDir, fpath, stat, emit) {
    fpath = fsext.normalizePath(fpath);
    var existing = autoDir._fnodes[fpath];
    if (existing) {
        existing.update(stat, emit);
        return existing;
    } else {
        var fname = path.basename(fpath);
        this.autoDir = autoDir;
        this.path = fpath;
        this.name = fname;
        this.ext = fname.split('.').slice(1);
        this.chain = {};
        this.watches = {};
        this.update(stat, emit);
    }
}

Fnode.prototype.update = function(stat, emit) {
    if (stat) {
        this.time = Math.max(stat.ctime.getTime(), stat.mtime.getTime());
    } else {
        this.time = Date.now();
    }
    if (this.emit) {
        this.autoDir.emit('update', this);
        var source = this.autoDir._mapping[this.path];
        if (source) {
            this.autoDir.emit('dirty', this, source);
        }
    }
};

Fnode.prototype.compilesTo = function(fpath) {
    this.autoDir._mapping[fpath] = this;
};

Fnode.prototype.watch = function(fpath) {
    this.watches[fpath] = 1;
    this.autoDir.fetch(fpath, (function(fnode) {
        if (fnode) {
            fnode.chain[this.path] = 1;
        } else {
            fs.unlink(this.path, function() {});
        }
    }).bind(this));
};

Fnode.prototype.clearWatch = function() {
    for (var k in this.watches) {
        this.autoDir.fetch(k, (function(fnode) {
            delete fnode.chain[this.path];
        }).bind(this));
    }
    this.watches = {};
};





var fnodes = {};
var ev = new EventEmitter();
var ready = false;
var watcher;
var extMapping = {};

setTimeout(function watch() {
    watcher = chokidar.watch('.', {
        ignored: isIgnored,
        persistent: true,
        depth: 9,
        ignorePermissionErrors: true,
        atomic: true
    }).on('add', function(fpath, stat) {
        signalChange(makeFNode(fpath, stat));
    }).on('change', function(fpath) {
        fpath = fpath.replace(/\\+/g, '/');
        var fnode = fnodes[fpath];
        if (fnode) {
            fnode.time = new Date().getTime();
            signalChange(fnode);
        }
    }).on('unlink', function(fpath) {
        fpath = fpath.replace(/\\+/g, '/');
        var fnode = fnodes[fpath];
        if (fnode) {
            delete fnodes[fpath];
            ev.emit('action', 'unlinked', fnode);
        }
    }).on('ready', function() {
        ready = true;
        ev.emit('ready');
    });
}, 10);

function makeFNode(fpath, stat) {
    fpath = fpath.replace(/\\+/g, '/');
    if (fnodes[fpath]) {
        var item = fnodes[fpath];
        if (stat) {
            item.time = Math.max(stat.ctime.getTime(), stat.mtime.getTime());
        } else {
            item.time = new Date().getTime();
        }
        return item;
    } else {
        var fname = path.basename(fpath);
        var item = {};
        item.path = fpath;
        item.name = fname;
        if (stat) {
            item.time = Math.max(stat.ctime.getTime(), stat.mtime.getTime());
        } else {
            item.time = new Date().getTime();
        }

        item.ext = fname.split('.');
        item.ext.shift();

        return fnodes[fpath] = item;
    }
}


function signalChange(fnode) {
    ev.emit('action', 'changed', fnode);
}

ev.on('action', function(evname, fnode) {
    for (var i = 0; i < fnode.ext.length; i++) {
        var ext = fnode.ext.slice(i).join('.');
        var map = extMapping[ext];
        if (map && map[evname]) {
            map[evname](fnode);
            break;
        }
    }
});

exports.all = all;
function all(ext) {
    return onready(result);
    function result() {
        var ret = [];
        ext = new fsext.ExtChecker(ext);
        for (var fpath in fnodes) {
            var fnode = fnodes[fpath];
            if (fnode && ext.match(fpath)) {
                ret.push(fnode);
            }
        }
        return ret;
    }
}

exports.onready = onready;
function onready(func) {
    return new Promise(function(resolve, reject) {
        if (ready) {
            resolve(func());
        } else {
            ev.on('ready', function() {
                resolve(func());
            });
        }
    });
}

exports.onchange = onchange;
function onchange(ext, func) {
    onevent(ext, func, 'changed');
}

exports.onunlink = onunlink;
function onunlink(ext, func) {
    onevent(ext, func, 'unlinked');
}

function onevent(ext, func, evname) {
    if (ext instanceof Array) {
        for(var i = 0; i < ext.length; i++) {
            onevent(ext[i], func, evname);
        }
    } else {
        if (typeof ext == 'function') {
            func = ext;
            ext = null;
        }
        var map = extMapping[ext];
        if (!map) {
            extMapping[ext] = map = {};
        }
        map[evname] = func;
    }
}

exports.fetch = fetch;
function fetch(fpath, async) {
    var ret =  fnodes[fpath] || null;
    if (typeof async == 'function') {
        if (ret) {
            async(ret);
        } else {
            fs.stat(fpath, function(err, stat) {
                if (err || !stat) {
                    async(null);
                } else {
                    async(makeFNode(fpath, stat));
                }
            });
        }
    }
    return ret;
}

exports.close = close;
function close() {
    watcher.close();
}

var ignores = {
    'node_modules':1,
    'log':1
};
function isIgnored(fpath) {
    if (fpath == '.')
        return false;
    var fname = path.basename(fpath);
    if (fname[0] == '.' || fname in ignores) {
        return true;
    }
    return false;
}

