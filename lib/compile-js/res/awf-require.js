// File generated with AQ-Web-Front. Search on npmjs: aq-web-front
"use strict";
var $$$AWF_require$$$ = function(modName, modFunc) {
    if (!modName) return;
    if (modFunc) {
        var exports = {};
        var mod = {exports:exports,_exports:exports};
        modFunc.call(mod, mod, mod.exports, $$$AWF_require$$$);
        $$$AWF_require$$$.mod[modName] = mod;
    } else {
        var mod = $$$AWF_require$$$.mod[modName] || {};
        return mod.exports || {};
    }
};
$$$AWF_require$$$.mod = {};
