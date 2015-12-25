var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');

module.exports = auto;

function auto(callback) {
    var pwd = path.resolve('.');
    search(pwd, function(list) {
        if (list.length == 0) {
            backtrace(pwd, watch);
        } else {
            watch(list);
        }
    });
}

function watch(dir) {
    if (dir instanceof Array) {
        for (var i = 0; i < dir.length; i++) {
            watch(dir[i]);
        }
        return;
    }
    var cp = childProcess.fork(require.resolve('./watch'), {
        cwd: dir
    });
}

function search(item, callback, depth) {
    if (path.basename(item).match(/^\.+[^\.]/)) return;
    var context = this.searchCounter ? this : {
        searchCounter: 0,
        found: [],
        callback: callback
    };
    context.searchCounter++;
    depth = depth || 0;
    var end = searchEnd.bind(context);
    fs.stat(item, function(err, stat) {
        if (err) return end();
        if (stat.isDirectory()) {
            fs.stat(path.join(item, 'awf.conf'), function(err, stat) {
                if (!err && stat && !stat.isDirectory()) {
                    context.found.push(item);
                    end();
                } else if (depth < 5) {
                    depth++;
                    fs.readdir(item, function(err, list) {
                        if (!err && list && list.length < 200) {
                            for (var i = 0; i < list.length; i++) {
                                search.call(context, path.join(item, list[i]), 0, depth);
                            }
                        }
                        end();
                    });
                } else {
                    end();
                }
            });
        } else {
            end();
        }
    });
}

function searchEnd() {
    this.searchCounter--;
    if (this.searchCounter == 0) {
        this.callback(this.found);
    }
}

function backtrace(dir, callback) {
    fs.stat(path.join(dir, 'awf.conf'), function(err, stat) {
        if (!err && stat) {
            callback(dir);
        } else {
            backtrace(path.dirname(dir), callback);
        }
    });
}
