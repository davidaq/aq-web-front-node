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
    'in':1,
    'delete':1
};

function misc(babel) {
    var types = babel.types;
    var visitor = {};
    var postVisitor = {};
    postVisitor.MemberExpression = function(path) {
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
    postVisitor.Property = function(path) {
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
    visitor.Program = {exit:function(path) {
        path.traverse(postVisitor);
    }};
    visitor.ClassDeclaration = function(path) {
        if (path.node.id) {
            path.insertAfter({
                type: 'ExpressionStatement',
                expression: {
                    type: 'AssignmentExpression',
                    operator: '=',
                    left: types.MemberExpression(
                        path.node.id,
                        types.Identifier('$$$AWF$$$Class')
                    ),
                    right: types.NumericLiteral(1)
                }
            });
        }
    };
    visitor.MemberExpression = function(path) {
        if (path.parentPath.node.type == 'JSXExpressionContainer'
                && path.parentPath.parentPath.node.type == 'JSXAttribute') {
            var node = path.node;
            var replace = types.CallExpression(
                types.MemberExpression(
                    types.MemberExpression(
                        types.Identifier('$$$AWF$$$'),
                        types.Identifier('es6')
                    ),
                    types.Identifier('_boundProp')
                ),
                [node.object, node]
            );
            path.replaceWith(replace);
        }
    };
    function forIter(iterValMem) {
        return function(path) {
            var node = path.node;
            var iterator = path.scope.generateUidIdentifier("iter");
            var body = node.body;
            var replace = {
                type: 'ForStatement',
                init: {
                    type: 'VariableDeclaration',
                    declarations: [{
                        type: 'VariableDeclarator',
                        id: iterator,
                        init: types.CallExpression(
                            types.MemberExpression(
                                types.MemberExpression(
                                    types.Identifier('$$$AWF$$$'),
                                    types.Identifier('es6')
                                ),
                                types.Identifier('_iterator')
                            ),
                            [node.right]
                        )
                    }],
                    kind: 'var'
                },
                test: types.CallExpression(
                    types.MemberExpression(iterator, types.Identifier('next')),
                    []
                ),
                update: null,
                body: body
            };
            var update = node.left;
            var iterVal = types.CallExpression(
                types.MemberExpression(iterator, types.Identifier(iterValMem)),
                []
            );
            if (update.type == 'VariableDeclaration') {
                var decl = update.declarations[0];
                if (decl) {
                    decl.init = iterVal;
                }
            } else {
                update = {
                    type: 'AssignmentExpression',
                    operator: '=',
                    left: update,
                    right: iterVal
                };
            }
            body.body.unshift(update);
            path.replaceWith(replace);
        };
    }
    visitor.ForOfStatement = forIter('value');
    visitor.ForInStatement = forIter('key');
    return {visitor:visitor}
}
