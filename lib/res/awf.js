 var $$$AWF$$$ = (function(window, document) {
    "use strict";
    var es6helpers = {
        _temporalAssertDefined : function(val, name, undef) {
            if (val === undef) {
                throw new ReferenceError(name + " is not defined - temporal dead zone"); 
            } 
            return true;
        },
        _inherits : function(subClass, superClass) {
            if (typeof superClass !== "function" && superClass !== null) {
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
            }
            if (typeof Symbol != 'function' || AWF.legacyBrowser) {
                var proto = superClass.prototype;
                subClass.prototype = {};
                if (proto) {
                    for (var k in proto) {
                        subClass.prototype[k] = proto[k]; 
                    }
                }
                subClass.$$$AWF$$$superClass = superClass;
            } else {
                subClass.prototype = Object.create(superClass && superClass.prototype, {
                    constructor: { value: subClass, enumerable: false, writable: true, configurable: true } 
                });
                if (superClass) {
                    Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
                }
            }
        },
        _instanceof : function(left, right) {
            if (typeof Symbol != 'function' || AWF.legacyBrowser) {
                if (left instanceof right)
                    return true;
                left = left.$$$AWF$$$ClassType;
                while (left) {
                    if (left == right) {
                        return true;
                    }
                    left = left.$$$AWF$$$superClass;
                }
                return false;
            } else {
                if (right != null && right[Symbol.hasInstance]) {
                    return right[Symbol.hasInstance](left); 
                } else {
                    return left instanceof right; 
                }
            }
        },
        _classCallCheck : function(instance, Constructor) {
            if (!AWF.legacyBrowser && !es6helpers._instanceof(instance, Constructor)) {
                throw new TypeError("Cannot call a class as a function");
            }
            if (!instance.$$$AWF$$$ClassType) {
                instance.$$$AWF$$$ClassType = Constructor;
            }
        },
        _interopRequireDefault : function(obj) { 
            return obj && obj.__esModule ? obj : { 'default': obj }; 
        },
        _possibleConstructorReturn : function(self, call) {
            if (!self) {
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); 
            }
            return call && (typeof call === "object" || typeof call === "function") ? call : self;
        },
        _newArrowCheck : function(innerThis, boundThis) {
            if (innerThis !== boundThis) {
                throw new TypeError("Cannot instantiate an arrow function");  
            }
        },
        _boundProp : function(context, member) {
            var item = context[member];
            if (typeof item == 'function' && !item.$$$AWF$$$Class) {
                return item.bind(context);
            }
            return item;
        },
        _iterator : function(collection) {
            var type = collection === null ? 'null' : typeof collection;
            if (type != 'object' && type != 'function') {
                throw new TypeError('Type ' + type + ' not iterable');
            }
            var keys = [];
            if (collection instanceof Array) {
                for (var i = 0; i < collection.length; i++)
                    keys[i] = i;
            } else {
                keys = Object.keys(collection);
            }
            var ci = 0, ck;
            return {
                next : function() {
                    if (ci >= keys.length)
                        return false;
                    ck = keys[ci];
                    ci++;
                    return true;
                },
                key : function() {
                    return ck;
                },
                value : function() {
                    return collection[ck];
                }
            };
        }
    };
    if (!window || !document) {
        return es6helpers;
    }
    if (!Object.keys || !Object.keys.$$$AWF$$$) {
        Object.keys = function(collection) {
            var ret = [];
            for (var k in collection) {
                if (!k.match(/^\$\$\$AWF\$\$\$/)) {
                    var v = collection[k];
                    if (typeof v != 'function' || !v.$$$AWF$$$IgnoreKey)
                        ret.push(k);
                }
            }
            return ret;
        };
        Object.keys.$$$AWF$$$ = true;
    }
    var AWF = {
        es6 : es6helpers,
        mod : {},
        queue : [],
        lib : {},
        use : {},
        define : function(modName, modFunc, basename, relativePath) {
            var mod = {};
            mod.body = modFunc;
            mod.name = modName;
            mod.module = {exports:{}};
            AWF.mod[modName] = mod;
            if (basename != '.')
                basename = basename + '/';
            else
                basename = '';
            mod.src = function(src, noBaseName) {
                var bn = noBaseName ? '' : basename;
                if (src.substr(0, 1) == '/')
                    return bn + src.substr(1);
                if (src.substr(0, 2) == './') 
                    return bn + relativePath + '/' + src.substr(2);
                if (src.substr(0, 3) == '../') {
                    var rel = relativePath.split('/');
                    src = src.split('/');
                    while (src[0] == '..') {
                        src.shift();
                        rel.pop();
                    }
                    return bn + rel.concat(src).join('/');
                }
                return src;
            };
        },
        require : function(modName, contextMod) {
            var mod;
            if (contextMod) {
                modName = contextMod.src(modName);
            }
            if (modName.substr(0, 1) == '/') {
                mod = AWF.mod[modName];
            } else {
                mod = AWF.mod[modName] || AWF.mod['/' + modName];
            }
            if (mod) {
                if (!mod.required) {
                    mod.required = true;
                    mod.body.call(mod.module, mod.module, mod.module.exports, function(src) {
                        return AWF.requre(src, mod);
                    });
                }
                return mod.exports;
            }
            throw new Error("Required module doesn't exist: " + modName);
        },
        signal : function() {},
        legacyBrowser : (function() {
            if (typeof navigator == 'undefined')
                return false;
            if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
                return RegExp.$1 - 0 < 9;
            }
            return false;
        })()
    };
    function BEGIN() {
        // es5 shim for modern browser
        AWF.use['es5-shim'] = AWF.use['es5-sham'] = AWF.use['json3'] = 
            !!AWF.legacyBrowser;
        if (!document.head) {
            document.head = document.getElementsByTagName('head')[0];
        }
        if (!document.body) {
            document.body = document.getElementsByTagName('body')[0];
        }
        var extern = [];
        for (var k in AWF.use) {
            if (!AWF.use[k]) continue;
            var lib = AWF.lib[k];
            if (lib) extern.push(lib);
        }
        next();
        function next() {
            var item = extern.shift();
            if (!item) return ready();
            loadScript(item.url, next, item.exports);
        }
        function ready() {
            var queue = AWF.queue;
            for (var i = 0; i < queue.length; i++) {
                var mod = queue[i];
                mod.body.call(mod, mod, mod.exports, AWF.require);
            }
            AWF.queue = null;
        }
    }

    function dummy() {};
    if (typeof console == 'undefined') {
        // silent fail for browsers without console
        window.console = { assert:dummy, clear:dummy, count:dummy, debug:dummy, dir:dummy,
            dirxml:dummy, error:dummy, group:dummy, groupCollapsed:dummy, groupEnd:dummy,
            info:dummy, log:dummy, profile:dummy, profileEnd:dummy, table:dummy, time:dummy,
            timeEnd:dummy, timeStamp:dummy, trace:dummy, warn:dummy };
    } else if(!DEBUG) {
        // leave only error and info
        for (var k in console) {
            if (k != 'error' && k != 'info' && typeof console[k] == 'function') {
                console[k] = dummy;
            }
        }
    }
    // wait for basic DOM to be ready
    setTimeout((function contentLoaded(fn) {
        var done = false, top = true,
        root = document.documentElement,
        modern = document.addEventListener,
        add = modern ? 'addEventListener' : 'attachEvent',
        rem = modern ? 'removeEventListener' : 'detachEvent',
        pre = modern ? '' : 'on',
        init = function(e) {
            if (e.type == 'readystatechange' && document.readyState != 'complete') return;
            (e.type == 'load' ? window : document)[rem](pre + e.type, init, false);
            if (!done && (done = true)) fn.call(window, e.type || e);
        },
        poll = function() {
            try { root.doScroll('left'); } catch(e) { setTimeout(poll, 50); return; }
            init('poll');
        };
        if (document.readyState == 'complete') fn.call(window, 'lazy');
        else {
            if (!modern && root.doScroll) {
                try { top = !window.frameElement; } catch(e) { }
                if (top) poll();
            }
            document[add](pre + 'DOMContentLoaded', init, false);
            document[add](pre + 'readystatechange', init, false);
            window[add](pre + 'load', init, false);
        }
    }).bind(0, BEGIN), 2);
    
    var loading = window.$$$AWF$$$loadingScript = window.$$$AWF$$$loadingScript || {};
    function loadScript(url, callback, checkVar) {
        if (checkVar && window[checkVar])
            return callback();
        var queue = loading[url];
        if (!queue) {
            queue = loading[url] = {
                cb:[], 
                arg:null
            };
            setTimeout(load, 2);
        }
        if (queue.cb) {
            queue.cb.push(callback);
        } else {
            callback(queue.arg, queue);
        }
        function load() {
            var loader = document.createElement('script'), ended = false;
            loader.type = 'text/javascript';
            loader.onload = end;
            loader.onreadystatechange = function() {
                if (({'loaded':1,'complete':1})[loader.readyState] === 1) {
                    setTimeout(end, 2);
                }
            };
            loader.src = url;
            document.head.appendChild(loader);
            function end() {
                if (ended) return;
                ended = true;
                var arg = checkVar ? window[checkVar] : null;
                for (var i = 0; i < queue.cb.length; i++) {
                    queue.cb[i](arg, queue);
                }
                queue.arg = arg;
                queue.cb = null;
            }
        }
    }
    
    
    function BoundObject(obj) {
        if (!isBoundObject(obj)) {
            throw new TypeError('Input is not an bound object');
        }
        var inner = obj.$$$AWF$$$BoundObject,
         listener = inner.listener,
         old = inner.old,
         child = inner.child,
         H = {
            signal : function(key) {
                if (inner.keys && !inner.keys[key])
                    return;
                var oldValue = old[key];
                if (isBoundObject(oldValue)) {
                    BoundObject(oldValue).unlisten(child[key]);
                    delete child[key];
                }
                delete old[key];
                var value = obj[key];
                trigger(key, value, oldValue);
                H.ref(key, value);
            },
            ref : function(key, value) {
                if (isBoundObject(value)) {
                    BoundObject(value).listen(child[key] = function() {
                        trigger(key, value, value);
                    });
                }
                if (typeof value != 'undefined')
                    old[key] = value;
            },
            listen : function(handler) {
                if (typeof handler == 'function' &&listener.indexOf(handler) == -1) {
                    listener.push(handler);
                }
                return H;
            },
            unlisten : function(handler) {
                if (typeof handler == 'function') {
                    var p = listener.indexOf(handler);
                    if (p > -1)
                        listener.splice(p, 1);
                }
                return H;
            },
            once : function(handler) {
                H.listen(onceHandler);
                function onceHandler() {
                    H.unlisten(onceHandler);
                    handler.apply(this, arguments);
                }
            },
            destroy : function() {
                for (var k in child) {
                    BoundObject(obj[k]).unlisten(child[k]);
                }
                delete obj.$$$AWF$$$BoundObject;
            },
            pause : function(func) {
                inner.paused = true;
                if (typeof func == 'function') {
                    func();
                    inner.paused = false;
                }
                return H;
            },
            resume : function() {
                inner.paused = false;
                return H;
            }
        };
        return H;
        function trigger(key, value, oldValue) {
            if (listener.length && !inner.paused) {
                var evt = {
                    obj: obj,
                    key: key,
                    newValue: value,
                    oldValue: oldValue
                };
                for (var i = 0; i < listener.length; i++) {
                    listener[i].call(obj, evt);
                }
            }
        }
    };
    BoundObject.create = function(source, keys) {
        if (({'undefined':1,'function':1,'object':1})[typeof source] === 1) {
            source = source || {};
            if (!source.$$$AWF$$$BoundObject) {
                source.$$$AWF$$$BoundObject = {
                    child: {},
                    listener: [],
                    old: {}
                };
                if (keys instanceof Array) {
                    var lk = source.$$$AWF$$$BoundObject.keys = {};
                    for (var i = 0; i < keys.length; i++) {
                        lk[keys[i]] = 1;
                    }
                }
                var handle = BoundObject(source);
                for (var iter = $$$AWF$$$.es6._iterator(source); iter.next();) {
                    handle.ref(iter.key(), iter.value());
                }
                if (source instanceof Array) {
                    handle.ref('length', source.length);
                    ['push','pop','shift','unshift','splice','fill','sort','reverse'].map(function (fn) {
                        source[fn] = function() {
                            var ret = Array.prototype[fn].apply(source, arguments);
                            handle.signal('length');
                            return ret;
                        };
                        source[fn].$$$AWF$$$IgnoreKey = true;
                    });
                }
                return source;
            }
            throw new Error('Target is already a BoundObject');
        }
        throw new Error('Must create from object or function');
    };
    BoundObject.isBoundObject = isBoundObject;
    AWF.BoundObject = BoundObject;
    AWF.signal = function(obj, member) {
        if (isBoundObject(obj)) {
            BoundObject(obj).signal(member);
        }
    };
    function isBoundObject(obj) {
        return obj && ({'function':1,'object':1})[typeof obj] === 1 && obj.$$$AWF$$$BoundObject;
    }
    
    return AWF;
})(typeof window != 'undefined' ? window : null, typeof document != 'undefined' ? document : null);
if (typeof module == 'object' && module.exports) module.exports = $$$AWF$$$;
var BoundObject = $$$AWF$$$.BoundObject;
