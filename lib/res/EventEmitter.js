$$$AWF$$$.extern.push({id:'EventEmitter',url:'https://cdnjs.cloudflare.com/ajax/libs/EventEmitter/4.3.0/EventEmitter.min.js'});
$$$AWF$$$.define('EventEmitter', function(module, exports, require) {

    module.exports = EventEmitter;

    EventEmitter.prototype.follow = function(emitter, evtName) {
        evtName = evtName || 'update';
        var list = this.$$$AWF$$$Private$EventEmitter = this.$$$AWF$$$Private$EventEmitter || [];
        var self = this;
        var emitName = evtName;
        var func = function() {
            var args = [emitName].concat(arguments);
            return self.emit.apply(self, args);
        };
        list.push([emitter, evtName, func]);
        emitter.on(evtName, func);
        return { as:as };
        function as(evtName) {
            emitName = evtName;
        }
    };
    EventEmitter.prototype.unfollow = function(emitter, evtName) {
        evtName = evtName || 'update';
        var list = this.$$$AWF$$$Private$EventEmitter;
        if (!list)
            return;
        for (var i = 0; i < list.length; i++) {
            var item = list[i];
            if (item[0] == emitter && item[1] == evtName) {
                emitter.off(evtName, item[2]);
            }
        }
    };
});
