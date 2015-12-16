module.exports = misc;

var keywords = {
    'return':1,
    'switch':1,
    'case':1,
    'default':1,
    'while':1,
    'if':1,
    'do':1,
    'for':1,
    'else':1,
    'try':1,
    'catch':1,
    'undefined':1,
    'true':1,
    'false':1,
    'typeof':1,
    'instanceof':1,
    'null':1,
    'function':1,
    'break':1,
    'continue':1,
    'var':1,
    'in':1
};

function misc(babel) {
    var visitor = {};
    var types = babel.types;
    visitor.MemberExpression = function(path) {
        var node = path.node;
        if (node.property.type != 'Identifier') {
            return;
        }
        if (node.property.name in keywords) {
            path.replaceWith(types.MemberExpression(
                node.object,
                types.StringLiteral(node.property.name),
                true
            ));
        }
    };
    visitor.Property = function(path) {
        var node = path.node;
        if (node.key.type != 'Identifier') {
            return;
        }
        if (node.key.name in keywords) {
            var nkey = types.StringLiteral(node.key.name);
            nkey.start = node.key.start;
            nkey.end = node.key.end;
            nkey.loc = node.key.loc;
            node.key = nkey;
        }
    };
    return {visitor:{
        Program:{exit: function(path) {
            path.traverse(visitor);
        }}
    }};
}
