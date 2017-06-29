const path = require('path');
const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const uglify = require('rollup-plugin-uglify');
const resolve = require('rollup-plugin-node-resolve');
const utils = require('./utils');

const transformEntries = entries => entries.reduce((memo, entry) => {
  memo[entry.entry.toString()] = (entry.dest || entry.entry).toString();
  return memo;
}, {});

module.exports = {
  process: (bundles, options, defaultRollupOptions, defaultBabelOptions, defaultNodeResolveOptions,
      defaultUglifyJSOptions) => {
    let promises = [];
    let targets = [];
    bundles.forEach(bundle => {
      let entries = transformEntries(bundle.entries || []);
      let bundleRollupOptions = utils.shallowMerge(defaultRollupOptions, bundle.rollupOptions);
      let babelOptions = utils.shallowMerge(defaultBabelOptions, bundle.babelOptions);
      let nodeResolveOptions = utils.shallowMerge(defaultNodeResolveOptions,
          bundle.nodeResolveOptions);
      let uglifyJSOptions = utils.shallowMerge(defaultUglifyJSOptions, bundle.uglifyJSOptions);
      bundleRollupOptions.plugins = (bundleRollupOptions.plugins || []).concat([
        babel(babelOptions),
        resolve(nodeResolveOptions),
        uglify(uglifyJSOptions)
      ]);
      utils.matchOrEqual(options.manifest, Object.keys(entries)).forEach(entry => {
        let target = entries[entry];
        let rollupOptions = utils.shallowMerge(bundleRollupOptions);
        rollupOptions.entry = path.resolve(options.sourceDirectory, entry);
        rollupOptions.dest = path.resolve(options.targetDirectory, target);
        promises.push(rollup.rollup(rollupOptions)
          .then(result => {
            result.write(rollupOptions);
            targets.push(target);
            return result.modules.map(module => module.id);
          })
          .catch(err => { throw err; }));
      });
    });
    return Promise.all(promises).then(processedFiles => {
      return {
        targets: targets,
        sources: processedFiles.reduce((all, batch) =>
          all.concat(batch.map(filePath =>
            path.relative(path.resolve(options.sourceDirectory), filePath)
          )), [])
      }
    });
  }
};
