#!/usr/bin/env node

'use strict';

const path = require('path');
const proc = require('process');

const defaults = require('./defaults');
const utils = require('./utils');
const html = require('./html');
const css = require('./css');
const js = require('./js');

const getUserOptions = userFile => {
  let absPath = path.resolve(userFile);
  try {
    return require(absPath);
  } catch (err) {
    utils.warn(`${absPath} not readable, will use default settings.`);
    return {};
  }
};

const getOptions = optionFile => {
  let options = utils.shallowMerge(defaults.options, getUserOptions(optionFile));
  options.manifest = utils.listAllFiles(options.sourceDirectory, true);
  options.html = options.html || [];
  options.css = options.css || [];
  options.javascript = options.javascript || [];
  return options;
}

const run = () => {
  proc.chdir(utils.getPackageRoot());

  let options = getOptions(path.resolve(`./${defaults.optionFile}`));
  let promises = [];

  if (options.html.length) {
    promises.push(html.process(options.html, options, defaults.htmlMinifierOptions));
  }

  if (options.css.length) {
    promises.push(css.process(options.css,  options, defaults.lessOptions));
  }

  if (options.javascript.length) {
    promises.push(js.process(options.javascript, options,
        defaults.rollupOptions, defaults.babelOptions, defaults.nodeResolveOptions,
        defaults.uglifyJSOptions));
  }

  Promise.all(promises)
    .then(files => {
      let sources = files.reduce((flat, batch) => flat.concat(batch.sources), []);
      let targets = files.reduce((flat, batch) => flat.concat(batch.targets), []);
      let shouldCopy = options.manifest.filter(e => sources.indexOf(e) === -1);
      let targetManifest = targets.concat(shouldCopy);

      utils.copyFiles(options.sourceDirectory, options.targetDirectory, shouldCopy);
      utils.cleanDirectory(options.targetDirectory, targetManifest);
    })
    .catch(err => {
      throw err;
    });
}

run();
