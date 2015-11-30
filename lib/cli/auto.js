"use strict";

var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var fsext = require('../fsext');
var Pipeline = require('../pipeline');
var compilejs;// = require('../compile-js');
var dir;// = require('../dir');

var pipeline = new Pipeline();

var link = _.debounce(function() {
    pipeline.push('@link');
}, 200);

pipeline.runFor(['js','jsx','jsx.html'], function(item, callback) {
    if (item == '_build/app.js')
        return callback();
    var target = path.join('_build', item + '.jsc');
	fs.stat(target, function(err, stat) {
		if (!err && stat) {
			var t = Math.max(stat.mtime.getTime(), stat.ctime.getTime());
			if (t < dir.fetch(item).time) {
				compile();
			} else {
				callback();
			}
		} else {
			fs.mkdir(path.dirname(target), compile);
		}
	});
	function compile() {
		compilejs.compile(item, target, callback);
		link();
		console.log('Compile', item);
	}
});

pipeline.runFor(['jsc','jsc_info'], function(item, callback) {
    var source = item.replace(/\.(jsc|jsc_info)$/i, '');
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
        console.log('Link    _build/app.js');
        var files = _(list).map(function(item) {
            return item.path;
        });
        compilejs.link(files, '_build/app.js', callback)
    });
});

module.exports = function(callback) {
    compilejs = require('../compile-js');
    dir = require('../dir');
	dir.onchange(['jsc_info','jsc','info','js','jsx','jsx.html'], function(fnode) {
		pipeline.push(fnode.path);
	});
    dir.onunlink(['js','jsx','jsx.html'], function(fnode) {
        console.log('Removed', fnode.path);
        var target = path.join('_build', fnode.path + '.jsc');
		console.log(target);
        if (dir.fetch(target)) {
            fs.unlink(target, link);
            fs.unlink(target + '_info', link);
        } else {
            link();
        }
    });
    callback();
};

