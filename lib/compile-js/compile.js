var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var babel = require('babel-core');
var sourcemap = require('sourcemap-codec');

module.exports = compile;

var es2015 = preloadPlugins();

function compile(fpath, target, callback, relativeTo) {
    if (!relativeTo) {
        relativeTo = '.';
    }
    fs.readFile(path.join(relativeTo, fpath), 'utf-8', function(err, content) {
        if (err) {
            callback(err);
        } else {
            var out = '';
			var opts = {
				filename: fpath,
				plugins: [],
				presets: ['stage-0','react'],
				comments: false,
				//compact: true,
				sourceMaps: true,
				highlightCode: false
			}
            var mods = require('./modules-hook')(fpath);
			opts.plugins.push(mods.plugin);
            var jsx = !!fpath.match(/\.jsx(\.html)?$/i);
            if (jsx) {
                opts.plugins.push(require('./jsx-view')());
                mods.dependencies.push('View');
            }
			opts.plugins = opts.plugins.concat(es2015);
			opts.plugins.push(require('./common-functions')());
            try {
                var result = babel.transform(content, opts);
                var code = '$$$AWF$$$.define(' 
                        + JSON.stringify(mods.modPath) 
                        + ', function(module, exports, require) {\n';
                code += result.code;
                code += '\n});\n';
                result.map = sourcemap.decode(result.map.mappings);
                _(result.map).each(function(line) {
                    _(line).each(function(item) {
                        if (item.length > 4)
                            item.splice(4);
                    });
                });
                result.map.unshift([[0, 0, 0, 0]]);
                result.map.push([]);
				out = JSON.stringify({
					code: code,
					map: result.map,
					source: content
				});
            } catch(err) {
                var loc = err.loc || {line:0,column:0};
                err = err.toString() + "\n" + err.codeFrame;
                console.warn(err);
				out = JSON.stringify({
					code: 'console.error(' + JSON.stringify(err) + ')\n',
					map: [[[0,0,0,0]]],
					source: content
				});
            }
            var info = JSON.stringify({
                dep:mods.dependencies,
                path:mods.modPath,
                source:fpath
            });
            callback = _.after(2, callback);
            fs.writeFile(path.join(relativeTo, target), out, callback);
            fs.writeFile(path.join(relativeTo, target) + '_info', info, callback);
        }
    });
}

function preloadPlugins() {
	console.log('Initialize JS compiler');
	require('babel-preset-react');
	console.log('Loaded react syntax');
	require('babel-preset-stage-0');
	console.log('Loaded JavaScript sugars');
	var es2015 = [
		'arrow-functions',
		'block-scoped-functions',
		'block-scoping',
		'classes',
		'computed-properties',
		'constants',
		'destructuring',
		'for-of',
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

	console.log('JS compiler ready');
	
	return es2015;
}

if (process.env.IS_FORK) {
    process.on('message', function(job) {
        compile(job.fpath, job.target, function() {
            process.send(job.jobid);
        }, job.relativeTo);
    });
}
