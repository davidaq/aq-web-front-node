var Tokenizer = require('json-tokenizer');

module.exports = compile;
function compile() {
    var inOpt = this.opt;
    try {
        var out = JSON.stringify(JSON.parse(inOpt.sourceContent));
        this.jsOutput = 'module.exports=' + out + ';\n';
        this.jsMap.append({
            file: inOpt.relativePath,
            mappings: [[[0,0,0,0]]]
        });
        this.success();
    } catch(err) {
        var originalErr = err.toString();
        var self = this;
        var lines = inOpt.sourceContent.split(/\r?\n\r?/);
        var currentLine = -1;
        var currentCol = 0;
        var tokLen = 0;
        var shouldEOF = false;
        var ended = false;

        var braceStack = [];

        function onToken(token) {
            if (ended)
                return;
            var line = lines[currentLine];
            currentCol += tokLen;
            while (line[currentCol] == ' ' || line[currentCol] == '\t') {
                currentCol++;
            }
            tokLen = token.content.length;
            if (shouldEOF) {
                end('Expecting EOF');
            }
            var expect;
            if (braceStack.length) {
                expect = braceStack[braceStack.length - 1][3];
            } else {
                expect = 'value';
            }
            switch(token.type) {
                case 'unexpected':
                    unexpected();
                    break;
                case 'begin-object':
                    if (expect == 'value') {
                        braceStack.push(['object', currentLine, currentCol, 'key', true]);
                    } else if (expect == 'key') {
                        end('Object key must be a string');
                    } else {
                        unexpected();
                    }
                    break;
                case 'begin-array':
                    if (expect == 'value') {
                        braceStack.push(['array', currentLine, currentCol, 'value', true]);
                    } else if (expect == 'key') {
                        end('Object key must be a string');
                    } else {
                        unexpected();
                    }
                    break;
                case 'end-object':
                case 'end-array':
                    var brace = braceStack.pop();
                    if (brace) {
                        if (expect == ',' || brace[4]) {
                            if ('end-' + brace[0] != token.type) {
                                end('Expected end of' + brace[0] + ' but got end of ' + token.type.replace('end-', ''));
                            }
                            gotValue();
                        } else {
                            unexpected();
                        }
                    } else {
                        unexpected();
                    }
                    break;
                case 'symbol':
                    if (expect == 'key') {
                        end('Strict JSON object key must be a string');
                    } else {
                        unexpected();
                    }
                    break;
                case 'string':
                    if (expect == 'key') {
                        gotKey();
                    } else if (expect == 'value') {
                        gotValue();
                    } else {
                        unexpected();
                    }
                    break;
                case 'number':
                    if (expect == 'value') {
                        gotValue();
                    } else if (expect == 'key') {
                        end('Object key must be a string');
                    } else {
                        unexpected();
                    }
                    break;
                case 'comma':
                    if (expect != ',') {
                        unexpected();
                    } else {
                        var brace = braceStack[braceStack.length - 1];
                        if (brace[0] == 'object') {
                            brace[3] = 'key';
                        } else {
                            brace[3] = 'value';
                        }
                    }
                    break;
                case 'end-label': 
                    if (expect != ':') {
                        unexpected();
                    } else {
                        var brace = braceStack[braceStack.length - 1];
                        if (brace[0] == 'object') {
                            brace[3] = 'value';
                        } else {
                            end('Key labels can only be used in an object');
                        }
                    }
                    break;
            }
            function unexpected() {
                if (expect.length == 1) {
                    expect = '"' + expect + '"';
                }
                end('Expecting ' + expect + ' but got "' + token.content + '"');
            }
            function gotKey() {
                if (braceStack.length) {
                    var brace = braceStack[braceStack.length - 1];
                    if (brace[0] == 'object') {
                        brace[3] = ':';
                        brace[4] = false;
                        return;
                    }
                }
                end('Object key must be in an object');
            }
            function gotValue() {
                if (braceStack.length == 0) {
                    shouldEOF = true;
                } else {
                    var brace = braceStack[braceStack.length - 1];
                    brace[3] = ',';
                    brace[4] = false;
                }
            }
        }
        function end(msg) {
            if (ended)
                return;
            ended = true;
            if (!msg && braceStack.length) {
                var brace = braceStack.pop();
                msg = 'Untermiated ' + brace[0];
                currentLine = brace[1];
                currentCol = brace[2];
                tokLen = 1;
            }
            if (!msg) {
                msg = originalErr.replace('SyntaxError: ', '');
            } else {
                msg = msg + '\n';
                if (lines[currentLine - 1]) {
                    msg += lines[currentLine - 1] + '\n';
                }
                var line = lines[currentLine];
                var pre = line.substr(0, currentCol);
                var tok = line.substr(currentCol, tokLen);
                var post = line.substr(currentCol + tokLen);
                msg += pre + ' < ' + tok + ' > ' + post;
                if (lines[currentLine + 1]) {
                    msg += '\n' + lines[currentLine + 1];
                }
            }
            self.reject('SyntaxError: ' + msg, currentLine, currentCol);
        }
        function checkLine(line, callback) {
            if (ended)
                return;
            currentCol = 0;
            tokLen = 0;
            var tok = new Tokenizer();
            tok.on('data', onToken);
            tok.on('error', function(err) {
                var symbol = err.toString().match(/"(.*)"/);
                if (symbol) {
                    symbol = symbol[1];
                    onToken({
                        type: 'unexpected',
                        content: symbol,
                        toString: function() {
                            return this.content;
                        }
                    });
                } else {
                    end(err.toString());
                }
            });
            tok.on('end', callback);
            tok.end(line);
        }
        (function next() {
            if (ended)
                return;
            currentLine++;
            if (currentLine >= lines.length) {
                currentLine = 0;
                end();
            } else {
                checkLine(lines[currentLine], next);
            }
        })();
    }
};

