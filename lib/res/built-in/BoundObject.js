$$$AWF$$$.define('BoundObject', function(module, exports, require) {
    module.exports = BoundObject;
    _BoundObject = BoundObject;

    function BoundObject(obj) {
        if (this && this instanceof BoundObject)
            throw new TypeError('BoundObject can not be used as class');
        if (!isBoundObject(obj)) {
            throw new TypeError('Input is not an bound object');
        }
        var inner = obj.$$$AWF$$$BoundObject;
        var H = {};
        H.signal = function(key) {
            var oldValue = inner.oldVal[key];
            if (isBoundObject(oldValue)) {
                BoundObject(oldValue).unlisten(inner.childHandlers[key]);
                delete inner.childHandlers[key];
            }
            var value = obj[key];
            trigger(key, value, oldValue);
            H.ref(key, value);
            return H;
        };
        H.del = function(key) {
            var oldValue = inner.oldVal[key];
            if (isBoundObject(oldValue)) {
                BoundObject(oldValue).unlisten(inner.childHandlers[key]);
                delete inner.childHandlers[key];
            }
            delete inner.oldVal[key];
        };
        H.ref = function(key, value) {
            if (isBoundObject(value)) {
                var handler = function() {
                    trigger(key, value, value);
                };
                inner.childHandlers[key] = handler;
                BoundObject(value).listen(handler);
            }
            inner.oldVal[key] = value;
        };
        H.listen = function(handler) {
            if (typeof handler != 'function')
                throw new TypeError('Handler must be a function');
            if (inner.changeHandlers.indexOf(handler) == -1) {
                inner.changeHandlers.push(handler);
            }
            return H;
        };
        H.unlisten = function(handler) {
            if (typeof handler != 'function')
                throw new TypeError('Handler must be a function');
            var p = inner.changeHandlers.indexOf(handler);
            if (p > -1)
                inner.changeHandlers.splice(p, 1);
        };
        return H;
        function trigger(key, value, oldValue) {
            var evt;
            for (var i = 0; i < inner.changeHandlers.length; i++) {
                evt = evt || {
                    obj: obj,
                    key: key,
                    newValue: value,
                    oldValue: oldValue
                };
                try {
                    inner.changeHandlers[i].call(obj, evt);
                } catch(e) {
                    console.error(e.stack || e);
                }
            }
        }
    };
    BoundObject.create = function(source) {
        if (typeof source in {'undefined':1,'function':1,'object':1}) {
            source = source || {};
            source.$$$AWF$$$BoundObject = source.$$$AWF$$$BoundObject || {
                childHandlers: {},
                changeHandlers: [],
                oldVal: {}
            };
        }
        var handle = BoundObject(source);
        for (var iter = $$$AWF$$$.es6._iterator(source); iter.next();) {
            handle.ref(iter.key(), iter.value());
        }
        return source;
    };
    BoundObject._signal = function(obj, member) {
        if (isBoundObject(obj)) {
            BoundObject(obj).signal(member);
        }
    };
    $$$AWF$$$.signal = BoundObject._signal;
    function isBoundObject(obj) {
        return obj && typeof obj in {'function':1,'object':1} && obj.$$$AWF$$$BoundObject;
    }
});
