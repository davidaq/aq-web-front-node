var stylus = require('stylus');
var nib = require('nib');
var uuid = require('uuid').v4;
var fsext = require('../fsext');

module.exports = function() {
    var rootDir = path.normalize(this.opt.absolutePath).replace(
        path.normalize(this.opt.relativePath), ''
    );

    var wrapName = uuid();
    wrapName = new Buffer(wrapName.replace('-'), 'hex').toString('base64');
    wrapName += '-' + this.opt.moduleName;
    wrapName = wrapName.replace(/=/g, '')
        .replace(/\+/g, '_0')
        .replace(/[^a-zA-Z0-9_\-]/g, '_1');
    wrapName = '_AQW_' + wrapName;

    var inContent = '.' + wrapName + '\n ' + this.opt.sourceContent.replace(/\n\r?/g, '\n ');
        
    var style = stylus(inContent)
        .set('filename', this.opt.relativePath)
        //.set('compress', true)
        .include(path.dirname(this.opt.absolutePath))
        .include(rootDir)
        .use(nib())
        .set('sourcemap', {
            comment: false,
            inline: true
        });
    style.render(result.bind(this));
    function result(err, css) {
        if (err) {
            this.reject({
                message: err.toString()
                        .replace(new RegExp('\\.' + wrapName, 'g'), 'root'),
                path: err.filename,
                content: err.input,
                line: err.lineno - 2 || 0,
                column: err.column - 1 || 0
            });
        } else {
            var midx = 0;
            for (var i = 0; i < style.sourcemap.sources.length; i++) {
                var source = style.sourcemap.sources[i];
                var idx = this.cssMap.addfile(source,
                        style.sourcemap.sourcesContent[i]);
                if (source == this.opt.relativePath) {
                    midx = idx;
                }
                this.watch(source);
            }
            this.jsOutput = 'module.exports=' + JSON.stringify(wrapName) + ';\n';
            this.jsMap.mappings.push([]);
            this.cssOutput = css.replace(/\/\*.*\*\//g, '');
            this.cssMap.append(style.sourcemap.mappings);
            for (var i = 0; i < this.cssMap.mappings.length; i++) {
                var line = this.cssMap.mappings[i];
                for (var j = 0; j < line.length; j++) {
                    var comp = line[j];
                    if (comp[1] == midx) {
                        comp[2]--;
                    }
                    comp[3]--;
                }
            }
            this.success();
        }
    }
};
