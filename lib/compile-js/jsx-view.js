module.exports = jsxView;

function jsxView() {
    var gotElement = false;
    return function(babel) {
        var types = babel.types;
        var visitor = {};
        visitor.Program = function(path, state) {
            var node = path.node;
            node.body.unshift({
                type: 'ImportDeclaration',
                sepcifiers: [],
                source: types.StringLiteral('View')
            });
            path.replaceWith(node);
			for (var i = 0; i < node.body.length; i++) {
				if (node.body[i].type == 'ExpressionStatement' 
						&& node.body[i].expression.type == 'JSXElement') {
					gotElement = node.body[i];
				}
			}
        };
        visitor.ExpressionStatement = function(path, state) {
			var node = path.node;
			if (gotElement != node)
                return;
			node = node.expression;
            var replace = types.ExportDefaultDeclaration({
                type: 'ClassDeclaration',
                id: types.Identifier('BaseView'),
                superClass: types.Identifier('View'),
                body: types.ClassBody([
                    types.ClassMethod(
                        'method',
                        types.Identifier('render'),
                        [],
                        types.BlockStatement([
                            types.ReturnStatement(node)
                        ]),
                        false,
                        false
                    )
                ])
            });
            path.replaceWith(replace);
        };
        visitor.MemberExpression = function(path) {
            if (path.parentPath.node.type == 'JSXExpressionContainer'
                    && path.parentPath.parentPath.node.type == 'JSXAttribute'
                    && path.parentPath.parentPath.node.name.name.match(/^on[A-Z][a-z][a-zA-Z]+$/)) {
                var node = path.node;
                var replace = types.CallExpression(
                    types.MemberExpression(node, types.Identifier('bind')),
                    [node.object]
                );
                path.replaceWith(replace);
            }
        };
        return { visitor: visitor };
    };
}
