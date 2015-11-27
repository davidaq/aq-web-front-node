"use strict";

var path = require('path');
var EventEmitter = require('events').EventEmitter;
var chokidar = require('chokidar');

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

        fnodes[fpath] = item;
        signalChange(item);
    }).on('change', function(fpath) {
        var fnode = fnodes[fpath];
        if (fnode) {
            fnode.time = new Date().getTime();
            signalChange(fnode);
        }
    }).on('unlink', function(fpath) {
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
    function result() {
        var ret = []
        var check = ext[0] == '.' ? ext : '.' + ext;
        for (var fpath in fnodes) {
            var fnode = fnodes[fpath];
            if (fnode && fpath.substr(fpath.length - check.length).toLowerCase() == check) {
                ret.push(fnode);
            }
        }
        return ret;
    }
    return new Promise(function(resolve, reject) {
        if (ready) {
            resolve(result());
        } else {
            ev.on('ready', function() {
                resolve(result());
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


function fetch(fpath) {
    return fnodes[fpath] || null;
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

