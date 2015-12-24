var prompt = require('prompt');

module.exports = init;

function init(callback) {
    prompt.message = '';
    prompt.delimiter = '';
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
        pattern: /[a-zA-Z0-9]/,
        message: 'Name of build directory must be made of letter or number'
    }], function(err, choice) {
        if (err) return onErr(err);
        console.log('\nExternal library provider presets:');
        console.log('  1) CDNJS');
        console.log('      - service provided by CloudFlare');
        console.log('      - accessible global wide with steady and considerable speed');
        console.log('      - may have risk of being blocked in China');
        console.log('  2) China Optimized');
        console.log('      - uses Baidu provided static file service as first preference');
        console.log('      - fallback to BootCDN, a fork of CDNJS maintained by BootCSS');
        console.log('      - accessibility optimized for China');
        prompt.get([{
            name: 'libs',
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
    });
}

function doInit(choice, callback) {
    prompt.pause();
    choice.debug = !!choice.debug.match(/^[yt]/i);
    choice.inline = !!choice.inline.match(/^[yt]/i);
    console.log('\nYou may edit awf.conf to change configuration');
    console.log('Run `awf` to start building');
    console.log('Enjoy');
}

function onErr(err) {
    console.error(err.stack || err);
    process.exit(1);
}
