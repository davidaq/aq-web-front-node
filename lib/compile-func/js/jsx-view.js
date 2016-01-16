module.exports = jsxView;

function jsxView(inOpt) {
    var gotElement = false;
    return function(babel) {
        var types = babel.types;
        var visitor = {};
        visitor.Program = function(path, state) {
            var node = path.node;
            node.body.unshift({
                type: 'ImportDeclaration',
                sepcifiers: [],
                source: types.StringLiteral('React')
            });
            path.replaceWith(node);
			for (var i = 0; i < node.body.length; i++) {
				if (node.body[i].type == 'ExpressionStatement' 
						&& node.body[i].expression.type == 'JSXElement') {
					gotElement = node.body[i];
					break;
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
                id: types.Identifier(inOpt.moduleName + 'JSX'),
                superClass: types.MemberExpression(
                    types.Identifier('React'),
                    types.Identifier('Component')
                ),
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
        return { visitor: visitor };
    };
}
