var http = require('http');
var https = require('https');
var fs = require('fs');
var concat = require('concat-stream');
var crypto = require('crypto');
var path = require('path');

module.exports = download;

var counter = 0;

function download(url, dir, callback) {
    var crypt = crypto.createHash('sha1');
    crypt.write(url);
    var dest = crypt.digest()
        .toString('base64')
        .replace(/\=+$/, '')
        .replace(/\//g, '_')
        .replace(/[^0-9a-zA-Z_]/g, '-');
    dest = path.join(dir, dest);
    fs.readFile(dest, function(err, content) {
        if (!err && content) {
            callback(content.toString());
        } else {
            var protocol = url.match(/^https:/) ? https : http;
            protocol.get(url, function(res) {
                if (res.statusCode == 200) {
                    res.pipe(concat(function(content) {
                        var tmpFile = dest + Date.now() + '.' + counter;
                        fs.writeFile(tmpFile, content, function() {
                            fs.rename(tmpFile, dest, function() {
                                callback(content.toString());
                            });
                        });
                    }));
                } else {
                    callback();
                }
            }).on('error', function(err) {
                callback();
            });
        }
    });
}