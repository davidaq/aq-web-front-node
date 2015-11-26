
var modulePath = require('./module-path');

module.exports = modulesHook;

function modName(fpath) {
    var path = require('path');
    var name = path.basename(fpath);
    name = name.replace(/\.js$/i, '');
    name = name.replace(/[^$a-zA-Z0-9_]+/g, '_');
    if (name.match(/^[0-9]/)) {
        name = '';
    }
    return name;
}


function modulesHook(fpath) {
    var ret = {};
    ret.dependencies = [];
    var dependencies = {};
    var haveExport = false;
    ret.plugin = function(babel) {
        var types = babel.types;
        var visitor = {};
        visitor.Program = {};
        visitor.Program.exit = function(path, state) {
            var node = path.node;
            var body = node.body;
            var expr;
            if (!haveExport) {
                var name = modName(fpath);
                var scope = path.scope;
                if (name && (scope.bindings[name] || scope.globals[name])) {
                    var def = types.MemberExpression(
                            types.Identifier('exports'),
                            types.StringLiteral('default'),
                            true
                            )
                    expr = types.AssignmentExpression(
                            '=',
                            def,
                            types.Identifier(name)
                            );
                    body.push(types.ExpressionStatement(expr));
                    var exp = types.MemberExpression(
                            types.Identifier('module'),
                            types.Identifier('exports')
                            )
                    expr = types.AssignmentExpression('=', exp, def);
                    body.push(types.ExpressionStatement(expr));
                }
            }
            expr = types.FunctionExpression(null, [
                        types.Identifier('module'),
                        types.Identifier('exports')
                    ], types.BlockStatement(body));
            expr = types.CallExpression(
                types.Identifier('require'),
                [types.StringLiteral(fpath), expr]
            );
            expr = types.ExpressionStatement(expr);
            node.body = [expr];
            path.replaceWith(node);
        };
        visitor.ImportDeclaration = function(path, state) {
            var node = path.node;
            var name;
            if (node.source.type == 'StringLiteral') {
                var source = modulePath(node.source.value);
                if (!dependencies[source]) {
                    ret.dependencies.push(source);
                    dependencies[source] = true;
                }
                name = modName(source);
            }
            if (!node.specifiers || !node.specifiers.length) {
                if (name) {
                    var id = types.Identifier(name);
                    var specifier = types.ImportDefaultSpecifier(id);
                    node.specifiers = [specifier];
                }
            }
        };
        visitor.ExportDeclaration = function(path, state) {
            haveExport = true;
        };
        return {
            visitor: visitor
        }
    }
    return ret;
}
