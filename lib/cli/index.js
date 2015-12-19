var steps = {
    auto: './auto',
    jsc:  './jsc'
};

var args = require('yargs').argv;
var command = args._[0] || 'auto';
var op = require(steps[command]);
if (typeof op == 'function') {
    op(function() {
    }, args);
} else {
    console.log(command, 'is not a valid command');
}
