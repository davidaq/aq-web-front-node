var yaml = require('yamljs');

module.exports = function(inOpt, success, reject) {
    try {
        var out = JSON.stringify(yaml.parse(inOpt.sourceContent));
        success(
            'module.exports=' + out + ';',
            [[[0,0,0,0]]]
        );
    } catch(err) {
        reject(err.toString(), err.parsedLine - 1, 0);
    }
};

module.exports.DEBUG = true;
