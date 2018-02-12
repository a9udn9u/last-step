import * as fs from 'fs-extra';
import * as os from 'os';
import * as proc from 'process';
import * as path from 'path';
import * as util from 'util';
import * as walk from 'klaw';

const DEBUG = /^debug$/i.test(proc.env.NODE_DEBUG);

/**
 * Add given ANSI color code to the first element of the array, append
 * reset color code to the end.
 * @param args Function arguments
 * @param color ANSI color code
 * @param prefi Log level, INFO, ERROR, etc..
 */
const colorize = (args, color, prefix = '') => {
  if (args.length) {
      args.unshift(`${color}${prefix}`);
      args.push('\x1b[0m');
  }
  return args;
};

/**
 * Get the current call stack.
 * @param omitCaller Omit caller line if true
 */
const stacktrace = (omitCaller: boolean = true): string => {
  let stack = new Error().stack.split('\n');
  stack.shift(); // Message
  stack.shift(); // Current method
  if (omitCaller) stack.shift(); // Caller
  return stack.join('\n');
}

export class Utils {
  constructor() {
    throw new Error('This class can not be instantiated.');
  }

  /**
   * @returns {bool} True if in debug mode.
   */
  static dbg(): boolean {
    return DEBUG;
  }

  /**
   * Log debug message
   */
  static debug(...args: any[]): void {
    console.debug.apply(console, colorize(args, '\x1b[2m', '[DEBUG]'));
  }

  /**
   * Log info message
   */
  static info(...args: any[]): void {
    console.info.apply(console, colorize(args, '\x1b[39m', '[INFO]'));
  }

  /**
   * Log warning message
   */
  static warn(...args: any[]): void {
    console.warn.apply(console, colorize(args, '\x1b[33m', '[WARN]'));
  }

  /**
   * Log error message
   */
  static error(...args: any[]): void {
    console.error.apply(console, colorize(args, '\x1b[31m', '[ERROR]'));
    console.error('Stacktrace:');
    console.error(stacktrace());
  }

  /**
   * Log fatal message, and throw build failed error.
   */
  static fatal(...args: any[]): void {
    console.error.apply(console, colorize(args, '\x1b[31m', '[FATAL]'));
    console.error('Stacktrace:');
    console.error(stacktrace());
    throw 'Terminating build';
  }

  /**
   * Generate unique string. The uniqueness is guaranteed within the process.
   * @returns {string} Unique string.
   */
  private static uniqueStringBase: number = Date.now();
  private static uniqueStringIncement: number = 1;
  static uniqueString(): string {
    return (Utils.uniqueStringBase + Utils.uniqueStringIncement++).toString(36);
  }

  /**
   * Remove duplicate entries in an array
   * @param {any[]} array Array
   * @returns {any[]} An array with duplicated entries removed
   */
  static uniqueArray(array: any[]): any[] {
    return [...new Set(array)];
  }

  /**
   * Get the union of given iterables
   * @param sets Iterables
   * @returns Union of given iterables
   */
  static union<T>(...sets: Iterable<T>[]): Set<T> {
    return (sets || []).reduce((u, s) => new Set([...u, ...s]), new Set());
  }

  /**
   * Get the intersection of given iterables
   * @param sets Iterables
   * @returns Intersection of given iterables
   */
  static intersection<T>(...sets: Iterable<T>[]): Set<T> {
    if (sets.length < 1) return new Set(sets[0] || []);
    let first: Set<T> = new Set(sets.shift());
    sets.forEach(set =>
      first = new Set([...first].filter(e => new Set(set).has(e)))
    );
    return first;
  }

