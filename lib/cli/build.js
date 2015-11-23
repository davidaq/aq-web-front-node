"use strict";

var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var compilejs = require('../compile-js');
var dir = require('../dir');
var fsext = require('../fsext');

module.exports = function(callback) {
    dir.onchange('jsc', function(fnode) {
        var source = fsext.changeExt(fnode.path, 'js');
        source = source.replace(/^_build[\/\\]/, '');
        fs.exists(source, function(exists) {
            if (!exists) {
                fs.unlink(fnode.path);
            }
        });
    });
    dir.onchange('js', function(fnode) {
        var target = path.join('_build', fsext.changeExt(fnode.path, 'jsc'));
        fs.mkdir(path.dirname(target), function() {
            compilejs.compile(fnode.path, target, !fnode.ext['ts'], link);
        });
    });
    dir.onunlink('js', function(fnode) {
        var target = path.join('_build', fsext.changeExt(fnode.path, 'jsc'));
        if (dir.fetch(target)) {
            fs.unlink(target, link);
        } else {
            link();
        }
    });
    callback();
};

var link = _.debounce(function() {
    dir.all('jsc').then(function(list) {
        var files = _(list).map(function(item) {
            return item.path;
        });
    });
}, 50);
