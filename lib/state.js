var EventEmitter = require('events').EventEmitter;

module.exports = State;

function State() {
    this.on = false;
    this.ev = new EventEmitter();
    this.ev.on('on', (function() {
        this.on = true;
    }).bind(this));
}

State.prototype.set = function() {
    this.on = true;
    this.ev.emit('on');
};

State.prototype.run = function(cb) {
    if (this.on == true) {
        cb();
    } else {
        this.ev.on('on', cb);
    }
};

State.prototype.get = function() {
    return this.on;
};

