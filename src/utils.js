const fs = require('fs-extra');
const proc = require('process');
const path = require('path');
const walk = require('walk');
const emptyDir = require('empty-dir').sync;

module.exports = {
  die: (msg) => {
    throw msg;
  },

  warn: (msg) => {
    console.warn(msg);
  },

  echo: (msg) => {
    console.log(msg);
  },

  getPackageRoot: () => {
    let root = proc.cwd();
    while (true) {
      let pkg = path.resolve(root, './package.json');
      if (fs.statSync(pkg).isFile()) {
        return root;
      }
      root = path.resolve(root, './..');
      if (root === '/') {
        throw 'This command must be run inside of a NPM package directory.';
      }
    }
  },

  shallowMerge: (...objs) => {
    return Object.assign.apply(Object, [{}].concat(objs));
  },

  copyFiles: (srcDir, dstDir, manifest) => {
    return Promise.all((manifest || []).map(file => new Promise((resolve, reject) => {
      let dest = path.resolve(dstDir, file);
      fs.copy(path.resolve(srcDir, file), dest, err => {
        if (err) reject(err);
        resolve(file);
      })
    })));
  },

  cleanDirectory: (dir, filesToKeep) => {
    let dirPath = path.resolve(dir);
    let promises = [];
    let fileBlacklist = {}, dirBlacklist = {};
    let handler = (root, stats, next) => {
      stats.forEach(stat => {
        let abs = path.resolve(root, stat.name);
        let rel = path.relative(dirPath, abs);
        let isDir = stat.type === 'directory';
        let blacklist = isDir ? dirBlacklist : fileBlacklist;
        if (!blacklist[abs] && !blacklist[rel]) {
          promises.push(new Promise((resolve, reject) => fs.remove(abs, err => {
            if (err) reject(err);
            resolve(rel + (isDir ? '/' : ''));
          })));
        }
      });
      next();
    }

    (filesToKeep || []).forEach(file => {
      fileBlacklist[file] = true;
      dirBlacklist[path.dirname(file)] = true;
    });

    walk.walkSync(dir, {
      followLinks: false,
      listeners: {
        files: handler, symbolicLinks: handler, directories: handler,
        errors: (root, stats, next) => {
          throw stats
            .reduce((m, s) => m.concat(`${s.name}: ${s.error.message}`),
                ['Failed to remove file(s)'])
            .join('\n');
        }
      }
    })
    return Promise.all(promises);
  },

  listAllFiles: (srcDir, relative = false) => {
    let nodes = [];
    let srcDirPath = path.resolve(srcDir);
    let handler = (root, stats, next) => {
      stats.forEach(stat => {
        let filePath = path.resolve(root, stat.name);
        nodes.push(relative ? path.relative(srcDirPath, filePath) : filePath);
      });
      next();
    }
    walk.walkSync(srcDir, {
      followLinks: false,
      listeners: {
        files: handler, symbolicLinks: handler,
        errors: (root, stats, next) => {
          throw stats
            .reduce((m, s) => m.concat(`${s.name}: ${s.error.message}`),
                ['Failed to list file(s)'])
            .join('\n');
        }
      }
    });
    return nodes;
  },

  matchOrEqual: (manifest, patterns) => {
    patterns = patterns.slice();
    return manifest.reduce((memo, item) => {
      let removePatternIndex;
      patterns.some((pattern, idx) => {
        let isRegex = pattern instanceof RegExp;
        if (isRegex && pattern.test(item) || pattern === item) {
          memo.push(item);
          if (!isRegex) removePatternIndex = idx;
          return true;
        }
      });
      if (removePatternIndex !== undefined) {
        patterns.splice(removePatternIndex, 1);
      }
      return memo;
    }, [])
  }
};