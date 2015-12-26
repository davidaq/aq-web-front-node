var prompt = require('prompt');
var fs = require('fs');
var path = require('path');
var yaml = require('yamljs');

module.exports = init;

prompt.message = '';
prompt.delimiter = '';

var pwd, targetName, targetDir;

function init(callback) {
    pwd = path.resolve('.');
    targetName = path.basename(pwd);
    targetDir = path.dirname(pwd);
    warnExists([
        'awf.conf',
        path.join(targetDir, targetName + '.js'),
        path.join(targetDir, targetName + '.css')
    ], choosePreference.bind(0, callback));
}

function choosePreference(callback) {
    prompt.get([{
        name: 'debug',
        description: 'activate debug mode',
        default: 'yes',
        pattern: /^(y|n|yes|no|t|f|true|false)$/i,
        message: 'Must be yes or no'
    },{
        name: 'build_dir',
        description: 'build directory:',
        default: '_build',
        pattern: /[a-zA-Z0-9_]/,
        message: 'Name of build directory must be made of letter, number or underscore'
    }], function(err, choice) {
        if (err) return onErr(err);
        warnExists(choice.build_dir, choosePreset.bind(0, choice, callback));
    });
}

function choosePreset(choice, callback) {
    console.log('\nExternal library provider presets:');
    console.log('  1) CDNJS');
    console.log('      - CDN service provided by CloudFlare');
    console.log('      - accessible global wide with steady and considerable speed');
    console.log('      - may have risk of being blocked in China');
    console.log('  2) BootCDN');
    console.log('      - CDN service provided by UPYun');
    console.log('      - keep updated with CDNJS, maintained by Bootstrap in China');
    console.log('      - accessibility optimized for China');
    prompt.get([{
        name: 'preset',
        description: 'preset choice',
        default: 1,
        pattern: /^(1|2)$/,
        message: 'Must be 1 or 2'
    },{
        name: 'inline',
        description: 'inline preset libraries when used',
        default: 'yes',
        pattern: /^(y|n|yes|no|t|f|true|false)$/i,
        message: 'Must be yes or no'
    }], function(err, choice2) {
        if (err) return onErr(err);
        for (var k in choice2) choice[k] = choice2[k];
        doInit(choice, callback);
    });
}

function doInit(choice, callback) {
    prompt.pause();
    choice.debug = !!choice.debug.match(/^[yt]/i);
    choice.inline = !!choice.inline.match(/^[yt]/i);
    var preset = require('./libPreset' + choice.preset);
    for (var k in preset) {
        preset[k].inline = true;
    }
    var content = {
        debug: choice.debug,
        build_dir: choice.build_dir,
        libs: preset
    };
    fs.writeFile('awf.conf', yaml.stringify(content, 4), function() {
        console.log('\nYou may edit awf.conf to change configuration');
        console.log('Run `awf` to start building');
        console.log('Enjoy');
        process.exit(0);
    });
}

function warnExists(fpath, callback) {
    if (!(fpath instanceof Array)) {
        return warnExists([fpath], callback);
    }
    var counter = fpath.length;
    var existed = [];
    for (var i = 0; i < fpath.length; i++) {
        fs.stat(fpath[i], (function(err, exists) {
            if (err && err.code != 'ENOENT') {
                return onErr(err);
            }
            if (exists) {
                existed.push(this);
            }
            counter--;
            if (counter <= 0) {
                if (existed.length > 0) {
                    existed = existed.map(function(v) {
                        return path.basename(v);
                    }).join(', ');
                    onWarn(existed + ' already exists', callback);
                } else {
                    callback();
                }
            }
        }).bind(fpath[i]));
    }
}

function onWarn(msg, callback) {
    console.log(msg);
    prompt.get([{
        name: 'go',
        description: 'continue anyway',
        default: 'no',
        pattern: /^(y|n|yes|no|t|f|true|false)$/i,
        message: 'Must be yes or no'
    }], function(err, result) {
        if (err) return onErr(err);
        if (result.go.match(/^[yt]/i)) {
            callback();
        } else {
            process.exit(1);
        }
    });
}

function onErr(err) {
    console.error(err.stack || err);
    process.exit(1);
}
