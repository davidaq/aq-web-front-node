"use strict";
var AWFrequire = function(modName, modFunc) {
    if (!modName) return;
    if (modFunc) {
        var exports = {};
        var mod = {exports:exports,_exports:exports};
        modFunc.call(mod, mod, mod.exports, AWFrequire);
        AWFrequire.mod[modName] = mod;
    } else {
        var mod = AWFrequire.mod[modName] || {};
        return mod.exports || {};
    }
};
AWFrequire.mod = {};
