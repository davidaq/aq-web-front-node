var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var babel = require('babel-core');
var sourcemap = require('sourcemap-codec');

module.exports = compile;

var es2015 = [];
preloadPlugins();

function compile() {
    var inOpt = this.opt;
    out = '';
    var opts = {
        filename: inOpt.relativePath,
        plugins: [],
        presets: [require('babel-preset-react'), require('babel-preset-stage-0')],
        comments: !!inOpt.extra.comments,
        compact: !!inOpt.extra.compact,
        sourceMaps: true,
        highlightCode: false
    }
    var mods = require('./modules-hook')(inOpt);
    opts.plugins.push(mods.plugin);
    var isJSX = !!opts.filename.match(/\.jsx(\.html)?$/i);
    if (isJSX) {
        opts.plugins.push(require('./jsx-view')(inOpt));
    }
    opts.plugins.push(require('./misc'));
    opts.plugins = opts.plugins.concat(es2015);
    opts.plugins.push(require('./common-functions')());
    try {
        var result = babel.transform(inOpt.sourceContent, opts);
    } catch(err) {
        console.warn(err.stack);
        var loc = err.loc || {line:0, column:0};
        err = err.toString() + "\n" + err.codeFrame;
        console.warn(err);
        this.reject(err, loc.line, loc.column);
        return;
    }
    this.jsOutput = result.code;
    this.jsMap.append({
        file: inOpt.relativePath,
        mappings: sourcemap.decode(result.map.mappings)
    });
    for (var i = 0; i < mods.dependencies.length; i++) {
        this.depends(mods.dependencies[i]);
    }
    this.success();
}

function preloadPlugins() {
	console.log('Initialize JS compiler');
	require('babel-preset-react');
	console.log('Loaded react syntax');
	require('babel-preset-stage-0');
	console.log('Loaded JavaScript sugars');
	es2015 = [
		'arrow-functions',
		'block-scoped-functions',
		'block-scoping',
		'classes',
		'computed-properties',
		'constants',
		'destructuring',
		'function-name',
		'literals',
		'object-super',
		'parameters',
		'shorthand-properties',
		'spread',
		'sticky-regex',
		'template-literals',
		'typeof-symbol',
		'unicode-regex',
		['modules-commonjs', {allowTopLevelThis:true}]
	];
	for (var k in es2015) {
		var plugin = es2015[k];
		var opt = {};
		if (plugin instanceof Array) {
			opt = plugin[1] || {};
			plugin = plugin[0];
		} else {
			opt = {};
		}
		opt.loose = true;
		opt.spec = true;
		es2015[k] = [require('babel-plugin-transform-es2015-' + plugin), opt];
		console.log('Loaded', plugin);
	}
    es2015.push(require('babel-plugin-transform-jscript'));

	console.log('JS compiler ready');
	
	return es2015;
}
