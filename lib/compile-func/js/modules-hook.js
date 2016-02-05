var moduleName = require('../../compiler').moduleName;
var importPath = require('../../compiler').importPath;

module.exports = modulesHook;

function modulesHook(inOpt) {
    var ret = {};
    ret.dependencies = [];
    var dependencies = {};
    function addDep(dep) {
        if (!dependencies[dep]) {
            ret.dependencies.push(dep);
            dependencies[dep] = true;
        }
    }
    var haveExport = false;
    ret.plugin = function(babel) {
        var types = babel.types;
        var visitor = {};
        visitor.Program = {};
        visitor.Program.exit = function(path, state) {
            var node = path.node;
            var body = node.body;
            if (haveExport) {
                return;
            }
            var name = inOpt.moduleName;
            var scope = path.scope;
            if (!scope.bindings[name] && !scope.globals[name]) {
                return;
            }
            body.push(types.ExpressionStatement(
                types.AssignmentExpression(
                    '=',
                    types.MemberExpression(
                        types.Identifier('exports'),
                        types.Identifier('default')
                    ),
                    types.Identifier(name)
                )
            ));
            body.push(types.ExpressionStatement(
                types.AssignmentExpression(
                    '=',
                    types.MemberExpression(
                        types.Identifier('module'),
                        types.Identifier('exports')
                    ),
                    types.Identifier(name)
                )
            ));
        };
        visitor.ImportDeclaration = function(path, state) {
            var node = path.node;
            var name =  processImport(path);
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
        visitor.ExportAllDeclaration = function(path, state) {
            haveExport = true;
            processImport(path);
        };
        visitor.ExportNamedDeclaration = function(path, state) {
            haveExport = true;
            processImport(path);
        };
        function processImport(path) {
            var node = path.node;
            var name;
            if (node.source.type == 'StringLiteral') {
                var source = node.source.value;
                var noError = source[0] == '@';
                if (noError) {
                    source = source.substr(1);
                }
                source = importPath(source, inOpt.relativePath);
                if (!noError) {
                    addDep(source);
                }
                node.source.value = source;
                name = moduleName(source);
            }
            return name;
        }
        visitor.JSXElement = function() {
            addDep('React');
            addDep('ReactDOM');
        };
        return {
            visitor: visitor
        }
    }
    return ret;
}

