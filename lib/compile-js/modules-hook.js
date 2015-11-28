module.exports = modulesHook;

function modulesHook(fpath) {
    var ret = {};
    ret.dependencies = [];
    ret.modPath = modulePath(fpath);
    ret.modName = modName(fpath);
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
				if (name.match(/^[0-9]/)) {
					name = '';
				}
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
            path.replaceWith(node);
        };
        visitor.ImportDeclaration = function(path, state) {
            var node = path.node;
            var name;
            if (node.source.type == 'StringLiteral') {
                var source = modulePath(node.source.value, fpath);
                if (source[0] == '@') {
                    source = source.substr(1);
                } else if (!dependencies[source]) {
                    ret.dependencies.push(source);
                    dependencies[source] = true;
                }
                node.source.value = source;
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

function modName(fpath) {
    var path = require('path');
    var name = path.basename(fpath);
	name = name.split('.')[0] || '';
    name = name.replace(/[^$a-zA-Z0-9_]+/g, '_');
    return name;
}

function modulePath(modPath, contextPath) {
    var path = require('path');
	var isRelative = !!modPath.match(/\.\.?[\/\\]/);
	var name = modName(modPath);
	modPath = path.dirname(modPath);
    if (name != 'index') {
        modPath = path.join(modPath, name);
    }
    if (contextPath && isRelative) {
		modPath = path.join(path.dirname(contextPath), modPath);
    }
    modPath = path.normalize(modPath);
    modPath = modPath.replace(/\\+/g, '/');
    return modPath;
}
