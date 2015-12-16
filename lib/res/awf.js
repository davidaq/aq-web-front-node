// File generated with AQ-Web-Front. Search on npmjs: aq-web-front
"use strict";
var $$$AWF$$$ = typeof exports == 'object' ? exports : {};
$$$AWF$$$.mod = {};
$$$AWF$$$.queue = [];
$$$AWF$$$.define = function(modName, modFunc) {
    var mod = {};
    mod.body = modFunc;
    mod.name = modName;
    mod.exports = {};
    $$$AWF$$$.queue.push(mod);
	$$$AWF$$$.mod[modName] = mod;
};
$$$AWF$$$.require = function(modName) {
	var mod = $$$AWF$$$.mod[modName] || {};
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
    // roll your sleaves we're ready to rock
    var queue = $$$AWF$$$.queue;
    for (var i = 0; i < queue.length; i++) {
        var mod = queue[i];
        mod.body.call(mod, mod, mod.exports, $$$AWF$$$.require, $$$AWF$$$.XMLHttpRequest);
    }
    $$$AWF$$$.queue = null;
}
$$$AWF$$$.common = {};
$$$AWF$$$.common._temporalAssertDefined = function(val, name, undef) { 
	if (val === undef) {
		throw new ReferenceError(name + " is not defined - temporal dead zone"); 
	} 
	return true;
};
$$$AWF$$$.common._inherits = function(subClass, superClass) {
	if (typeof superClass !== "function" && superClass !== null) {
		throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
	}
	if ($$$AWF$$$.legacyBrowser) {
		var proto = superClass.prototype;
		subClass.prototype = {};
		if (proto) {
			for (var k in proto) {
				subClass.prototype[k] = proto[k]; 
			}
		}
		subClass.prototype.$$$AWF$$$superClass = superClass;
	} else {
		subClass.prototype = Object.create(superClass && superClass.prototype, {
			constructor: { value: subClass, enumerable: false, writable: true, configurable: true } 
		});
		if (superClass) {
			Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
		}
	}
};
$$$AWF$$$.common._instanceof = function(left, right) {
	if ($$$AWF$$$.legacyBrowser) {
		while (true) {
			if (left instanceof right) {
				return true;
			}
			left = left.$$$AWF$$$superClass;
			if (!left) {
				break;
			}
		}
		return false;
	} else {
		if (right != null && right[Symbol.hasInstance]) {
			return right[Symbol.hasInstance](left); 
		} else {
			return left instanceof right; 
		}
	}
};
$$$AWF$$$.common._classCallCheck = function(instance, Constructor) {
	if (!$$$AWF$$$.legacyBrowser && !(instance instanceof Constructor)) {
		throw new TypeError("Cannot call a class as a function");
	}
    if (!instance.$$$AWF$$$ClassType) {
        instance.$$$AWF$$$ClassType = Constructor;
    }
};
$$$AWF$$$.common._interopRequireDefault = function(obj) { 
	return obj && obj.__esModule ? obj : { 'default': obj }; 
};
$$$AWF$$$.common._possibleConstructorReturn = function(self, call) {
	if (!self) {
		throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); 
	}
	return call && (typeof call === "object" || typeof call === "function") ? call : self;
};
$$$AWF$$$.common._newArrowCheck = function(innerThis, boundThis) {
    if (innerThis !== boundThis) {
        throw new TypeError("Cannot instantiate an arrow function");  
    }
};

