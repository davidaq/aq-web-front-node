
module.exports = function() {
    this.jsOutput = 'module.exports=' + JSON.stringify(this.opt.sourceContent) + ';\n';
    this.jsMap.append({
        file: this.opt.relativePath,
        content: this.opt.sourceContent,
        mappings: [[[0,0,0,0]]]
    });
    this.success();
};
