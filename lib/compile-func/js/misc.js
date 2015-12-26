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
    visitor.ForOfStatement = function(path) {
        var node = path.node;
        var iterator = path.scope.generateUidIdentifier("iter");
        var iteratee = path.scope.generateUidIdentifier("iter");
        var keys = path.scope.generateUidIdentifier("iter");
        var length = path.scope.generateUidIdentifier("iter");
        path.insertBefore({
            type: 'VariableDeclaration',
            declarations: [{
                type: 'VariableDeclarator',
                id: iteratee,
                init: node.right
            }],
            kind: 'var'
        });
        var block = {
            type: 'BlockStatement',
            body: []
        };
        var replace = {
            type: 'IfStatement',
            test: {
                type: 'BinaryExpression',
                operator: '&&',
                left: iteratee,
                right: {
                    type: 'BinaryExpression',
                    operator: '===',
                    left: types.StringLiteral('object'),
                    right: {
                        type: 'UnaryExpression',
                        operator: 'typeof',
                        prefix: true,
                        argument: iteratee
                    }
                }
            },
            consequent: block
        };
        block.body.push({
            type: 'VariableDeclaration',
            declarations: [{
                type: 'VariableDeclarator',
                id: keys,
                init: {
                    type: 'ConditionalExpression',
                    test: types.CallExpression( 
                        types.MemberExpression(
                            types.Identifier('Array'),
                            types.Identifier('isArray')
                        ),
                        [iteratee]
                    ),
                    consequent: types.NumericLiteral(0),
                    alternate: types.CallExpression(
                        types.MemberExpression(
                            types.Identifier('Object'),
                            types.Identifier('keys')
                        ),
                        [iteratee]
                    )
                }
            },{
                type: 'VariableDeclarator',
                id: iterator,
                init: types.NumericLiteral(0)
            },{
                type: 'VariableDeclarator',
                id: length,
                init: {
                    type: 'ConditionalExpression',
                    test: keys,
                    consequent: types.MemberExpression(
                        keys,
                        types.Identifier('length')
                    ),
                    alternate: types.MemberExpression(
                        iteratee,
                        types.Identifier('length')
                    )
                }
            }],
            kind: 'var'
        });
        var body = node.body;
        var iterVal = {
            type: 'ConditionalExpression',
            test: keys,
            consequent: types.MemberExpression(
                iteratee,
                types.MemberExpression(
                    keys,
                    iterator,
                    true
                ),
                true
            ),
            alternate: types.MemberExpression(
                iteratee,
                iterator,
                true
            )
        };
        var update = node.left;
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
        block.body.push({
            type: 'ForStatement',
            init: null,
            test: {
                type: 'BinaryExpression',
                operator: '<',
                left: iterator,
                right: length
            },
            update: {
                type: 'UpdateExpression',
                operator: '++',
                prefix: true,
                argument: iterator
            },
            body: body
        });
        path.replaceWith(replace);
    };
    return {visitor:visitor}
}
