const fs = require('fs-extra');
const path = require('path');
const minify = require('html-minifier').minify;
const utils = require('./utils');

module.exports = {
  process: (bundles, options, defaultHtmlMinifierOptions) => {
    let promises = [];
    bundles.forEach(bundle => {
      let htmlMinifierOptions = utils.shallowMerge(defaultHtmlMinifierOptions, bundle.htmlMiniFierOptions);
      utils.matchOrEqual(options.manifest, bundle.entries || []).forEach(entry => {
        let src = path.resolve(options.sourceDirectory, entry);
        let dst = path.resolve(options.targetDirectory, entry);
        promises.push(new Promise((resolve, reject) => {
          fs.readFile(src, { encoding: 'utf8' }, (err, data) => {
            if (err) reject(err);
            fs.writeFile(dst, minify(data, htmlMinifierOptions), 'utf8', err => {
              if (err) reject(err);
              resolve(entry);
            });
          });
        }));
      });
    });
    return Promise.all(promises).then(processedFiles => {
      return {
        sources: processedFiles,
        targets: processedFiles.slice()
      }
    });
  }
};
