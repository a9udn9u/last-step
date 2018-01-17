/**
 * Source map support
 */
require('source-map-support').install();

/**
 * Fix import hell.
 */
const path = require('path');
const src = path.resolve(__dirname, 'dist');
const tst = path.resolve(__dirname, 'tests');

const PATTERN = /^~\//;

const getPath = (mod) => {
  if (PATTERN.test(mod)) {
    return path.resolve(src, mod.replace(PATTERN, ''));
  } else {
    return mod;
  }
}

// Object.defineProperties(global, {
//   'include': {
//     value: (n) => require(getPath(n))
//   }
// });

let Module = require('module');
let dumbRequire = Module.prototype.require;

Module.prototype.require = function (mod) {
  return dumbRequire.call(this, getPath(mod));
}
