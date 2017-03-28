#!/usr/bin/env node

'use strict';

const fs = require('fs');
const proc = require('process');
const path = require('path');
const child = require('child_process');
const minify = require('html-minifier').minify;
const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const uglifyJS = require('rollup-plugin-uglify');
const less = require('less');

const optionFile = '.last-step.js';

const defaultOptions = {
	/*
	sourceDirectory: 'src',
	targetDirectory: 'public',
	doNotCopy: ['*.html', '*.js', '*.css', '*.less'],
	html: [
		{
			entries: ['index.html'],
			minifyCSS: true,
			minifyJS: true
		}
	],
	javascript: [
		{
			entry: 'script-1.js',
			dest: 'production.js',
			format: 'es',
			external: ['npm-dep-1', 'npm-dep-2'],
			babel: {
				babelrc: false,
				exclude: 'node_modules/**',
				presets: ['es2015-rollup', 'stage-1']
			},
			minify: true
		}
	],
	css: [
		{
			entries: ['style-1.less', 'style-2.css'],
			dest: 'production.css',
			minify: true
		}
	]
	*/
	sourceDirectory: 'src',
	targetDirectory: 'public',
	doNotCopy: ['*.html', '*.js', '*.css', '*.less']
};

const defaultHtmlOptions = {
	minify: true
};

const defaultHtmlPluginOptions = {
	collapseBooleanAttributes: true,
	collapseWhitespace: true,
	decodeEntities: true,
	html5: true,
	minifyCSS: true,
	minifyJS: true,
	processConditionalComments: true,
	removeAttributeQuotes: true,
	removeComments: true,
	removeEmptyAttributes: true,
	removeOptionalTags: true,
	removeRedundantAttributes: true,
	removeScriptTypeAttributes: true,
	removeStyleLinkTypeAttributes: true,
	removeTagWhitespace: true,
	sortAttributes: true,
	sortClassName: true,
	trimCustomFragments: true,
	useShortDoctype: true
}

const defaultJsOptions = {
	format: 'es'
};

const defaultJsPluginOptions = {
	babel: {
		babelrc: false,
		exclude: 'node_modules/**',
		presets: ['es2015-rollup', 'stage-1']
	},
	minify: true
};

const defaultCssOptions = {
	minify: true
};

const run = () => {
	// change to package root directory
	let root = proc.cwd();
	while (true) {
		let pkg = path.resolve(root, './package.json');
		if (fs.statSync(pkg).isFile()) {
			proc.chdir(root);
			break;
		}
		root = path.resolve(root, './..');
		if (root === '/') {
			throw 'This command needs to be run inside of a NPM package directory.';
		}
	}

	// load user options
	let userOptions = {};
	if (fs.statSync(`./${optionFile}`).isFile()) {
		userOptions = require(path.resolve(`./${optionFile}`));
	}

	// merge options, prepare bundles
	let options = Object.assign({}, defaultOptions, userOptions);
	let bundles = prepareBundles(options);

	// copy non-JS, non-CSS files
	let excludes = (options.doNotCopy || []).map(e => `--exclude '${e}'`).join(' ');
	child.exec(`rsync -a --delete --delete-excluded ${excludes} ${options.sourceDirectory}/ ${options.targetDirectory}/`, (err, stdout, stderr) => {
		if (err) throw err;
	});

	// process html
	bundles.html.forEach(bundle => {
		if (bundle.minify) {
			(bundle.entries || []).forEach(entry => {
				fs.readFile(entry.source, { encoding: 'utf8' }, (err, data) => {
					if (err) throw err;
					fs.writeFile(entry.target, minify(data, bundle.htmlOptions), 'utf8', err => {
						if (err) throw err;
					});
				});
			});
		} else if (bundle.entries.length) {
			bundle.entries.map(e => {
				child.exec(`rsync ${e.source} ${e.target}`, (err, stdout, stderr) => {
					if (err) throw err;
				});
			});
		}
	});

	// process js
	bundles.javascript.forEach(bundle => {
		rollup.rollup(bundle)
			.then(result => result.write(bundle))
			.catch(err => { throw err; });
	});

	// process css
	bundles.css.forEach(bundle => {
		Promise.all(bundle.entries.map(entry => {
			return new Promise((resolve, reject) => {
				fs.readFile(entry, { encoding: 'utf8' }, (err, data) => err ? reject(err) : resolve(data));
			});
		}))
			.then(data => {
				less.render(data.join('\n'), { compress: !!bundle.minify })
					.then(out => fs.writeFile(bundle.dest, out.css, 'utf8', err => {
						if (err) throw err;
					}))
					.catch(err => {
						throw err;
					});
			})
			.catch(err => {
				throw err;
			});
	});
}

const prepareBundles = options => {
	let bundles = {
		html: [],
		javascript: [],
		css: []
	};

	(options.html || []).forEach(bundle => {
		let htmlOptions = Object.assign({}, bundle);
		delete htmlOptions.entries;
		delete htmlOptions.minify;
		bundles.html.push({
			entries: bundle.entries.map(p => {
				return { source: `${options.sourceDirectory}/${p}`, target: `${options.targetDirectory}/${p}` };
			}),
			minify: bundle.minify === undefined ? defaultHtmlOptions.minify : bundle.minify,
			htmlOptions: Object.assign({}, defaultHtmlPluginOptions, htmlOptions)
		});
	});

	(options.javascript || []).forEach(bundle => {
		let minify = bundle.minify === undefined ? defaultJsPluginOptions.minify : bundle.minify;
		let babelOptions = Object.keys(bundle.babel || {}).length ? Object.assign({}, defaultJsPluginOptions.babel, bundle.babel) : undefined;

		bundle = Object.assign({}, defaultJsOptions, bundle);
		delete bundle.babel;
		delete bundle.minify;

		bundle.plugins = [];
		if (babelOptions) {
			bundle.plugins.push(babel(babelOptions));
		}
		if (minify) {
			bundle.plugins.push(uglifyJS());
		}

		bundle.entry = `${options.sourceDirectory}/${bundle.entry}`;
		bundle.dest = `${options.targetDirectory}/${bundle.dest}`;

		bundles.javascript.push(bundle);
	});

	(options.css || []).forEach(bundle => {
		bundle.entries = bundle.entries.map(path => `${options.sourceDirectory}/${path}`);
		bundle.dest = `${options.targetDirectory}/${bundle.dest}`;
		bundles.css.push(Object.assign({}, defaultCssOptions, bundle));
	});

	return bundles;
}

run();
