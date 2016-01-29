module.exports = tracenode;

function tracenode(node, indentLen) {
    if (!indentLen) {
        console.log(tracenode(node, 1));
    } else if (typeof node == 'object') {
        if (node instanceof Array) {
            if (node.length == 0)
                return '[]';
            return '[\n' + indent(indentLen + 2)
                + node.map(function(v) {
                    return tracenode(v, indentLen + 2);
                }).join(',\n' + indent(indentLen + 2))
                + '\n' + indent(indentLen) + ']';
        } else if(node) {
            if (indentLen > 20)
                return '[Object object]';
            var ret = [];
            for (var k in node) {
                if (k[0] == '_')
                    continue;
                ret.push(indent(indentLen + 2) + k + ': ' + tracenode(node[k], indentLen + 2));
            }
            if (ret.length == 0)
                return '{}';
            return '{\n' 
                + ret.join(',\n')
                + '\n' + indent(indentLen) + '}';
            } else {
                return 'null';
            }
    } else {
        return node;
    }
}

function indent(len) {
    var ret = '';
    for (var i = 0; i < len; i++) {
        ret += ' ';
    }
    return ret;
}
