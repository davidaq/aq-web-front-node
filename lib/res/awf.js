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
            if (AWF.legacyBrowser) {
                var proto = superClass.prototype;
                subClass.prototype = {};
                if (proto) {
                    for (var k in proto) {
                        subClass.prototype[k] = proto[k]; 
                    }
                }
                subClass.AWFsuperClass = superClass;
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
            if (AWF.legacyBrowser) {
                if (left instanceof right)
                    return true;
                left = left.AWFClassType;
                while (left) {
                    if (left == right) {
                        return true;
                    }
                    left = left.AWFsuperClass;
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
            if (!AWF.legacyBrowser && !(instance instanceof Constructor)) {
                throw new TypeError("Cannot call a class as a function");
            }
            if (!instance.AWFClassType) {
                instance.AWFClassType = Constructor;
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
        _boundProp : function(context, item) {
            if (typeof item == 'function') {
                return item.bind(context);
            }
            return item;
        }
    };
    if (!window || !document) {
        return es6helpers;
    }

    var AWF = {};
    AWF.es6 = es6helpers;
    AWF.mod = {};
    AWF.queue = [];
    AWF.extern = [];
    AWF.lib = {};
    AWF.use = {};
    AWF.define = function(modName, modFunc, immediate) {
        var mod = {};
        mod.body = modFunc;
        mod.name = modName;
        mod.exports = {};
        AWF.mod[modName] = mod;
        if (immediate) {
            mod.body.call(mod, mod, mod.exports, AWF.require);
        } else {
            AWF.queue.push(mod);
        }
    };
    AWF.require = function(modName) {
        if (modName == 'react' && AWF.mod['React'])
            modName = 'React';
        var mod = AWF.mod[modName] || {};
        if (mod.exports) {
            if (!mod.imported && typeof mod.exports.__beforeFirstImport == 'function') {
                mod.exports.__beforeFirstImport();
            }
            mod.imported = true;
            return mod.exports;
        }
        return {};
    };
    function BEGIN() {
        // remove es5 shim for modern browser
        if (!AWF.legacyBrowser) {
            AWF.use['es5-shim'] = 0;
            AWF.use['es5-sham'] = 0;
            AWF.use['json3'] = 0;
        }
        var loc = document.location;
        if (!document.head) {
            document.head = document.getElementsByTagName('head')[0];
        }
        if (!document.body) {
            document.body = document.getElementsByTagName('body')[0];
        }
        var extern = AWF.extern;
        next();
        function next() {
            var item = extern.shift();
            if (!item) return ready();
            loadScript(item.url, next, item.exports);
        }
        function ready() {
            setTimeout(function() {
                var queue = AWF.queue;
                for (var i = 0; i < queue.length; i++) {
                    var mod = queue[i];
                    mod.body.call(mod, mod, mod.exports, AWF.require);
                }
                AWF.queue = null;
            }, 2);
        }
    }

    // Check if visited by a legacy browser and require shims
    AWF.legacyBrowser = !!(function() {
        if (typeof navigator == 'undefined')
            return false;
        if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
            var ieversion=new Number(RegExp.$1);
            return ieversion <= 8;
        }
        return false;
    })();
    var dummy = function () {};
    if (typeof console == 'undefined') {
        // silent fail for browsers without console
        window.console = { assert:dummy, clear:dummy, count:dummy, debug:dummy, dir:dummy,
            dirxml:dummy, error:dummy, group:dummy, groupCollapsed:dummy, groupEnd:dummy,
            info:dummy, log:dummy, profile:dummy, profileEnd:dummy, table:dummy, time:dummy,
            timeEnd:dummy, timeStamp:dummy, trace:dummy, warn:dummy };
    } else if(!DEBUG) {
        // leave only error
        for (var k in console) {
            if (k != 'error' && typeof console[k] == 'function') {
                console[k] = dummy;
            }
        }
    }
    // wait for basic DOM to be ready
    setTimeout((function contentLoaded(fn) {
        var done = false, top = true,
        win = window,
        doc = win.document,
        root = doc.documentElement,
        modern = doc.addEventListener,
        add = modern ? 'addEventListener' : 'attachEvent',
        rem = modern ? 'removeEventListener' : 'detachEvent',
        pre = modern ? '' : 'on',
        init = function(e) {
            if (e.type == 'readystatechange' && doc.readyState != 'complete') return;
            (e.type == 'load' ? win : doc)[rem](pre + e.type, init, false);
            if (!done && (done = true)) fn.call(win, e.type || e);
        },
        poll = function() {
            try { root.doScroll('left'); } catch(e) { setTimeout(poll, 50); return; }
            init('poll');
        };
        if (doc.readyState == 'complete') fn.call(win, 'lazy');
        else {
            if (!modern && root.doScroll) {
                try { top = !win.frameElement; } catch(e) { }
                if (top) poll();
            }
            doc[add](pre + 'DOMContentLoaded', init, false);
            doc[add](pre + 'readystatechange', init, false);
            win[add](pre + 'load', init, false);
        }
    }).bind(0, BEGIN), 2);
    var loadScript = (function() {
        var loading = window.AWFloadingScript = window.AWFloadingScript || {};
        function loadScript(url, callback, checkVar) {
            if (checkVar && window[checkVar])
                return callback();
            var queue = loading[url];
            if (!queue) {
                queue = loading[url] = {
                    cb:[], 
                    ele:null,
                    uncache: function() {
                        delete loading[url];
                        if (this.ele.parentNode) 
                            this.ele.parentNode.removeChild(this.ele);
                    },
                    arg:null
                };
                setTimeout(load, 2);
            }
            if (typeof callback == 'function') {
                if (queue.cb) {
                    queue.cb.push(callback);
                } else {
                    callback(queue.arg, queue);
                }
            }
            function load() {
                var loader = document.createElement('script');
                queue.ele = loader;
                loader.type = 'text/javascript';
                loader.onload = end;
                loader.onreadystatechange = function() {
                    if (loader.readyState == 'loaded' || loader.readyState == 'complete') {
                        setTimeout(end, 5);
                    }
                };
                var ended = false;
                function end() {
                    if (ended) return;
                    ended = true;
                    var arg = checkVar ? window[checkVar] : null;
                    for (var i = 0; i < queue.cb.length; i++) {
                        queue.cb[i](arg, queue);
                    }
                    queue.arg = arg;
                    queue.cb = null
                }
                loader.src = url;
                document.head.appendChild(loader);
            }
        }
        return loadScript;
    })();
    return AWF;
})(typeof window != 'undefined' ? window : null, typeof document != 'undefined' ? document : null);
if (typeof module == 'object' && module.exports) module.exports = $$$AWF$$$;
