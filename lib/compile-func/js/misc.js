var Set = require('../../set');

module.exports = misc;

var keywords = new Set([
    'return',
    'switch',
    'case',
    'default',
    'while',
    'if',
    'do',
    'for',
    'else',
    'try',
    'catch',
    'undefined',
    'true',
    'false',
    'typeof',
    'instanceof',
    'null',
    'function',
    'break',
    'continue',
    'var',
    'in',
    'delete',
    'status'
]);

function misc(babel) {
    var types = babel.types;
    var visitor = {};
    var postVisitor = {};
    postVisitor.MemberExpression = function(path) {
        var node = path.node;
        if (node.property.type != 'Identifier') {
            return;
        }
        if (keywords.have(node.property.name)) {
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
        if (keywords.have(node.key.name)) {
            var nkey = types.StringLiteral(node.key.name);
            nkey.start = node.key.start;
            nkey.end = node.key.end;
            nkey.loc = node.key.loc;
            node.key = nkey;
        }
    };
    visitor.Program = {
        enter: function(path, state) {
            for(var i = 0; i < path.node.body.length; i++) {
                var statement = path.node.body[i];
                if (statement.type != 'VariableDeclaration' || statement.kind != 'let')
                    continue;
                for (var j = 0; j < statement.declarations.length; j++) {
                    var decl = statement.declarations[j];
                    if (!decl.init && decl.id.name == 'DisableBoundObject') {
                        state.DisableBoundObject = true;
                        break;
                    }
                }
            }
        },
        exit:function(path) {
            path.traverse(postVisitor);
        }
    };
    visitor.ExportNamedDeclaration = function(path) {
        if (path.node.declaration && path.node.declaration.type == 'ClassDeclaration') {
            if (Array.isArray(path.container)) {
                path.node.declaration.marked = true;
                path.insertAfter(state({
                    type: 'AssignmentExpression',
                    operator: '=',
                    left: types.MemberExpression(
                        path.node.declaration.id,
                        types.Identifier('$$$AWF$$$Class')
                    ),
                    right: types.NumericLiteral(1)
                }));
            }
        }
    };
    visitor.ClassDeclaration = function(path) {
        if (path.node.id && !path.node.marked) {
            if (Array.isArray(path.container)) {
                path.node.marked = true;
                path.insertAfter(state({
                    type: 'AssignmentExpression',
                    operator: '=',
                    left: types.MemberExpression(
                        path.node.id,
                        types.Identifier('$$$AWF$$$Class')
                    ),
                    right: types.NumericLiteral(1)
                }));
            }
        }
    };
    visitor.ClassExpression = function(path) {
        if (!path.node.marked) {
            path.node.marked = true;
            var cls = path.scope.generateUidIdentifier("cls");
            var replace = types.CallExpression({
                type: 'FunctionExpression',
                params: [cls],
                body: {
                    type: 'BlockStatement',
                    body: [state({
                        type: 'AssignmentExpression',
                        operator: '=',
                        left: types.MemberExpression(
                            cls,
                            types.Identifier('$$$AWF$$$Class')
                        ),
                        right: types.NumericLiteral(1)
                    }),{
                        type: 'ReturnStatement',
                        argument: cls
                    }]
                }
            }, [path.node]);
            path.replaceWith(replace);
        }
    };
    visitor.MemberExpression = function(path) {
        if (path.parentPath.node.type == 'JSXExpressionContainer'
                && path.parentPath.parentPath.node.type == 'JSXAttribute') {
            var node = path.node;
            var prop = node.property;
            if (!prop.computed && prop.type == 'Identifier')
                prop = types.StringLiteral(prop.name);
            var replace = types.CallExpression(
                types.MemberExpression(
                    types.MemberExpression(
                        types.Identifier('$$$AWF$$$'),
                        types.Identifier('es6')
                    ),
                    types.Identifier('_boundProp')
                ),
                [node.object, prop]
            );
            path.replaceWith(replace);
        }
    };
    function forIter(iterValMem) {
        return function(path) {
            var node = path.node;
            var iterator = path.scope.generateUidIdentifier("iter");
            var body = node.body;
            if (body.type != 'BlockStatement') {
                body = {
                    type: 'BlockStatement',
                    body: [body]
                };
            }
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

    function updateSignal(target, expression) {
        if (typeof target.loc != 'object' || typeof target.loc.start != 'object' || !('line' in target.loc.start))
            return;
        if (target.type == 'MemberExpression' && !target.object.antiLoop) {
            var prop = target.property;
            if (!target.computed && prop.type == 'Identifier')
                prop = types.StringLiteral(prop.name);
            var objP = this.scope.generateUidIdentifier("o");
            objP.antiLoop = true;
            var keyP = this.scope.generateUidIdentifier("o");
            var retP = this.scope.generateUidIdentifier("o");
            var body = {
                type: 'FunctionExpression',
                params: [objP, keyP, retP],
                body: {
                    type: 'BlockStatement',
                    body: [state({
                        type: 'AssignmentExpression',
                        left: retP,
                        right: expression(objP, keyP),
                        operator: '='
                    }), state(types.CallExpression(
                        types.MemberExpression(
                            types.Identifier('$$$AWF$$$'),
                            types.Identifier('signal')
                        ), [
                        objP, keyP
                    ])),{
                        type: 'ReturnStatement',
                        argument: retP
                    }]
                }
            };
            this.replaceWith(
                types.CallExpression(
                    types.CallExpression(
                        types.MemberExpression(body, types.Identifier('bind')),
                        [types.Identifier('this')]),
                [target.object, prop])
            );
        }
    }
    function state(expr) {
        return {
            type: 'ExpressionStatement',
            expression: expr
        };
    }
    visitor.AssignmentExpression = function(path, state) {
        if (state.DisableBoundObject || path.node.noBoundObject) return;
        updateSignal.call(path, path.node.left, function(objP, keyP) {
            return {
                type: 'AssignmentExpression',
                left: types.MemberExpression(objP, keyP, true),
                right: path.node.right,
                operator: path.node.operator
            };
        });
    };
    visitor.UpdateExpression = function(path, state) {
        if (state.DisableBoundObject) return;
        updateSignal.call(path, path.node.argument, function(objP, keyP) {
            return {
                type: 'UpdateExpression',
                argument: types.MemberExpression(objP, keyP, true),
                operator: path.node.operator,
                prefix: path.node.prefix
            };
        });
    };
    visitor.UnaryExpression = function(path, state) {
        if (state.DisableBoundObject) return;
        if (path.node.operator != 'delete') return;
        updateSignal.call(path, path.node.argument, function(objP, keyP) {
            return {
                type: 'UnaryExpression',
                argument: types.MemberExpression(objP, keyP, true),
                operator: path.node.operator,
                prefix: path.node.prefix
            };
        });
    };
    return {visitor:visitor}
}
