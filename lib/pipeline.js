path = require('path');

module.exports = Pipeline;

function Pipeline() {
    this.queue = [];
    this.map = {};
    this.methods = {};
    this.idle = true;
    this.isReady = false;
}

Pipeline.prototype.push = function(input) {
    this.queue.push(input);
    if (!this.map[input]) {
        this.map[input] = 1;
    } else {
        this.map[input]++;
    }
    if (this.isReady && this.idle) {
        this._next();
    }
};

Pipeline.prototype.ready = function() {
    if (this.isReady) return;
    this.isReady = true;
    if (this.isReady && this.idle) {
        this._next();
    }
};

Pipeline.prototype.runFor = function(ext, func) {
    if (ext instanceof Array) {
        for (var i = 0; i < ext.length; i++) {
            this.runFor(ext[i], func);
        }
    } else {
        if (ext[0] == '.')
            ext = ext.substr(1);
        this.methods[ext] = func;
    }
};

Pipeline.prototype._next = function() {
    this.idle = false;
    if (this.queue.length == 0) {
        this.map = {};
        this.idle = true;
    } else {
        var item = this.queue.shift();
        if (this.map[item]) {
            this.map[item]--;
        }
        if (this.map[item]) {
            this._next();
        } else {
            delete this.map[item];
            var next = true;
            if (item[0] == '@') {
                var method = this.methods[item];
                if (method) {
                    next = false;
                    this._call(method, item);
                }
            } else {
                var name = path.basename(item);
                var ext = name.split('.');
                if (ext.length > 1) {
                    ext.shift();
                } else {
                    ext = [''];
                }
                for (var i = 0; next && i < ext.length; i++) {
                    var key = ext.slice(i).join('.');
                    var method = this.methods[key];
                    if (method) {
                        next = false;
                        this._call(method, item);
                    }
                }
            }
            if (next) {
                this._next();
            }
        }
    }
};

Pipeline.prototype._call = function(method, item) {
    var self = this;
    setTimeout(function() {
        var called = false;
        method(item, function() {
            if (called) return;
            called = true;
            self._next();
        });
        setTimeout(function() {
            if (!called) {
                console.log(item, 'taking too much time');
            }
        }, 3000);
    }, 1);
};

