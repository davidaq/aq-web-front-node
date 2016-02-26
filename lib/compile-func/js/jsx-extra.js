var tracenode = require('./tracenode');

module.exports = jsxExtra;

function jsxExtra(babel) {
    var types = babel.types;
    var visitor = {};
    visitor.JSXElement = function(path) {
        var node = path.node, onode = path.node;
        if (!node.openingElement) return;
        if (!node.openingElement) return;
        if (!node.openingElement.name) return;
        switch (node.openingElement.name.name) {
        case 'Cases':
            var children = node.children;
            if (Array.isArray(children) && children[0]) {
                var check, strict;
                if (node.openingElement.attributes) {
                    node.openingElement.attributes.map(function(v) {
                        if (v.name) {
                            if (v.name.name == 'of') {
                                check = v.value;
                            } else if (v.name.name == 'notStrict') {
                                strict = v.value;
                            }
                        }
                    });
                }
                if (!strict) {
                    if (check) strict = types.Identifier('true');
                    else strict = types.Identifier('false');
                }
                if (!check) check = types.Identifier('true');
                else if (check.type == 'JSXExpressionContainer')
                    check = check.expression;
                var body = [];
                var checkVar = path.scope.generateUidIdentifier('c');
                var strictVar = path.scope.generateUidIdentifier('c');
                var checkValVar = path.scope.generateUidIdentifier('c');
                body.push({
                    type: 'VariableDeclaration',
                    declarations: [{
                        type: 'VariableDeclarator',
                        id: checkVar,
                        init: check
                    },{
                        type: 'VariableDeclarator',
                        id: strictVar,
                        init: strict
                    },{
                        type: 'VariableDeclarator',
                        id: checkValVar,
                        init: null
                    }],
                    kind: 'var'
                });
                children.map(function(v) {
                    if (!v.openingElement) return;
                    var checkVal;
                    if (v.openingElement.attributes) {
                        v.openingElement.attributes = v.openingElement.attributes.filter(function(v) {
                            if (v.name && v.name.name == 'if') {
                                checkVal = v.value;
                                return false;
                            }
                            return true;
                        });
                    }
                    if (!checkVal) {
                        checkVal = types.Identifier('true');
                    } else if (checkVal.type == 'JSXExpressionContainer')
                        checkVal = checkVal.expression;
                    body.push({
                        type: 'ExpressionStatement',
                        expression: {
                            type: 'AssignmentExpression',
                            operator: '=',
                            left: checkValVar,
                            right: checkVal
                        }
                    });
                    body.push({
                        type: 'IfStatement',
                        test: {
                            type: 'ConditionalExpression',
                            test: strictVar,
                            consequent: {
                                type: 'BinaryExpression',
                                operator: '===',
                                left: checkVar,
                                right: checkValVar
                            },
                            alternate: {
                                type: 'BinaryExpression',
                                operator: '==',
                                left: checkVar,
                                right: checkValVar
                            }
                        },
                        consequent: {
                            type: 'ReturnStatement',
                            argument: v
                        }
                    });
                });
                node = {
                    type: 'JSXExpressionContainer',
                    expression: {
                        type: 'CallExpression',
                        callee: {
                            type: 'ArrowFunctionExpression',
                            params: [],
                            id: null,
                            generator: false,
                            expression: false,
                            async: false,
                            extra: {parenthesized:true},
                            body: {
                                type: 'BlockStatement',
                                directives: [],
                                body: body
                            }
                        },
                        arguments: []
                    }
                };
            }
            break;
        }
        if (onode.openingElement.attributes) {
            var condition;
            onode.openingElement.attributes = onode.openingElement.attributes.filter(function(v) {
                if (v.name && v.name.name == 'if') {
                    condition = v.value;
                    return false;
                }
                return true;
            });
            if (condition) {
                if (condition.type == 'JSXExpressionContainer')
                    condition = condition.expression;
                if (node.type == 'JSXElement') {
                    node = {
                        type: 'JSXExpressionContainer',
                        expression: {
                            type: 'ConditionalExpression',
                            test: condition,
                            consequent: node,
                            alternate: types.identifier('null')
                        }
                    };
                } else if (node.type == 'JSXExpressionContainer') {
                    node.expression = {
                        type: 'ConditionalExpression',
                        test: condition,
                        consequent: node.expression,
                        alternate: types.identifier('null')
                    };
                }
            }
        }
        if (node.type == 'JSXExpressionContainer' && path.parent && path.parent.type != 'JSXElement')
            node = node.expression;
        if (node != onode)
            path.replaceWith(node);
    };
    return {visitor:visitor};
}
