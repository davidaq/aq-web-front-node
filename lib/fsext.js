var fs = require('fs');
var path = require('path');
var _ = require('underscore');

var NUMBER = 0;
var STRING = 1;
var OBJECT = 2;

exports.pack = function(fpath, kv) {
    return new Promise(function(callback) {
        callback = _.once(callback);
        var outStream = fs.createWriteStream(fpath);
        outStream.on('error', callback);
        var markBuffer = new Buffer(5);
        var index = {};
        var pos = 0;
        var content = _(kv).map(function(v, k) {
            if (typeof v == 'number') {
                var buff = new Buffer(8);
                buff.writeDoubleLE(v);
                index[k] = [NUMBER, pos, buff.length];
                pos += buff.length;
                return buff;
            } else {
                var t = STRING;
                if (typeof v == 'object') {
                    v = JSON.stringify(v);
                    t = OBJECT;
                }
                if (v.length > 0) {
                    var buff = new Buffer(v.toString(), 'utf-8');
                    index[k] = [t, pos, buff.length];
                    pos += buff.length;
                    return buff;
                } else {
                    return null;
                }
            }
        }).filter(function(v) {
            return v !== null;
        });
        var write = exports.writeStream;
        var buffer = new Buffer(JSON.stringify(index), 'utf-8');
        var lenBuffer = new Buffer(2);
        lenBuffer.writeUInt16LE(buffer.length);
        write(outStream, lenBuffer).then(function() {
            return write(outStream, buffer);
        }).then(function() {
            return new Promise(function(done) {
                (function next() {
                    var buff = content.shift();
                    if (buff) {
                        write(outStream, buff).then(next);
                    } else {
                        done();
                    }
                })();
            });
        }).then(function() {
            outStream.once('finish', callback)
            outStream.end();
        }).catch(warn);
    });
};

exports.unpack = function(fpath, kv) {
    return new Promise(function(callback) {
        callback = _.once(callback);
        fs.open(fpath, 'r', function(err, fd) {
            if (err) {
                callback(kv, err);
            } else {
                var indexLen;
                read(0, 2).then(function(buffer) {
                    indexLen = buffer.readUInt16LE();
                    return read(2, indexLen);
                }).then(function(buffer) {
                    var index = JSON.parse(buffer);
                    var list = _(Object.keys(index)).filter(function(k) {
                        return k in kv;
                    }).sort(function(a, b) {
                        return index[a].pos - index[b].pos;
                    });
                    indexLen += 2;
                    return new Promise(function(done) {
                        (function next() {
                            var item = list.shift();
                            if (item) {
                                var key = item;
                                item = index[key];
                                read(indexLen + item[1], item[2]).then(function(buffer) {
                                    if (item[0] == NUMBER) {
                                        kv[key] = buffer.readDoubleLE();
                                    } else {
                                        kv[key] = buffer.toString('utf-8');
                                        if (item[0] == OBJECT) {
                                            kv[key] = JSON.parse(kv[key]);
                                        }
                                    }
                                    next();
                                }).catch(warn);
                            } else {
                                done();
                            }
                        })();
                    });
                }).then(function() {
                    fs.close(fd, function() {
                        callback(kv);
                    });
                }).catch(warn);
                function read(pos, len) {
                    return new Promise(function(accept) {
                        var buffer = new Buffer(len);
                        fs.read(fd, buffer, 0, len, pos, function(err, bytesRead, buffer) {
                            if (err) {
                                fs.close(fd);
                                callback(kv, err);
                            } else {
                                accept(buffer);
                            }
                        });
                    });
                }
            }
        });
    });
};

exports.writeStream = function(stream, content) {
    return new Promise(function(next) {
        if (stream.write(content)) {
            next();
        } else {
            stream.once('drain', next);
        }
    });
};

exports.normalizePath = function(fpath) {
    return path.normalize(fpath).replace(/\\+/g, '/');
};

exports.isExt = function(fpath, ext) {
    return (new ExtChecker(ext)).match(fpath);
};

exports.ExtChecker = ExtChecker;
function ExtChecker(ext) {
    if (!(ext instanceof Array)) {
        ext = [ext];
    }
    this.full = {};
    this.first = {};
    for (var i = 0; i < ext.length; i++) {
        var item = ext[i];
        item = item[0] == '.' ? item.substr(1) : item;
        this.full[item] = 1;
        this.first[item.split('.').pop()] = 1;
    }
}

ExtChecker.prototype.match = function(fpath) {
    var fext = path.basename(fpath).split('.');
    if (this.first[fext[fext.length - 1]]) {
        for (var i = 1; i < fext.length; i++) {
            var find = fext.slice(i).join('.');
            if (this.full[find]) {
                return true;
            }
        }
    }
    return false;
};

function warn(err) {
    if (err.stack) {
        console.warn(err.stack);
    } else {
        console.warn(err);
    }
}
