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
			if (left == right) {
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
