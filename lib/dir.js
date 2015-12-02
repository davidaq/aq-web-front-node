"use strict";

var path = require('path');
var EventEmitter = require('events').EventEmitter;
var chokidar = require('chokidar');
var fs = require('fs');

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

function all(ext) {
    return onready(result);
    function result() {
        var ret = []
        var check = {};
        var firstCheck = {};
        if (!(ext instanceof Array)) {
            ext = [ext];
        }
        for (var i = 0; i < ext.length; i++) {
            var item = ext[i];
            item[0] == '.' ? item.substr(1) : item;
            check[item] = 1;
            firstCheck[item.split('.').pop()] = 1;
        }
        for (var fpath in fnodes) {
            var fnode = fnodes[fpath];
            if (fnode) {
                var fext = path.basename(fpath).split('.');
                if (firstCheck[fext[fext.length - 1]]) {
                    for (var i = 1; i < fext.length; i++) {
                        var find = fext.slice(i).join('.');
                        if (check[find]) {
                            ret.push(fnode);
                            break;
                        }
                    }
                }
            }
        }
        return ret;
    }
}

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

function onchange(ext, func) {
    onevent(ext, func, 'changed');
}

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

module.exports = {
    all:all,
    onchange:onchange,
    onunlink:onunlink,
    fetch:fetch,
    close:close
};

