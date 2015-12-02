var Tokenizer = require('json-tokenizer');

module.exports = function(inOpt, success, reject) {
    try {
        var out = JSON.stringify(JSON.parse(inOpt.sourceContent));
        success(
            'module.exports=' + out + ';',
            [[[0,0,0,0]]]
        );
    } catch(err) {
        var tok = new Tokenizer();
        tok.on('data', function(token) {
            console.log(token);
        });
        tok.on('error', function(err) {
            console.log('error', err, err.line);
            reject(err.toString().replace('SyntaxError: could not tokenize', 'Unable to parse'), currentLine, 0);
        });
        tok.on('end', function() {
            reject('Unknown JSON parse error', 0, 0);
        });
        var lines = inOpt.sourceContent.split('\n');
        var currentLine = -1;
        function next() {
            currentLine++;
            if (currentLine >= lines.length) {
                tok.end();
            } else {
                if (tok.write(lines[currentLine])) {
                    next();
                } else {
                    tok.on('drain', next);
                }
            }
        }
        next();
    }
};

module.exports.DEBUG = true;
