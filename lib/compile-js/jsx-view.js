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
        };
        visitor.JSXElement = function(path, state) {
            if (gotElement) 
                return;
            gotElement = true;
            var node = path.node;
            var clone = {};
            for (var k in node) {
                clone[k] = node[k];
            }
            delete clone._path;
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
                            types.ReturnStatement(clone)
                        ]),
                        false,
                        false
                    )
                ])
            });
            path.parentPath.replaceWith(replace);
        };
        return { visitor: visitor };
    }
}
