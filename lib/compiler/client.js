var path = require('path');
var traceback = require('traceback');
var server = require('./server');

module.exports = client;

function client(modulePath) {
    var reqPath = modulePath;
    if (reqPath.match(/^\.\.?\//)) {
        var trace = traceback();
        if (!trace[1]) {
            throw new Error("Function must be called, you shouldn't even be here!");
        }
        reqPath = path.join(path.dirname(trace[1].path || trace[1].script), reqPath);
    }
    reqPath = require.resolve(reqPath);
    server.compile(reqPath);
    return function(inOpt, success, reject) {
        server.compile(reqPath, inOpt, success, reject);
    };
}

