if (process.env.IS_FORK && process.env.compiler) {
    var compileFunc = require(process.env.compiler);
    process.on('message', function(job) {
        compileFunc(job.inOpt, end(true), end(false));
        if (compileFunc.DEBUG) {
            delete require.cache[require.resolve(process.env.compiler)];
            compileFunc = require(process.env.compiler);
        }
        function end(success) {
            return function() {
                process.send({
                    jobid: job.jobid,
                    success: success,
                    args: Array.prototype.slice.call(arguments, 0)
                });
            }
        }
    });
} else {
    var childProcess = require('child_process');

    module.exports = {openCompiler:openCompiler,close:close};

    function openCompiler(path) {
        var context = this.opened = this.opened || {};
        if (context[path]) {
            return context[path];
        }
        console.log('Open compiler', path);
        var jobmap = {};
        var cp = childProcess.fork(require.resolve('./fork'), {
            env: {IS_FORK:1, compiler:path}
        });
        cp.on('message', function(result) {
            var job = jobmap[result.jobid];
            delete result.jobid;
            job.client.end(new Buffer(JSON.stringify(result)));
            delete jobmap[result.jobid];
        });
        cp.on('close', function(code) {
            if (context[path]) {
                cp = childProcess.fork(require.resolve('./fork'), {
                    env: {IS_FORK:1, compiler:path}
                });
            }
        });
        return context[path] = {
            send: function(job, client) {
                job.jobid = (Date.now() + Math.random()) + '';
                job.client = client;
                jobmap[job.jobid] = job;
                cp.send({
                    jobid: job.jobid,
                    inOpt: job.inOpt
                });
            },
            kill: function() {
                cp.kill();
            }
        };
    }
    function close() {
        if (!this.opened) {
            return;
        }
        for (var k in this.opened) {
            this.opened[k].kill();
        }
        this.opened = {};
    }

}
