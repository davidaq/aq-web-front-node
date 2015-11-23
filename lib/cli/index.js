var yargs = require('yargs');

var steps = {
     init: require('./init'),
    build: require('./build'),
     auto: require('./auto'),
    clean: require('./clean'),
    serve: require('./serve')
};

var op = [];

var args = yargs.argv;
for (var i = 0; i < args._.length; i++) {
    var step = steps[args._[i]];
    if (typeof step == 'function') {
        op.push(step);
    } else {
        console.log(args._[i], 'is not a valid command');
    }
}

(function next() {
    if (op.length > 0) {
        var step = op.shift();
        step(next);
    }
})();
