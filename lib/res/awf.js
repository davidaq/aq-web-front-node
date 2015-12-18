// File generated with AQ-Web-Front. Search on npmjs: aq-web-front
"use strict";
var $$$AWF$$$ = typeof exports == 'object' ? exports : {};
$$$AWF$$$.mod = {};
$$$AWF$$$.queue = [];
$$$AWF$$$.extern = [];
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
    var loc = document.location;
    if ((loc.hash && loc.hash.match(/DEBUG$/)) || loc.search && loc.search.match(/DEBUG$/))
        window.DEBUG = true;
    if (!document.head) {
        document.head = document.getElementsByTagName('head')[0];
    }
    if (!document.body) {
        document.body = document.getElementsByTagName('body')[0];
    }
    var extern = $$$AWF$$$.extern;
    next();
    function next() {
        var item = extern.shift();
        if (!item) return ready();
        $$$AWF$$$.loadScript(window.DEBUG ? item.debug || item.url : item.url, next, item.id);
    }
    function ready() {
        if (typeof React.createElement != 'undefined') {
            var createElement = React.createElement;
            React.createElement = function() {
                var options = arguments[1];
                if (options && typeof options == 'object') {
                    if (typeof options['if'] != 'undefined') {
                        var condition = options['if'];
                        if (typeof condition == 'function') {
                            condition = condition();
                        }
                        if (!condition) {
                            return null;
                        }
                    }
                    if (options.className && Array.isArray(options.className)) {
                        options.className = options.className.join(' ');
                    }
                }
                return createElement.apply(React, arguments);
            };
        }
        setTimeout(function() {
            var queue = $$$AWF$$$.queue;
            for (var i = 0; i < queue.length; i++) {
                var mod = queue[i];
                mod.body.call(mod, mod, mod.exports, $$$AWF$$$.require, $$$AWF$$$.XMLHttpRequest, $$$AWF$$$.loadScript);
            }
            $$$AWF$$$.queue = null;
        }, 2);
    }
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
$$$AWF$$$.common._boundProp = function(context, item) {
    if (typeof item == 'function') {
        return item.bind(context);
    }
    return item;
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
    // add es5 shim for legacy browser
    if ($$$AWF$$$.legacyBrowser) {
        $$$AWF$$$.extern.push({url:'//cdn.bootcss.com/es5-shim/4.4.0/es5-shim.min.js'});
        $$$AWF$$$.extern.push({url:'//cdn.bootcss.com/es5-shim/4.4.0/es5-sham.min.js'});
        $$$AWF$$$.extern.push({url:'//cdn.bootcss.com/json3/3.3.2/json3.min.js'});
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
            var self;
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
                self = xhr;
            }
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
            var parsedUrl = parseUrl(url);
            if (typeof send == 'object') {
                if (method == 'GET') {
                    url = parsedUrl.origin + parsedUrl.pathname;
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
                url = parsedUrl.origin + parsedUrl.pathname + parsedUrl.search;
            }
            xhr.open(method, url, true);
            if (sendType)
                xhr.setRequestHeader('Content-type', sendType);
            xhr.onreadystatechange = function() {
                if (xhr.readyState != 4 || typeof callback != 'function') return;
                var response = xhr.responseText;
                var status = xhr.status;
                if (resultType == 'json') {
                    if (!response) response = null;
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
            }
            xhr.send(send);
            return xhr;
        };
        Request.get = invoker('get');
        Request.post = invoker('post');
        Request.put = invoker('put');
        Request['delete'] = invoker('delete');
        Request.jsonp = function() {
            // TODO implement this
        };
        function invoker(type) {
            return function(url, send, callback, resultType) {
                return Request.invoke(type, url, send, callback, resultType);
            };
        }
        function urlencode(obj) {
            var ret = [];
            for (var k in obj) {
                ret.push(encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]));
            }
            return ret.join('&');
        }
        var localUrl;
        function parseUrl(url) {
            var m = url.match(/^(?:(?:([a-z]+:)\/\/)([^\/]+))?([^\?]*)?(\?[^\#]*)?(\#.*)?$/i);
            if (!m[1]) {
                localUrl = localUrl || parseUrl(document.location.href);
                if (url.substr(0, 1) == '/') {
                    return parseUrl(localUrl.origin + url);
                } else {
                    return parseUrl(localUrl.origin + localUrl.pathname.replace(/\/[^\/]*$/, '/') + url);
                }
            }
            var ret = {
                protocol: m[1],
                host: m[2],
                pathname: m[3],
                search: m[4] || '',
                hash: m[5] || ''
            };
            var host = ret.host.split(':');
            ret.hostname = host[1];
            ret.port = (host[2] || 80) - 0;
            ret.origin = ret.protocol + '//' + ret.host;
            return ret;
        }
        return Request;
    })();
    $$$AWF$$$.loadScript = (function() {
        var loading = window.$$$AWF$$$loadingScript = window.$$$AWF$$$loadingScript || {};
        function loadScript(url, callback, checkVar) {
            if (checkVar && window[checkVar])
                return callback();
            var queue = loading[url];
            if (!queue) {
                queue = loading[url] = [false];
                setTimeout(load, 2);
            }
            if (typeof callback == 'function') {
                if (queue[0]) {
                    return callback();
                } else {
                    queue.push(callback);
                }
            }
            function load() {
                var loader = document.createElement('script');
                loader.type = 'text/javascript';
                loader.onload = end;
                loader.onreadystatechange = function() {
                    if (loader.readyState == 'loaded' || loader.readyState == 'complete') {
                        setTimeout(end, 10);
                    }
                };
                var ended = false;
                function end() {
                    if (ended) return;
                    ended = true;
                    queue[0] = true;
                    var arg = checkVar ? window[checkVar] : null;
                    for (var i = 1; i < queue.length; i++) {
                        try {queue[i](arg)} catch(e) {}
                    }
                    queue.splice(1);
                }
                loader.src = url;
                document.head.appendChild(loader);
            }
        }
        return loadScript;
    })();
}
