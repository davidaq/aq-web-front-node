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
    return function() {
        var self = this;
        server.compile(reqPath, self.opt, function() {
            self._callback();
        });
    };
}

