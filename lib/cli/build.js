"use strict";

var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var dir = require('../dir');
var fsext = require('../fsext');
var Pipeline = require('../pipeline');
var compilejs;// = require('../compile-js');

var pipeline = new Pipeline();

var link = _.debounce(function() {
    pipeline.push('@link');
}, 200);

pipeline.runFor('js', function(item, callback) {
    if (item == '_build/app.js')
        return callback();
    console.log('Compile', item);
    var target = path.join('_build', fsext.changeExt(item, 'jsc'));
    fs.mkdir(path.dirname(target), function() {
        compilejs.compile(item, target, callback);
        link();
    });
});

pipeline.runFor(['jsc','jsc_info'], function(item, callback) {
    var source = fsext.changeExt(item, 'js');
    source = source.replace(/^_build[\/\\]/, '');
    fs.exists(source, function(exists) {
        if (!exists) {
            fs.unlink(item, function() {
                link();
                callback();
            });
        } else {
            callback();
        }
    });
});

pipeline.runFor('@link', function(item, callback) {
    dir.all('jsc').then(function(list) {
        console.log('Link _build/app.js');
        var files = _(list).map(function(item) {
            return item.path;
        });
        compilejs.link(files, '_build/app.js', callback)
    });
});

module.exports = function(callback) {
    compilejs = require('../compile-js');
    dir.onchange(['jsc','info','js'], function(fnode) {
        pipeline.push(fnode.path);
    });
    dir.onunlink('js', function(fnode) {
        var target = path.join('_build', fsext.changeExt(fnode.path, 'jsc'));
        if (dir.fetch(target)) {
            fs.unlink(target, link);
            fs.unlink(target + '_info', link);
        } else {
            link();
        }
    });
    callback();
};

