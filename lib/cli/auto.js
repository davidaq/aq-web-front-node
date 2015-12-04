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
    'text',
    'json',
    'yaml',
    'sass',
    'stylus'
];
for (var i = 0; i < compilers.length; i++) {
    var k = compilers[i];
    compilers[k] = new Compiler(Compiler.served('../compile-func/' + k));
}

var pipeline = new Pipeline();

var dirty = true;
var link = _.debounce(function() {
    if (dirty) {
        dirty = false;
        pipeline.push('@link');
    }
}, 200);
link();

function compile(item, compiler, callback) {
    var target = path.join('_build', item + '.awfco');
    dir.fetch(target, function(targetItem) {
        if (!targetItem) {
			fs.mkdir(path.dirname(target), run);
        } else if (targetItem.time < dir.fetch(item).time) {
            run();
        } else {
            callback();
        }
    });
	function run() {
        compiler.compile(item, target, {
            compact: true
        }).then(function() {
            console.log('Compile', item);
            dirty = true;
            link();
            callback();
        });
	}
}

pipeline.runFor(['js','jsx','jsx.html'], function(item, callback) {
    compile(item, compilers.js, callback);
});

pipeline.runFor(['sass','scss'], function(item, callback) {
    if (path.basename(item).match(/^_.*\.(scss|sass)$/i)) {
        callback();
        return;
    }
    compile(item, compilers.sass, callback);
});

pipeline.runFor(['css','styl','stylus'], function(item, callback) {
    if (path.basename(item).match(/^_.*\.(css|styl|stylus)$/i)) {
        callback();
        return;
    }
    compile(item, new Compiler(require('../compile-func/stylus')), callback);
});

pipeline.runFor(['txt','text'], function(item, callback) {
    compile(item, compilers.text, callback);
});

pipeline.runFor(['yaml','yml'], function(item, callback) {
    compile(item, compilers.yaml, callback);
});

pipeline.runFor(['json'], function(item, callback) {
    compile(item, compilers.json, callback);
});

pipeline.runFor('awfco', function(item, callback) {
    var source = item.replace(/\.awfco$/i, '');
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
    dir.all('awfco').then(function(list) {
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
        'js',
        'jsx','jsx.html',
        'txt','text',
        'json',
        'yaml','yml',
        'sass','scss',
        'css', 'styl', 'stylus'
    ];
	dir.onchange(compilable, function(fnode) {
        if (fnode.path.substr(0, 7) == '_build/')
            return callback();
		pipeline.push(fnode.path);
	});
	dir.onchange('awfco', function(fnode) {
		pipeline.push(fnode.path);
	});
    dir.onunlink(['js','jsx','jsx.html'], function(fnode) {
        console.log('Removed', fnode.path);
        dirty = true;
        var target = path.join('_build', fnode.path + '.awfco');
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
                if (list[i].path.substr(0, 7) == '_build/')
                    continue;
                pipeline.push(list[i].path);
            }
        }).catch(function (e) {
            console.warn(e.stack);
        });
    }, 5000);
    callback();
};

