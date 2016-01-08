var yaml = require('yamljs');

module.exports = function() {
    try {
        var out = JSON.stringify(yaml.parse(this.opt.sourceContent));
        this.jsOutput = 'module.exports=' + out + ';\n';
        this.jsMap.append({
            file: this.opt.relativePath,
            mappings: [[[0,0,0,0]]]
        });
        this.success();
    } catch(err) {
        this.reject(err.toString(), err.parsedLine - 1, 0);
    }
};

