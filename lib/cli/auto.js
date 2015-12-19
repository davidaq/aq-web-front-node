"use strict";

var fs = require('fs');
var path = require('path');
var fsext = require('../fsext');
var Pipeline = require('../pipeline');
var Compiler = require('../Compiler');
var dir = require('../dir');

module.exports = auto;

function auto(callback) {
    var compilable = [
        'js',
        'jsx','jsx.html',
        'txt','text',
        'json',
        'yaml','yml',
        'styl', 'stylus'
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
        var target = path.join('_build', fnode.path + '.awfco');
        if (dir.fetch(target)) {
            fs.unlink(target, link);
            fs.unlink(target + '_info', link);
        } else {
            link();
        }
    });
    setInterval(function() {
        if (!pipeline.idle) return;
        dir.all(compilable).then(function(list) {
            for (var i = 0; i < list.length; i++) {
                if (list[i].path.substr(0, 7) == '_build/')
                    continue;
                pipeline.push(list[i].path);
            }
            link();
        }).catch(function (e) {
            console.warn(e.stack);
        });
    }, 2000);
    callback();
}

var compilers = (function(list) {
    var ret = {};
    for (var i = 0; i < list.length; i++) {
        var k = list[i];
        ret[k] = new Compiler(Compiler.served('../compile-func/' + k));
    }
    return ret;
})(['js','text','json','yaml','stylus']);

var pipeline = new Pipeline();

pipeline.runFor(['js','jsx','jsx.html'], function(item, callback) {
    compile(item, compilers.js, callback);
});

pipeline.runFor(['css','styl','stylus'], function(item, callback) {
    if (path.basename(item).match(/^_.*\.(css|styl|stylus)$/i)) {
        callback();
        return;
    }
    compile(item, compilers.stylus, callback);
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
    fs.exists(sourceOf(item), function(exists) {
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
    var targetName = path.basename(path.resolve('.'));
    fs.stat('../' + targetName + '.js', function(err, jsStat) {
        jsStat = !err && jsStat ? jsStat.mtime.getTime() : 0;
        fs.stat('../' + targetName + '.css', function(err, cssStat) {
            cssStat = !err && cssStat ? cssStat.mtime.getTime() : 0;
            run(jsStat > cssStat ? cssStat : jsStat);
        });
    });
    function run(targetTime) {
        dir.all('awfco').then(function(list) {
            var dirty = false;
            var files = list.map(function(item) {
                if (item.time > targetTime)
                    dirty = true;
                return item.path;
            }).filter(function(item) {
                return !!dir.fetch(sourceOf(item));
            });
            if (dirty && files.length > 0) {
                console.log('Link ' + targetName);
                require('../link')(files, '../' + targetName, callback);
            } else {
                callback();
            }
        }).catch(function(err) {
            console.log(err.stack);
        });
    }
});

function sourceOf(target) {
    return target.replace(/^_build[\/\\]|\.awfco$/gi, '');
}

function link() {
    pipeline.push('@link');
}

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
            link();
            callback();
        });
	}
}
