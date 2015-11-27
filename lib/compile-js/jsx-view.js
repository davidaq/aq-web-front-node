module.exports = jsxView;

function jsxView(babel) {
    var types = babel.types;
    var visitor = {};
    var gotElement = false;
    visitor.JSXElement = function(path, state) {
        var node = path.node;
        var replace = types.FunctionDeclaration(
                types.Identifier('renderFunc'),
                [],
                types.BlockStatement([
                    types.ReturnStatement(types.Identifier('me'))
                    ])
                );
        path.replaceWith(replace);
    };
    return { visitor: visitor };
}
