"uses strict";
var sourcemapCodec = require('sourcemap-codec');

module.exports = SourceMap;

/**
 * Object for holding, manipulating and compiling source maps.
 *
 * Call `toString` to get version 3 source map content in string.
 *
 * Call `append` to merge another source map to the end of this one.
 */
function SourceMap(input) {
    if (!(this instanceof SourceMap)) {
        return new SourceMap(input);
    }
    this.file = [];
    this.mappings = [];
    this.filemap = {};
    if (input && typeof input == 'object') {
        if (input instanceof SourceMap) {
            return input;
        } else {
            this.append(input);
        }
    }
}

SourceMap.prototype.append = function(input) {
    var files = false;
    if (typeof input == 'string' || input instanceof Array) {
        input = {
            mappings: input
        };
    } else {
        files = input.sources || input.file;
        if (typeof files == 'string') {
            files = [files];
        }
        if (files instanceof Array && files.length) {
            for (var i = 0; i < files.length; i++) {
                this.addfile(files[i]);
            }
        } else {
            files = false;
        }
    }
    if (typeof input.mappings == 'string') {
        input.mappings = sourcemapCodec.decode(input.mappings);
    }
    for (var li = 0; li < input.mappings.length; li++) {
        var line = input.mappings[li];
        var oline = [];
        for (var ci = 0; ci < line.length; ci++) {
            var comp = line[ci].slice(0, 4);
            if (files) {
                comp[1] = this.filemap[files[comp[1]]] || 0;
            }
            oline.push(comp);
        }
        this.mappings.push(oline);
    }
};

SourceMap.prototype.addfile = function(file) {
    if (file in this.filemap) {
        return this.filemap[file];
    }
    var idx = this.file.length;
    this.file.push(file);
    this.filemap[file] = idx;
    return idx;
};

SourceMap.prototype.toString = function() {
    var obj = this.toJSON();
    obj.version = 3;
    obj.mappings = sourcemapCodec.encode(obj.mappings);
    if (this.sourceRoot)
        obj.sourceRoot = this.sourceRoot;
    return JSON.stringify(obj);
};

SourceMap.prototype.toJSON = function() {
    return {
        sources: this.file,
        mappings: this.mappings
    };
};

