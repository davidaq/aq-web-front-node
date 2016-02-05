var Set = require('../../set');

module.exports = reserved;

var keywordList = [
    'require',
    'module',
    'exports'
];
var keywords = new Set(keywordList);

function reserved(babel) {
    var types = babel.types;
    var visitor = {};
    visitor.Program = {
        enter:function(path, state) {
            state.keywordIdentifier = {};
            for (var i = 0; i < keywordList.length; i++) {
                var keyword = keywordList[i];
                var identifier = path.scope.generateUidIdentifier(keyword);
                state.keywordIdentifier[keyword] = identifier;
            }
        },
        exit:function(path, state) {
            var decl = [];
            for (var i = 0; i < keywordList.length; i++) {
                var keyword = keywordList[i];
                var identifier = state.keywordIdentifier[keyword];
                decl.push({
                    type: 'VariableDeclarator',
                    id: identifier,
                    init: types.Identifier(keyword)
                });
            }
            if (decl.length > 0) {
                path.node.body.unshift({
                    type: 'VariableDeclaration',
                    declarations: decl,
                    kind: 'var'
                });
            }
        }
    };
    visitor.Identifier = function(path, state) {
        if (!keywords.have(path.node.name) || !path.node.container)
            return;
        if (typeof path.node.loc != 'object' || typeof path.node.loc.start != 'object') {
            if (path.container.type == 'MemberExpression' && path.parentKey == 'property')
                return;
            if (path.container.type == 'ObjectProperty' && path.parentKey == 'key')
                return;
            var identifier = state.keywordIdentifier[path.node.name];
            path.replaceWith(identifier);
        } else {
            console.log(path.node.name, path.node.container.type, path.node.parentKey);
        }
    };
    return {visitor:visitor};
}