// bellow are only for browsers
if (typeof document != 'undefined' && typeof window != 'undefined') {
    // Check if visited by a legacy browser and require shims
    $$$AWF$$$.legacyBrowser = !!(function() {
    	if (typeof navigator == 'undefined')
    		return false;
    	if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
    	   var ieversion=new Number(RegExp.$1);
    	   return ieversion <= 8;
    	}
    	return false;
    })();
    // silent fail for browsers without console
    if (typeof console == 'undefined') {
        var dummy = function () {};
        window.console = { assert:dummy, clear:dummy, count:dummy, debug:dummy, dir:dummy,
            dirxml:dummy, error:dummy, group:dummy, groupCollapsed:dummy, groupEnd:dummy,
            info:dummy, log:dummy, profile:dummy, profileEnd:dummy, table:dummy, time:dummy,
            timeEnd:dummy, timeStamp:dummy, trace:dummy, warn:dummy };
    }
    // wait for basic DOM to be ready
    (function(readyFunc) {
        var readyCalled = false;
        function ready() {
            if (readyCalled) return;
            readyCalled = true;
            setTimeout(readyFunc, 1);
        }
        if (document.readyState === "complete") return ready();
        if (document.addEventListener) {
            document.addEventListener("DOMContentLoaded", function() {
                ready();
            }, false);
            window.addEventListener("load", ready, false);
        } else if (document.attachEvent) {
            document.attachEvent("onreadystatechange", function() {
                if (document.readyState === "complete"|| document.readyState === 'loaded') {
                    ready();
                }
            });
            window.attachEvent("onload", ready);
            var toplevel = false;
            try {
                toplevel = window.frameElement == null;
            } catch(e) {}
            if (document.documentElement.doScroll && toplevel) doScrollCheck();
        }
        function doScrollCheck() {
            if (readyCalled) return;
            try {
                document.documentElement.doScroll("left");
            } catch(e) {
                setTimeout(doScrollCheck, 1);
                return;
            }
            ready();
        }
    })(BEGIN);
    // shim for XMLHttpRequest
    $$$AWF$$$.XMLHttpRequest = (function() {
        var isNative = typeof XMLHttpRequest !== 'undefined';
        var activeX = ["Msxml2.XMLHTTP", "Msxml3.XMLHTTP", "Microsoft.XMLHTTP"];
        function Request() {
            var self = this;
            if (isNative) {
                self = new XMLHttpRequest();
            } else {
                var xhr;
                for (var i = 0; i < activeX.length; i++) {
                    try {
                        xhr = new ActiveXObject(activeX[i]);
                        break;
                    } catch(e) {};
                }
                self.activeX = xhr;
                for (var k in xhr) {
                    var item = xhr[k];
                    if (typeof item == 'function') {
                        self[k] = item;
                    }
                }
            }
            self.onreadystatechange = function() {
                if (self.readyState != 4) return;
                if (typeof self.onResult == 'function')
                    self.onResult(self.responseText, self.status);
            };
            return self;
        }
        Request.invoke = function(method, url, send, callback, resultType) {
            method = method.toUpperCase();
            if (typeof send == 'function') {
                resultType = callback;
                callback = send;
                send = '';
            }
            if (resultType) resultType = resultType.toLowerCase();
            if (!resultType || resultType == 'text') {
                resultType = 'html';
            }
            var xhr = new Request();
            var sendType = null;
            if (typeof send == 'object') {
                if (method == 'GET') {
                    var a = document.createElement('a');
                    a.href = url;
                    url = a.protocol + '//' + a.host + a.pathname;
                    if (a.search) {
                        var query = a.search.replace(/^\?/, '').split('&');
                        for (var i = 0; i < query.length; i++) {
                            var item = query[i].split('=').map(decodeURIComponent);
                            if (!send.hasOwnProperty(item[0])) {
                                send[item[0]] = item[1];
                            }
                        }
                    }
                    send = urlencode(send);
                    if (send) {
                        url += '?' + send;
                    }
                    send = '';
                } else if (send.__json) {
                    delete send.__json;
                    send = JSON.stringify(send);
                    sendType = 'application/json';
                } else {
                    send = urlencode(send);
                    sendType = 'application/x-www-form-urlencoded';
                }
            } else if(send) {
                throw new Error('Expecting send data to be a valid object');
            } else {
                send = '';
            }
            xhr.open(method, url, true);
            if (sendType)
                xhr.setRequestHeader('Content-type', sendType);
            xhr.onResult = function(response, status) {
                if (typeof callback != 'function') return;
                if (resultType == 'json') {
                    if (!response)
                        response = null;
                    else {
                        try {
                            response = JSON.parse(response);
                        } catch(e) {
                            response = null;
                            console.warn(e.stack || e);
                        }
                    }
                }
                callback(response, status);
            };
            xhr.send(send);
        };
        function urlencode(obj) {
            var ret = [];
            for (var k in obj) {
                ret.push(encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]));
            }
            return ret.join('&');
        }
        function invoker(type) {
            return function(url, send, callback, resultType) {
                Request.invoke(type, url, send, callback, resultType);
            };
        }
        Request.get = invoker('get');
        Request.post = invoker('post');
        Request.put = invoker('put');
        Request.delete = invoker('delete');
        return Request;
    })();
}
