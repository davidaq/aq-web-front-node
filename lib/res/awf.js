// File generated with AQ-Web-Front. Search on npmjs: aq-web-front
"use strict";
var $$$AWF$$$ = typeof exports == 'object' ? exports : {};
$$$AWF$$$.legacyBrowser = !!(function() {
	if (typeof navigator == 'undefined')
		return false;
	if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
	   var ieversion=new Number(RegExp.$1);
	   return ieversion <= 8;
	}
	return false;
})();
$$$AWF$$$.mod = {};
$$$AWF$$$.define = function(modName, modFunc) {
	var exports = {};
	var mod = {exports:exports,_exports:exports};
	modFunc.call(mod, mod, mod.exports, $$$AWF$$$.require);
	$$$AWF$$$.mod[modName] = mod;
};
$$$AWF$$$.require = function(modName, modFunc) {
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
			if (!left.prototype || !left.prototype.$$$AWF$$$superClass) {
				break;
			}
			left = left.prototype.$$$AWF$$$superClass;
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
	if (!(instance instanceof Constructor)) {
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


$$$AWF$$$.stylesheet = function(name, content) {
    return;
    $$$AWF$$$.onready(function() {
        var head = document.getElementsByTagName('head')[0];
        var ele = document.createElement('style');
        ele.type = 'text/css';
        ele.innerHTML = content;
        head.appendChild(ele);
        document.getElementsByTagName('body')[0].className = name;
    });
};

$$$AWF$$$.onready = (function() {
    if (typeof document == 'undefined')
        return function(cb) {if (cb) cb();};
    var readyList,
        DOMContentLoaded,
        class2type = {};
        class2type["[object Boolean]"] = "boolean";
        class2type["[object Number]"] = "number";
        class2type["[object String]"] = "string";
        class2type["[object Function]"] = "function";
        class2type["[object Array]"] = "array";
        class2type["[object Date]"] = "date";
        class2type["[object RegExp]"] = "regexp";
        class2type["[object Object]"] = "object";

    var ReadyObj = {
        // Is the DOM ready to be used? Set to true once it occurs.
        isReady: false,
        // A counter to track how many items to wait for before
        // the ready event fires. See #6781
        readyWait: 1,
        // Hold (or release) the ready event
        holdReady: function( hold ) {
            if ( hold ) {
                ReadyObj.readyWait++;
            } else {
                ReadyObj.ready( true );
            }
        },
        // Handle when the DOM is ready
        ready: function( wait ) {
            // Either a released hold or an DOMready/load event and not yet ready
            if ( (wait === true && !--ReadyObj.readyWait) || (wait !== true && !ReadyObj.isReady) ) {
                // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
                if ( !document.body ) {
                    return setTimeout( ReadyObj.ready, 1 );
                }

                // Remember that the DOM is ready
                ReadyObj.isReady = true;
                // If a normal DOM Ready event fired, decrement, and wait if need be
                if ( wait !== true && --ReadyObj.readyWait > 0 ) {
                    return;
                }
                // If there are functions bound, to execute
                readyList.resolveWith( document, [ ReadyObj ] );

                // Trigger any bound ready events
                //if ( ReadyObj.fn.trigger ) {
                //  ReadyObj( document ).trigger( "ready" ).unbind( "ready" );
                //}
            }
        },
        bindReady: function() {
            if ( readyList ) {
                return;
            }
            readyList = ReadyObj._Deferred();

            // Catch cases where $(document).ready() is called after the
            // browser event has already occurred.
            if ( document.readyState === "complete" ) {
                // Handle it asynchronously to allow scripts the opportunity to delay ready
                return setTimeout( ReadyObj.ready, 1 );
            }

            // Mozilla, Opera and webkit nightlies currently support this event
            if ( document.addEventListener ) {
                // Use the handy event callback
                document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );
                // A fallback to window.onload, that will always work
                window.addEventListener( "load", ReadyObj.ready, false );

            // If IE event model is used
            } else if ( document.attachEvent ) {
                // ensure firing before onload,
                // maybe late but safe also for iframes
                document.attachEvent( "onreadystatechange", DOMContentLoaded );

                // A fallback to window.onload, that will always work
                window.attachEvent( "onload", ReadyObj.ready );

                // If IE and not a frame
                // continually check to see if the document is ready
                var toplevel = false;

                try {
                    toplevel = window.frameElement == null;
                } catch(e) {}

                if ( document.documentElement.doScroll && toplevel ) {
                    doScrollCheck();
                }
            }
        },
        _Deferred: function() {
            var // callbacks list
                callbacks = [],
                // stored [ context , args ]
                fired,
                // to avoid firing when already doing so
                firing,
                // flag to know if the deferred has been cancelled
                cancelled,
                // the deferred itself
                deferred  = {

                    // done( f1, f2, ...)
                    done: function() {
                        if ( !cancelled ) {
                            var args = arguments,
                                i,
                                length,
                                elem,
                                type,
                                _fired;
                            if ( fired ) {
                                _fired = fired;
                                fired = 0;
                            }
                            for ( i = 0, length = args.length; i < length; i++ ) {
                                elem = args[ i ];
                                type = ReadyObj.type( elem );
                                if ( type === "array" ) {
                                    deferred.done.apply( deferred, elem );
                                } else if ( type === "function" ) {
                                    callbacks.push( elem );
                                }
                            }
                            if ( _fired ) {
                                deferred.resolveWith( _fired[ 0 ], _fired[ 1 ] );
                            }
                        }
                        return this;
                    },

                    // resolve with given context and args
                    resolveWith: function( context, args ) {
                        if ( !cancelled && !fired && !firing ) {
                            // make sure args are available (#8421)
                            args = args || [];
                            firing = 1;
                            try {
                                while( callbacks[ 0 ] ) {
                                    callbacks.shift().apply( context, args );//shifts a callback, and applies it to document
                                }
                            }
                            finally {
                                fired = [ context, args ];
                                firing = 0;
                            }
                        }
                        return this;
                    },

                    // resolve with this as context and given arguments
                    resolve: function() {
                        deferred.resolveWith( this, arguments );
                        return this;
                    },

                    // Has this deferred been resolved?
                    isResolved: function() {
                        return !!( firing || fired );
                    },

                    // Cancel
                    cancel: function() {
                        cancelled = 1;
                        callbacks = [];
                        return this;
                    }
                };

            return deferred;
        },
        type: function( obj ) {
            return obj == null ?
                String( obj ) :
                class2type[ Object.prototype.toString.call(obj) ] || "object";
        }
    }
    // The DOM ready check for Internet Explorer
    function doScrollCheck() {
        if ( ReadyObj.isReady ) {
            return;
        }

        try {
            // If IE is used, use the trick by Diego Perini
            // http://javascript.nwbox.com/IEContentLoaded/
            document.documentElement.doScroll("left");
        } catch(e) {
            setTimeout( doScrollCheck, 1 );
            return;
        }

        // and execute any waiting functions
        ReadyObj.ready();
    }
    // Cleanup functions for the document ready method
    if ( document.addEventListener ) {
        DOMContentLoaded = function() {
            document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
            ReadyObj.ready();
        };

    } else if ( document.attachEvent ) {
        DOMContentLoaded = function() {
            // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
            if ( document.readyState === "complete" ) {
                document.detachEvent( "onreadystatechange", DOMContentLoaded );
                ReadyObj.ready();
            }
        };
    }
    function ready( fn ) {
        // Attach the listeners
        ReadyObj.bindReady();

        var type = ReadyObj.type( fn );

        // Add the callback
        readyList.done( fn );//readyList is result of _Deferred()
    }
    return ready;
})();
