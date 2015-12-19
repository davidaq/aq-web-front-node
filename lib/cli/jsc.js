
module.exports = function(callback, args) {
    var compileServer = require('../compiler/server');
    if (args.stop) {
        compileServer.stop(function(port, newStart) {
            console.log('Compiler server stoped');
        });
    } else {
        compileServer.start(function(port, newStart) {
            if (newStart) {
                console.log('Compiler server started on port', port);
            } else {
                console.log('Existing compiler server discovered on port', port);
            }
        });
    }
}
