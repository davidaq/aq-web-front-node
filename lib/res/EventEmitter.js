$$$AWF$$$.define('EventEmitter', function(module, exports, require) {
    module.exports = EventEmitter;
    function EventEmitter() { }
    EventEmitter.prototype.on = function(evt, handler) {
        if (typeof handler != 'function') {
            throw new TypeError("Event handler must be a function");
        }
        if ($$$AWF$$$.common._instanceof(evt, Array)) {
            for (var i = 0; i < evt.length; i++) {
                this.on(evt[i], handler);
            }
        } else {
            if (!this.$$$AWF$$$Private$$$EventEmitter)
                this.$$$AWF$$$Private$$$EventEmitter = {};
            this.$$$AWF$$$Private$$$EventEmitter[evt] = this.$$$AWF$$$Private$$$EventEmitter[evt] || [];
            this.$$$AWF$$$Private$$$EventEmitter[evt].push(handler);
        }
    };
    EventEmitter.prototype.off = function(evt, handler) {
        if (!this.$$$AWF$$$Private$$$EventEmitter) {
            return;
        }
        if (typeof evt == 'undefined' && !handler) {
            this.$$$AWF$$$Private$$$EventEmitter = {};
        } else if ($$$AWF$$$.common._instanceof(evt, Array)) {
            for (var i = 0; i < evt.length; i++) {
                this.off(evt[i], handler);
            }
        } else if (!handler) {
            this.$$$AWF$$$Private$$$EventEmitter[evt] = [];
            delete this.$$$AWF$$$Private$$$EventEmitter[evt];
        } else if (this.$$$AWF$$$Private$$$EventEmitter[evt]){
            var list = this.$$$AWF$$$Private$$$EventEmitter[evt];
            list.splice(list.indexOf(handler), 1);
        }
    };
    EventEmitter.prototype.emit = function(evt /*, ...args*/) {
        if (!this.$$$AWF$$$Private$$$EventEmitter) {
            return;
        }
        var args = Array.prototype.slice.call(arguments, 1);
        if ($$$AWF$$$.common._instanceof(evt, Array)) {
            for (var i = 0; i < evt.length; i++) {
                this.emit.apply(this, [evt[i]].concat(args));
            }
        } else if(this.$$$AWF$$$Private$$$EventEmitter[evt]) {
            var list = this.$$$AWF$$$Private$$$EventEmitter[evt];
            for (var i = 0; i < list.length; i++) {
                list[i].apply(this, args);
            }
        }
    };
    EventEmitter.mixin = function(obj) {
        var ret = obj;
        if (typeof obj == 'function') {
            obj = obj.prototype;
        }
        for (var k in EventEmitter.prototype) {
            obj[k] = EventEmitter.prototype[k];
        }
        return ret;
    };
});
