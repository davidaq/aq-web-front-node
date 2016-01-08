var stylus = require('stylus');
var nib = require('nib');
var path = require('path');
var uuid = require('uuid').v4;
var fsext = require('../fsext');
var parseurl = require('url').parse;

module.exports = function() {
    var rootDir = path.normalize(this.opt.absolutePath).replace(
        path.normalize(this.opt.relativePath), ''
    );
    
    var rand = new Buffer(uuid().replace('-'), 'hex').toString('base64');
    rand = rand
        .replace(/=/g, '')
        .replace(/-/g, '-0')
        .replace(/\+/g, '-1')
        .replace(/[^a-zA-Z0-9_\-]/g, '-2');
    
    var wrapName = 'STYLE--'
    wrapName += this.opt.importPath.split(/[\/\\]/).map(function(v) {
        return v.replace(/[^a-zA-Z0-9_]/g, '');
    }).join('-');
    wrapName += '---' + rand;

    var inContent = '.' + wrapName + '\n /*placeholder*/\n ' + this.opt.sourceContent.replace(/\n\r?/g, '\n ');
        
    var style = stylus(inContent)
        .include(path.dirname(this.opt.absolutePath))
        .include(rootDir)
        .use(nib())
        .set('filename', this.opt.relativePath)
        .set('compress', true)
        .set('sourcemap', {
            comment: false
        })
        .define('url', (function() {
            function fn(url) {
                var compiler = new stylus.Compiler(url);
                compiler.isURL = true;
                url = url.nodes.map(function(node) {
                    return compiler.visit(node);
                }).join('');
                var literal = new stylus.nodes.Literal('url(' + url + ')');
                url = parseurl(url);
                if (!url || url.protocol || !url.pathname) {
                    return literal;
                }
                var found = stylus.utils.lookup(url.pathname, this.paths);
                if (!found) {
                    return literal;
                }
                url = fsext.normalizePath(path.join(path.basename(rootDir), found));
                return new stylus.nodes.Literal('url(' + url +')');
            }
            fn.raw = true;
            return fn;
        })());
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
                var source = fsext.normalizePath(style.sourcemap.sources[i]);
                var pref = source.substr(0, 3);
                if (path.isAbsolute(source) || pref == '../' || pref == '..\\')
                    continue;
                var idx = this.cssMap.addfile(source);
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
                        comp[2] -= 2;
                        comp[3]--;
                    }
                }
            }
            this.success();
        }
    }
};
