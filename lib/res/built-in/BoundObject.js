var BoundObject = (function() {
    var locked = true;
    function BoundObject(obj) {
        if (this && this instanceof BoundObject)
            throw new TypeError('BoundObject can not be used as class');
        if (!isBoundObject(obj)) {
            throw new TypeError('Input is not an bound object');
        }
        locked = false;
        var inner = obj();
        locked = true;
        var H = {};
        H.assign = function(key, value) {
            var oldValue = obj[key];
            if (isBoundObject(oldValue)) {
                BoundObject(oldValue).unlisten(inner.childHandlers[key]);
                delete inner.childHandlers[key];
            }
            obj[key] = value;
            trigger(key, value, oldValue);
            if (isBoundObject(value)) {
                var handler = function() {
                    trigger(key, value, value);
                };
                inner.childHandlers[key] = handler;
                BoundObject(value).listen(handler);
            }
            return H;
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
            for (var i = 0; i < inner.changeHandlers.length; i++) {
                try {
                    inner.changeHandlers[i].call(obj, {
                        obj: obj,
                        key: key,
                        newValue: value,
                        oldValue: oldValue
                    });
                } catch(e) {
                    console.error(e.stack || e);
                }
            }
        }
    };
    BoundObject.create = function(initialData) {
        var inner = {
            childHandlers: {},
            changeHandlers: [],
            refHandlers: [],
            unrefHandlers: []
        };
        var ret = function() {
            if (locked)
                throw new TypeError('A bound object can not be called as function');
            return inner;
        };
        ret.prototype = BoundObjectMarker;
        if (initialData) {
            for (var k in initialData) {
                if (k == 'prototype')
                    throw new TypeError('A bound object can have prototype member');
                ret[k] = initialData[k];
                console.log('>>', k, ret[k], initialData[k]);
            }
            console.log(Object.keys(ret), Object.keys(initialData));
        }
        return ret;
    };
    BoundObject._assign = function(obj, member, value) {
        if (isBoundObject(obj)) {
            BoundObject(obj).assign(member, value);
        } else {
            obj[member] = value;
        }
        return value;
    };
    
    return BoundObject;
    
    function isBoundObject(obj) {
        return typeof obj == 'function' && obj.prototype == BoundObjectMarker;
    }
    
    function BoundObjectMarker() {}
})();

var a = BoundObject.create({id:'a'});
console.log(a.id);
BoundObject(a).listen(function(e) {
    console.log(e);
});
BoundObject._assign(a, 'b', 1);
BoundObject._assign(a, 'b', BoundObject.create({id:'b'}));
BoundObject._assign(a.b, 'c', 2);
console.log(a.b);