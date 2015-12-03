var path = require('path');
var server = require('./server');

module.exports = client;

function client(modulePath) {
    var reqPath = modulePath;
    if (reqPath.match(/^\.\.?\//)) {
        var caller;
        try {
            caller = new Error().stack.split('\n')[2];
            caller = caller.match(/\((.*):[0-9]+:[0-9]+\)/)[1];
        } catch(e) {
            throw new Error('Unable to get caller');
        }
        reqPath = path.join(path.dirname(caller), reqPath);
    }
    reqPath = require.resolve(reqPath);
    server.compile(reqPath);
    return function(inOpt, success, reject) {
        server.compile(reqPath, inOpt, success, reject);
    };
}

function getStack() {
    var origPrepareStackTrace = Error.prepareStackTrace;
    Error.prepareStackTrace = function (_, stack) {
        return stack;
    };
    var err = new Error();
    var stack = err.stack;
    Error.prepareStackTrace = origPrepareStackTrace;
    stack.shift();
    stack.shift();
    return stack
}