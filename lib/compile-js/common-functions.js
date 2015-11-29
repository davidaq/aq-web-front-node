module.exports = commonFunctions;

var commons = require('./res/awf').common;

function commonFunctions() {
    return function(babel) {
        var types = babel.types;
		var postVisitor = {};
        var visitor = {};
		visitor.Program = {exit:function(path) {
			path.traverse(postVisitor);
		}};
		visitor.BinaryExpression = function(path) {
			if (path.node.operator == 'instanceof') {
				path.replaceWith(types.CallExpression({
						type: 'MemberExpression',
						object: {
							type: 'MemberExpression',
							object: types.Identifier('$$$AWF$$$'),
							property: types.Identifier('common')
						},
						property: types.Identifier('_instanceof')
					},
					[path.node.left, path.node.right]
				));
			}
		};
        postVisitor.FunctionDeclaration = function(path, state) {
			var funcID = path.node.id;
			if (funcID.start !== undefined || funcID.end !== undefined || funcID.loc !== undefined)
				return;
			var funcName = funcID.name.replace(/[0-9]+$/, '');
			if (commons[funcName]) {
				path.replaceWith({
					type: 'VariableDeclaration',
					kind: 'var',
					declarations: [
						types.VariableDeclarator(
							funcID,
							{
								type: 'MemberExpression',
								object: {
									type: 'MemberExpression',
									object: types.Identifier('$$$AWF$$$'),
									property: types.Identifier('common')
								},
								property: types.Identifier(funcName)
							}
						)
					]
				});
			}
		};
        return {
            visitor: visitor
        }
    }
}