  /**
   * Naive check if a given path represent local files. If not, returns
   * undefined; If yes, returns the path with possible 'file://' scheme
   * removed.
   */
  static getLocalPath(url: string): string {
    if (!/^[\w-]+:\/\//.test(url)) {
      return url;
    }
    if (url.toLocaleLowerCase().startsWith('file://')) {
      return url.replace(/^file:\/\//i, '');
    }
    return undefined;
  }

  /**
   * Get the last element in the given collection.
   * Not sure about the performance so should not use on large collections.
   * @param {Iterable<T>} iterable Iterable collection
   * @returns {T} Last element
   */
  static lastElement<T>(iterable: Iterable<T>): T {
    return Array.from(iterable).pop();
  }

  /**
   * Generate a unique path in the given dir or system tmpdir.
   * @param {string} parent Optional parent dir.
   * @param {string} [prefix=] prefix Optional prefix.
   * @returns {string} Unique temp dir.
   */
  static tmpPath(parent: string, prefix: string = ''): string {
    let dir: string = `${prefix}${Utils.uniqueString()}`;
    let tmp: string = path.resolve(parent || os.tmpdir(), dir);
    fs.ensureDirSync(tmp);
    return tmp;
  }

  /**
   * Read file in utf8 encoding
   * @param {string} file File path
   * @param {any} opts Options
   * @returns {Promise<string>} File contents
   */
  static readFile(file, opts: any = {}): Promise<string> {
    return fs.readFile(file, Utils.shallowMerge(opts, { encoding: 'utf8' }));
  }

  /**
   * Write file in utf8 encoding
   * @param {string} file File path
   * @param {any} data File contents
   * @param {any} opts Options
   * @returns {Promise<void>}
   */
  static writeFile(file: string, data: any, opts: any = {}): Promise<void> {
    return fs.outputFile(file, data, Utils.shallowMerge(opts, {
      encoding: 'utf8'
    }));
  }

  /**
   * Find the closest ancestor with 'package.json' file in it.
   * @returns {Promise<string>} Path of the package root directory, or null
   */
  static async getPackageRoot(): Promise<string> {
    let win32: boolean = /^win/.test(process.platform);
    let cwd: string = proc.cwd();
    while (true) {
      let pkg: string = path.resolve(cwd, 'package.json');
      if ((await fs.stat(pkg)).isFile()) {
        return cwd;
      }
      cwd = path.resolve(cwd, '..');
      if (!win32 && cwd === '/' || win32 && /^[A-Z]:\\?$/.test(cwd)) {
        return null;
      }
    }
  }

  /**
   * Do shallow merge, return a new object with all merged properties
   * @param {...any} objs List of objects
   * @returns {any} Merged object
   */
  static shallowMerge(...objs): any {
    return Object.assign.apply(Object, [{}].concat(objs || {}));
  }

  /**
   * Copy files
   * @param {string[]} sources Paths to sources
   * @param {string[]} targets Paths to targets
   * @param {any} opts Options pass to fs.copy()
   * @returns {Promise<void>}
   */
  static async copyFiles(sources: string[], targets: string[], opts: any): Promise<void> {
    sources = sources || [];
    targets = targets || [];
    opts = opts || {};
    if (sources.length !== targets.length) {
      Utils.error(`Copy file error, sources and targets entry size mismatch`);
    } else {
      await Promise.all(sources.map((file, i) =>
        fs.copy(file, targets[i], opts)
      ));
    }
  }

  /**
   * Concatenate files
   * @param {string} dest Path to the destination file
   * @param {string[]} inputs Paths of files to be concatenated
   * @returns {Promise<void>}
   */
  static async concatFiles(dest: string, inputs: string[]): Promise<void> {
    let writable = fs.createWriteStream(dest, { flags: 'w', encoding: 'utf8' });
    let lastReadable;
    inputs.forEach(input => {
      lastReadable = fs.createReadStream(input);
      lastReadable.pipe(writable, { end: false });
      writable.write("\n");
    });
    await new Promise(resolve => {
      if (lastReadable) {
        lastReadable.on('end', () => {
          writable.end();
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Remove everyting in the given dir except for those appear in fileToKeep
   * @param {string} dir Directory to clean
   * @param {string[]} filesToKeep List of file paths to keep
   * @returns {Promise<void>}
   */
  static async cleanDirectory(dir: string, filesToKeep: string[]): Promise<void> {
    let keepers: Set<string> = new Set();
    let deletees: string[] = []; // Is this a word?
    let failures: string[] = [];

    (filesToKeep || []).forEach(file => {
      let relative: string = file;
      if (path.isAbsolute(file)) {
        if (file.startsWith(`${dir}/`)) {
          relative = path.relative(dir, file)
        } else {
          Utils.warn(`${file} is not inside of ${dir}, skipping.`);
          return;
        }
      }
      // Keep files and all ancestor dirs
      while (relative !== '' && relative !== '.') {
        keepers.add(relative);
        relative = path.dirname(relative);
      }
      // Add target directory as well
      keepers.add('');
      keepers.add('.');
    });

    await new Promise((resolve, reject) => {
      walk(dir, {})
        .on('data', item => {
          if (!keepers.has(path.relative(dir, item.path))) {
            deletees.push(item.path);
          }
        })
        .on('error', (err, item) =>
          failures.push(`${item.path}: ${err.message}`)
        )
        .on('end', () => resolve());
    });
    if (failures.length) {
      Utils.error('Error cleanning files:', failures.join('\n'));
    }
    // When deleting directory, skip files inside of it.
    deletees = Utils.findCommonParents(deletees);
    Utils.dbg() && deletees.length && Utils.debug('Deleting:', deletees);
    await Promise.all(deletees.map(deletee => fs.remove(deletee)));
  }

  /**
   * Find all common parent directories in the given array of file paths.
   * For example, giving ['/a/b/c', '/a/b/d', '/a/b', '/x/y', '/x'],
   * will return ['/a/b', '/x']
   * @param {string[]} paths An array of absolute paths
   * @returns {string[]} Common parent directories
   */
  static findCommonParents(paths: string[]): string[] {
    let sorted: string[] = (paths || []).sort();
    let parents: string[] = [];
    if (sorted.length === 1) {
      parents = sorted;
    }
    if (sorted.length > 1) {
      let curr: string = sorted[0];
      for (let i: number = 1; i < sorted.length; ++i) {
        if (!sorted[i].startsWith(`${curr === '/' ? '' : curr}/`)) {
          parents.push(curr);
          curr = sorted[i];
        }
      }
      parents.push(curr);
    }
    return parents;
  }

  /**
   * List files recursively, only regular files and symbol links are returned.
   * @param {string} dir Directory to scan
   * @param {boolean} [relative=false] relative Return paths relative to dir if true
   * @returns {Promise<string[]>} List of file paths
   */
  static async listAllFiles(dir: string, relative: boolean = false): Promise<string[]> {
    let files: string[] = [];
    let failures: string[] = [];

    await new Promise((resolve, reject) => {
      walk(dir, {
        filter: file => {
          let stat = fs.statSync(file);
          return stat.isFile() || stat.isSymbolicLink() || stat.isDirectory();
        }
      })
        .on('end', () => resolve())
        .on('error', (err, item) =>
          failures.push(`${item.path}: ${err.message}`)
        )
        .on('data', item => {
          if (!item.stats.isDirectory()) {
            files.push(relative ? path.relative(dir, item.path) : item.path);
          }
        });
    });
    if (failures.length) {
      Utils.error('Error listing directory', failures.join('\n'));
    }
    return files;
  }

  /**
   * Test a string against an array of RegExps or strings, return true on any
   * match.
   * @param {string} str Needle
   * @param {any[]} patterns Haystack
   * @returns {boolean} True if matched, otherwise false
   */
  static matchOrEqual(str: string, patterns: any[]): boolean {
    return patterns.some(pattern => {
      let isRegex = pattern instanceof RegExp;
      return isRegex && pattern.test(str) || !isRegex && pattern === str;
    });
  }

  /**
   * Convert anything to JSON, RegExp and functions will be converted to their
   * string representations, instead of been blank objects.
   * @param {any} any Object to be converted to JSON
   */
  static toJson(any): string {
    let cache = new Set();
    return JSON.stringify(any, (k, v) => {
      if (v instanceof RegExp) {
        return v.toString();
      }
      if (v instanceof Function) {
        return `[Function: ${v.name ? v.name : '<anonymous>'}]`;
      }
      if (v && v.constructor &&
          Object.getPrototypeOf(v.constructor).name === 'Processor') {
        return `[Processor: ${v.constructor.name}]`;
      }
      if (v && typeof v === 'object') {
        if (cache.has(v)) {
          return '[Circular structure omitted]';
        }
        cache.add(v);
      }
      return v;
    }, 1);
  }
};