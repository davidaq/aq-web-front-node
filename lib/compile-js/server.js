var udp = require('dgram');
var tcp = require('net');
var childProcess = require('child_process');
var concat = require('concat-stream');
var path = require('path');

exports.start = start;
exports.stop = stop;
exports.compile = compile;

/**
 * Starts a compiler server if none is available.
 * Returns the available (or newly started server port) through callback
 **/
function start(callback) {
    searchForExisting(function(port) {
        if (port) {
            callback(port, false);
        } else {
            var cp = childProcess.fork(require.resolve('./compile'), {
                env: {IS_FORK:1}
            });
            var jobMap = {};
            cp.on('message', function(jobid) {
                var job = jobMap[jobid];
                job.client.end(new Buffer([0,0,0]));
            });
            var server = tcp.createServer({allowHalfOpen:true}, function(client) {
                client.pipe(concat(function(data) {
                    if (data.length == 3 && data[0] == 0) {
                        client.end();
                        closeAll();
                    } else {
                        var job;
                        try {
                            job = JSON.parse(data);
                        } catch (e) {
                            client.end();
                            return;
                        }
                        job.jobid = (Date.now() + Math.random()) + '';
                        client.on('error', function(err) {
                            console.warn(err.toString());
                        });
                        jobMap[job.jobid] = {
                            job: job,
                            client: client
                        }
                        cp.send(job);
                    }
                }));
            });
            var announcer;
            server.listen(function() {
                var port = server.address().port;
                announcer = udp.createSocket({
                    type: 'udp4',
                    reuseAddr: true
                });
                announcer.on('error', bindAnnoucer);
                var announcerPort = 15301;
                function bindAnnoucer() {
                    if (announcerPort <= 15304) {
                        announcer.bind(announcerPort);
                        announcerPort++;
                    } else {
                        console.error('UDP port 15301-15304 is all occupied please keep at least one available');
                        announcer = null;
                        closeAll();
                        server.on('close', function() {
                            process.exit(2);
                        });
                    }
                }
                bindAnnoucer();
                var sendPack = new Buffer([15,30,19,74,7,0,0]);
                sendPack.writeUInt16LE(port, 5);
                announcer.on('message', function(msg, rinfo) {
                    announcer.send(sendPack, 0, 7, rinfo.port, rinfo.address);
                });
                callback(port, true);
            });
            server.on('error', function() {
                console.error('JS compiler server failed to start');
            });
            function closeAll() {
                cp.kill();
                if (announcer) {
                    announcer.close();
                }
                server.close();
            }
        }
    });
}

/**
 * Emit stop signal to existing compiler server.
 * Callback will be called when server ends or 10 seconds timeout.
 */
function stop(callback) {
    searchForExisting(function(port) {
        if (port) {
            var client = tcp.connect({port:port}, function() {
                client.write(new Buffer([0,0,0]));
                client.end();
            });
            client.on('close', function() {
                callback();
            });
        } else {
            callback();
        }
    });
}

/**
 * Send compile job to a new or existing server
 */
function compile(fpath, target, callback) {
    start(function(port) {
        var client = tcp.connect({port:port,allowHalfOpen:true}, function() {
            client.end(new Buffer(JSON.stringify({
                fpath: fpath,
                target: target,
                relativeTo: path.resolve('.')
            })));
            client.on('close', function() {
                callback();
            });
        });
    });
}

//= Internal functions

function searchForExisting(callback) {
    var sock = udp.createSocket({
        type: 'udp4',
        reuseAddr: true
    });
    sock.bind();
    sock.on('message', function(msg, rinfo) {
        if (msg.length == 7
            && msg[0] == 15 
            && msg[1] == 30
            && msg[2] == 19 
            && msg[3] == 74
            && msg[4] == 7) {
            closeAll();
            callback(msg.readUInt16LE(5));
        }
    });
    sock.send(new Buffer([1]), 0, 1, 15301, '127.0.0.1');
    sock.send(new Buffer([1]), 0, 1, 15302, '127.0.0.1');
    sock.send(new Buffer([1]), 0, 1, 15303, '127.0.0.1');
    sock.send(new Buffer([1]), 0, 1, 15304, '127.0.0.1');
    sock.unref();
    var sendDelay = setTimeout(function() {
        sendDelay = false;
        sock.send(new Buffer([1]), 0, 1, 15301, '127.0.0.1');
        sock.send(new Buffer([1]), 0, 1, 15302, '127.0.0.1');
        sock.send(new Buffer([1]), 0, 1, 15303, '127.0.0.1');
        sock.send(new Buffer([1]), 0, 1, 15304, '127.0.0.1');
    }, 200);
    var timeout = setTimeout(function() {
        closeAll();
        callback(false);
    }, 400);
    function closeAll() {
        clearTimeout(timeout);
        if (sendDelay)
            clearTimeout(sendDelay);
        sock.close();
    }
}
