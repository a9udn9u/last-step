const fs = require('fs-extra');
const path = require('path');
const less = require('less');
const utils = require('./utils');

module.exports = {
  process: (bundles, options, defaultLessOptions) => {
    let promises = [];
    let targets = [];
    bundles.forEach(bundle => {
      let entries = utils.matchOrEqual(options.manifest, bundle.entries || [])
        .map(entry => path.resolve(options.sourceDirectory, entry));
      let renderPromises = entries.map(entry =>
        new Promise((resolve, reject) => {
          let lessOptions = utils.shallowMerge(defaultLessOptions, bundle.lessOptions, {
            filename: entry
          });
          fs.readFile(entry, { encoding: 'utf8' }, (err, data) => {
            if (err) reject(err);
            less.render(data, lessOptions, (err, out) => {
              if (err) reject(err);
              resolve(out);
            });
          });
        })
      );
      let writePromise = Promise.all(renderPromises)
        .then(data => {
          let dest = path.resolve(options.targetDirectory, bundle.dest);
          let css = data.reduce((m, o) => m + o.css.trim(), '');
          let imports = data.reduce((m, o) => m.concat(o.imports || []), []);
          return new Promise((resolve, reject) => {
            fs.writeFile(dest, css, 'utf8', err => {
              if (err) reject(err);
              targets.push(bundle.dest);
              resolve(entries.concat(imports));
            });
          })
        })
        .catch(err => {throw err});
      promises.push(writePromise);
    });
    return Promise.all(promises).then(processedFiles => {
      return {
        targets: targets,
        sources: processedFiles.reduce((all, batch) =>
          all.concat(batch.map(filePath =>
            (/^(\/\/|https?:)/.test(filePath)) ? filePath :
              path.relative(path.resolve(options.sourceDirectory), path.resolve(filePath))
          )), [])
      }
    });
  }
};
