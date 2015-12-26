if (!exports.$$$AWF$$$Extended) {
    exports.prototype.follow = function(emitter, evtName) {
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
    exports.prototype.unfollow = function(emitter, evtName) {
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
    exports.$$$AWF$$$Extended = true;
}