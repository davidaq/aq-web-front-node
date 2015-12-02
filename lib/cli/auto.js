"use strict";

var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var fsext = require('../fsext');
var Pipeline = require('../pipeline');
var Compiler = require('../Compiler');
var dir = require('../dir');

var compilers = [
    'js',
    'text'
];
for (var i = 0; i < compilers.length; i++) {
    var k = compilers[i];
    compilers[k] = new Compiler(Compiler.served('../compile-func/' + k));
}

var pipeline = new Pipeline();

var link = _.debounce(function() {
    pipeline.push('@link');
}, 200);

function compile(item, compiler, callback) {
    var target = path.join('_build', item + '.jsc');
	fs.stat(target, function(err, stat) {
		if (!err && stat) {
			var t = Math.max(stat.mtime.getTime(), stat.ctime.getTime());
			if (t < dir.fetch(item).time) {
				run();
			} else {
				callback();
			}
		} else {
			fs.mkdir(path.dirname(target), run);
		}
	});
	function run() {
        compiler.compile(item, target, {
            compact: true
        }).then(function() {
            console.log('Compile', item);
            link();
            callback();
        });
	}
}

pipeline.runFor(['js','jsx','jsx.html'], function(item, callback) {
    if (item == '_build/app.js')
        return callback();
    compile(item, compilers.js, callback);
});

pipeline.runFor(['txt','text'], function(item, callback) {
    compile(item, compilable.text, callback);
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
            link();
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
        require('../link')(files, '_build/app.js', callback)
    }).catch(function(err) {
        console.log(err.stack);
    });
});

module.exports = function(callback) {
    var compilable = [
        'jsc',
        'js',
        'jsx','jsx.html',
        'txt','text',
        'json','yaml'
    ];
	dir.onchange(compilable, function(fnode) {
		pipeline.push(fnode.path);
	});
    dir.onunlink(['js','jsx','jsx.html'], function(fnode) {
        console.log('Removed', fnode.path);
        var target = path.join('_build', fnode.path + '.jsc');
        if (dir.fetch(target)) {
            fs.unlink(target, link);
            fs.unlink(target + '_info', link);
        } else {
            link();
        }
    });
    setInterval(function() {
        dir.all(compilable).then(function(list) {
            for (var i = 0; i < list.length; i++) {
                pipeline.push(list[i].path);
            }
        });
    }, 5000);
    callback();
};

