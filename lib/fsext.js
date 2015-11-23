var fs = require('fs');
var path = require('path');

module.exports.changeExt = function(fpath, ext) {
    fpath = path.parse(fpath);
    return path.join(fpath.dir, fpath.name + '.' + ext);
}
