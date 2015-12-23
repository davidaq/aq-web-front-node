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
        description: 'Build directory:',
        default: '_build',
        pattern: /[a-zA-Z0-9]/,
        message: 'Name of build directory must be made of letter or number'
    }], function(err, result) {
        if (err) {return onErr(err)}
        console.log(result);
    });
}

function onErr(err) {
    console.error(err.stack || err);
    process.exit(1);
}