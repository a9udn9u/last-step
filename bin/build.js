#!/usr/bin/env node

'use strict';

const fs = require('fs');
const proc = require('process');
const path = require('path');
const child = require('child_process');
const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const uglifyJS = require('rollup-plugin-uglify');
const less = require('less');

const optionFile = '.last-step.js'

const defaultOptions = {
	/*
	sourceDirectory: 'src',
	targetDirectory: 'public',
	doNotCopy: ['*.js', '*.css', '*.less'],
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
	doNotCopy: ['*.js', '*.css', '*.less']
};

const defaultJsRollupOptions = {
	format: 'es'
};

const defaultJsRollupPluginOptions = {
	babel: {
		babelrc: false,
		exclude: 'node_modules/**',
		presets: ['es2015-rollup', 'stage-1']
	},
	minify: true
}

const defaultCssRollupOptions = {
	minify: true
}

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

	// process js
	bundles.javascript.forEach(bundle => {
		rollup.rollup(bundle).then(result => result.write(bundle));
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

	// copy non-JS, non-CSS files
	let excludes = (options.doNotCopy || []).map(e => `--exclude '${e}'`).join(' ');
	child.exec(`rsync -a --delete --delete-excluded ${excludes} ${options.sourceDirectory}/ ${options.targetDirectory}/`, (err, stdout, stderr) => {
		if (err) throw err;
	});
}

const prepareBundles = options => {
	let bundles = {
		javascript: [],
		css: []
	};

	(options.javascript || []).forEach(bundle => {
		let babelOptions = Object.assign({}, defaultJsRollupPluginOptions.babel, bundle.babel);
		let minify = bundle.minify === undefined ? defaultJsRollupPluginOptions.minify : bundle.minify;

		bundle = Object.assign({}, defaultJsRollupOptions, bundle);
		delete bundle.babel;
		delete bundle.minify;

		bundle.plugins = [];
		if (bundle.babel && Object.keys(bundle.babel)) {
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
		bundles.css.push(Object.assign({}, defaultCssRollupOptions, bundle));
	});

	return bundles;
}

run();
