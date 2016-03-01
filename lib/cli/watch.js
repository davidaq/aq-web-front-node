"use strict";

var fs = require('fs');
var path = require('path');
var fsext = require('../fsext');
var Pipeline = require('../pipeline');
var Compiler = require('../compiler');
var dir = require('../dir');

var conf;

loadConf(function() {
    dir.onready(function() {
        pipeline.ready();
    });
});

var compilable = [
    'js',
    'jsx','jsx.html',
    'txt','text',
    'json',
    'yaml','yml',
    'styl', 'stylus'
];
dir.onchange(compilable, function(fnode) {
    if (startsWith(fnode.path, conf.build_dir + '/'))
        return callback();
    pipeline.push(fnode.path);
});
dir.onunlink(compilable, function(fnode) {
    console.log('Removed', fnode.path);
    var target = path.join(conf.build_dir, fnode.path + '.awfco');
    if (dir.fetch(target)) {
        fs.unlink(target, link);
        fs.unlink(target + '_info', link);
    } else {
        link();
    }
});
dir.onchange('awfco', function(fnode) {
    pipeline.push(fnode.path);
});
dir.onunlink('awfco', function(fnode) {
    var source = sourceOf(fnode.path);
    if (dir.fetch(source)) {
        pipeline.push(source);
    }
});
dir.onchange('conf', function(fnode) {
    if (fnode.path == 'awf.conf') {
        loadConf(link);
    }
});
setInterval(function() {
    if (!pipeline.idle) return;
    dir.all(compilable).then(function(list) {
        for (var i = 0; i < list.length; i++) {
            if (startsWith(list[i].path, conf.build_dir + '/'))
                continue;
            pipeline.push(list[i].path);
        }
        link();
    }).catch(function (e) {
        console.warn(e.stack);
    });
}, 1500);

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

pipeline.runFor(['styl','stylus'], function(item, callback) {
    if (path.basename(item).match(/^_.*\.(styl|stylus)$/i)) {
        callback();
        return;
    }
    //compile(item, compilers.stylus, callback);
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
    if (dir.fetch(sourceOf(item))) {
        link();
        callback();
    } else {
        fs.unlink(item, function() {
            link();
            callback();
        });
    }
});

var lastLinkTime = 0;

pipeline.runFor('@link', function(item, callback) {
    var targetName = path.basename(path.resolve('.'));
    dir.all('awfco').then(function(list) {
        var confTime = dir.fetch('awf.conf').time;
        var dirty = confTime > lastLinkTime;
        var minTime = 0;
        if (dirty) {
            minTime = confTime;
        }
        var files = list.map(function(item) {
            if (item.time > minTime)
                minTime = item.time;
            if (item.time > lastLinkTime)
                dirty = true;
            return item.path;
        }).filter(function(item) {
            if(dir.fetch(sourceOf(item))) {
                return true;
            }
            fs.unlink(item, function() {});
            return false;
        });
        if (dirty && files.length > 0) {
            console.log('Link ' + targetName);
            lastLinkTime = minTime;
            require('../link')(files, '../' + targetName, conf, callback);
        } else {
            callback();
        }
    }).catch(function(err) {
        console.log(err.stack);
    });
});

function sourceOf(target) {
    return target.replace(new RegExp("^" + conf.build_dir + "[\\/\\\\]|\\.awfco$", "gi"), '');
}

function link() {
    pipeline.push('@link');
}

function compile(item, compiler, callback) {
    var target = path.join(conf.build_dir, item + '.awfco');
    dir.fetch(target, function(targetItem) {
        if (!targetItem) {
			fs.mkdir(path.dirname(target), run);
        } else if (targetItem.time < (dir.fetch(item) || {time:Date.now()}).time) {
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

var yaml = require('yamljs');
function loadConf(cb) {
    fs.readFile('awf.conf', function(err, content) {
        if (err) {
            process.exit();
        } else {
            try {
                conf = yaml.parse(content.toString().replace(/\t/g, '    '));
            } catch(e) {
                console.error(e);
            }
            if (cb) cb();
        }
    });
}

function startsWith(str, find) {
    return str.substr(0, find.length) == find;
}
