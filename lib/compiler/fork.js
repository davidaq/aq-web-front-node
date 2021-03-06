
if (process.env.IS_FORK && process.env.compiler) {
    var compileFunc = require(process.env.compiler);
    var CompileProcess = require('./compile-process').derive(compileFunc);
    process.on('message', function(job) {
        new CompileProcess().compile(job.inOpt).then(function() {
            process.send({
                jobid: job.jobid,
            });
        });
    });
} else {
    var childProcess = require('child_process');

    module.exports = {openCompiler:openCompiler,close:close};

    function openCompiler(path) {
        var context = this.opened = this.opened || {};
        if (context[path]) {
            return context[path];
        }
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
