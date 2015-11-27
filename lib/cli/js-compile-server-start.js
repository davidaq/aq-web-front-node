
module.exports = function(callback) {
    var compileServer = require('../compile-js/server');
    compileServer.start(function(port, newStart) {
        if (newStart) {
            console.log('JS compiler started on port', port);
        } else {
            console.log('JS compiler discovered on port', port);
        }
    });
}
