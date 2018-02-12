"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const os = require("os");
const proc = require("process");
const path = require("path");
const walk = require("klaw");
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
const stacktrace = (omitCaller = true) => {
    let stack = new Error().stack.split('\n');
    stack.shift(); // Message
    stack.shift(); // Current method
    if (omitCaller)
        stack.shift(); // Caller
    return stack.join('\n');
};
class Utils {
    constructor() {
        throw new Error('This class can not be instantiated.');
    }
    /**
     * @returns {bool} True if in debug mode.
     */
    static dbg() {
        return DEBUG;
    }
    /**
     * Log debug message
     */
    static debug(...args) {
        console.debug.apply(console, colorize(args, '\x1b[2m', '[DEBUG]'));
    }
    /**
     * Log info message
     */
    static info(...args) {
        console.info.apply(console, colorize(args, '\x1b[39m', '[INFO]'));
    }
    /**
     * Log warning message
     */
    static warn(...args) {
        console.warn.apply(console, colorize(args, '\x1b[33m', '[WARN]'));
    }
    /**
     * Log error message
     */
    static error(...args) {
        console.error.apply(console, colorize(args, '\x1b[31m', '[ERROR]'));
        console.error('Stacktrace:');
        console.error(stacktrace());
    }
    /**
     * Log fatal message, and throw build failed error.
     */
    static fatal(...args) {
        console.error.apply(console, colorize(args, '\x1b[31m', '[FATAL]'));
        console.error('Stacktrace:');
        console.error(stacktrace());
        throw 'Terminating build';
    }
    static uniqueString() {
        return (Utils.uniqueStringBase + Utils.uniqueStringIncement++).toString(36);
    }
    /**
     * Remove duplicate entries in an array
     * @param {any[]} array Array
     * @returns {any[]} An array with duplicated entries removed
     */
    static uniqueArray(array) {
        return [...new Set(array)];
    }
    /**
     * Get the union of given iterables
     * @param sets Iterables
     * @returns Union of given iterables
     */
    static union(...sets) {
        return (sets || []).reduce((u, s) => new Set([...u, ...s]), new Set());
    }
    /**
     * Get the intersection of given iterables
     * @param sets Iterables
     * @returns Intersection of given iterables
     */
    static intersection(...sets) {
        if (sets.length < 1)
            return new Set(sets[0] || []);
        let first = new Set(sets.shift());
        sets.forEach(set => first = new Set([...first].filter(e => new Set(set).has(e))));
        return first;
    }
    /**
     * Naive check if a given path represent local files. If not, returns
     * undefined; If yes, returns the path with possible 'file://' scheme
     * removed.
     */
    static getLocalPath(url) {
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
    static lastElement(iterable) {
        return Array.from(iterable).pop();
    }
    /**
     * Generate a unique path in the given dir or system tmpdir.
     * @param {string} parent Optional parent dir.
     * @param {string} [prefix=] prefix Optional prefix.
     * @returns {string} Unique temp dir.
     */
    static tmpPath(parent, prefix = '') {
        let dir = `${prefix}${Utils.uniqueString()}`;
        let tmp = path.resolve(parent || os.tmpdir(), dir);
        fs.ensureDirSync(tmp);
        return tmp;
    }
    /**
     * Read file in utf8 encoding
     * @param {string} file File path
     * @param {any} opts Options
     * @returns {Promise<string>} File contents
     */
    static readFile(file, opts = {}) {
        return fs.readFile(file, Utils.shallowMerge(opts, { encoding: 'utf8' }));
    }
    /**
     * Write file in utf8 encoding
     * @param {string} file File path
     * @param {any} data File contents
     * @param {any} opts Options
     * @returns {Promise<void>}
     */
    static writeFile(file, data, opts = {}) {
        return fs.outputFile(file, data, Utils.shallowMerge(opts, {
            encoding: 'utf8'
        }));
    }
    /**
     * Find the closest ancestor with 'package.json' file in it.
     * @returns {Promise<string>} Path of the package root directory, or null
     */
    static getPackageRoot() {
        return __awaiter(this, void 0, void 0, function* () {
            let win32 = /^win/.test(process.platform);
            let cwd = proc.cwd();
            while (true) {
                let pkg = path.resolve(cwd, 'package.json');
                if ((yield fs.stat(pkg)).isFile()) {
                    return cwd;
                }
                cwd = path.resolve(cwd, '..');
                if (!win32 && cwd === '/' || win32 && /^[A-Z]:\\?$/.test(cwd)) {
                    return null;
                }
            }
        });
    }
    /**
     * Do shallow merge, return a new object with all merged properties
     * @param {...any} objs List of objects
     * @returns {any} Merged object
     */
    static shallowMerge(...objs) {
        return Object.assign.apply(Object, [{}].concat(objs || {}));
    }
    /**
     * Copy files
     * @param {string[]} sources Paths to sources
     * @param {string[]} targets Paths to targets
     * @param {any} opts Options pass to fs.copy()
     * @returns {Promise<void>}
     */
    static copyFiles(sources, targets, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            sources = sources || [];
            targets = targets || [];
            opts = opts || {};
            if (sources.length !== targets.length) {
                Utils.error(`Copy file error, sources and targets entry size mismatch`);
            }
            else {
                yield Promise.all(sources.map((file, i) => fs.copy(file, targets[i], opts)));
            }
        });
    }
    /**
     * Concatenate files
     * @param {string} dest Path to the destination file
     * @param {string[]} inputs Paths of files to be concatenated
     * @returns {Promise<void>}
     */
    static concatFiles(dest, inputs) {
        return __awaiter(this, void 0, void 0, function* () {
            let writable = fs.createWriteStream(dest, { flags: 'w', encoding: 'utf8' });
            let lastReadable;
            inputs.forEach(input => {
                lastReadable = fs.createReadStream(input);
                lastReadable.pipe(writable, { end: false });
                writable.write("\n");
            });
            yield new Promise(resolve => {
                if (lastReadable) {
                    lastReadable.on('end', () => {
                        writable.end();
                        resolve();
                    });
                }
                else {
                    resolve();
                }
            });
        });
    }
    /**
     * Remove everyting in the given dir except for those appear in fileToKeep
     * @param {string} dir Directory to clean
     * @param {string[]} filesToKeep List of file paths to keep
     * @returns {Promise<void>}
     */
    static cleanDirectory(dir, filesToKeep) {
        return __awaiter(this, void 0, void 0, function* () {
            let keepers = new Set();
            let deletees = []; // Is this a word?
            let failures = [];
            (filesToKeep || []).forEach(file => {
                let relative = file;
                if (path.isAbsolute(file)) {
                    if (file.startsWith(`${dir}/`)) {
                        relative = path.relative(dir, file);
                    }
                    else {
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
            yield new Promise((resolve, reject) => {
                walk(dir, {})
                    .on('data', item => {
                    if (!keepers.has(path.relative(dir, item.path))) {
                        deletees.push(item.path);
                    }
                })
                    .on('error', (err, item) => failures.push(`${item.path}: ${err.message}`))
                    .on('end', () => resolve());
            });
            if (failures.length) {
                Utils.error('Error cleanning files:', failures.join('\n'));
            }
            // When deleting directory, skip files inside of it.
            deletees = Utils.findCommonParents(deletees);
            Utils.dbg() && deletees.length && Utils.debug('Deleting:', deletees);
            yield Promise.all(deletees.map(deletee => fs.remove(deletee)));
        });
    }
    /**
     * Find all common parent directories in the given array of file paths.
     * For example, giving ['/a/b/c', '/a/b/d', '/a/b', '/x/y', '/x'],
     * will return ['/a/b', '/x']
     * @param {string[]} paths An array of absolute paths
     * @returns {string[]} Common parent directories
     */
    static findCommonParents(paths) {
        let sorted = (paths || []).sort();
        let parents = [];
        if (sorted.length === 1) {
            parents = sorted;
        }
        if (sorted.length > 1) {
            let curr = sorted[0];
            for (let i = 1; i < sorted.length; ++i) {
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
    static listAllFiles(dir, relative = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let files = [];
            let failures = [];
            yield new Promise((resolve, reject) => {
                walk(dir, {
                    filter: file => {
                        let stat = fs.statSync(file);
                        return stat.isFile() || stat.isSymbolicLink() || stat.isDirectory();
                    }
                })
                    .on('end', () => resolve())
                    .on('error', (err, item) => failures.push(`${item.path}: ${err.message}`))
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
        });
    }
    /**
     * Test a string against an array of RegExps or strings, return true on any
     * match.
     * @param {string} str Needle
     * @param {any[]} patterns Haystack
     * @returns {boolean} True if matched, otherwise false
     */
    static matchOrEqual(str, patterns) {
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
    static toJson(any) {
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
}
/**
 * Generate unique string. The uniqueness is guaranteed within the process.
 * @returns {string} Unique string.
 */
Utils.uniqueStringBase = Date.now();
Utils.uniqueStringIncement = 1;
exports.Utils = Utils;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLCtCQUErQjtBQUMvQix5QkFBeUI7QUFDekIsZ0NBQWdDO0FBQ2hDLDZCQUE2QjtBQUU3Qiw2QkFBNkI7QUFFN0IsTUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBRW5EOzs7Ozs7R0FNRztBQUNILE1BQU0sUUFBUSxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLEdBQUcsRUFBRSxFQUFFLEVBQUU7SUFDNUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDZCxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsS0FBSyxHQUFHLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDbEMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN6QixDQUFDO0lBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQztBQUNkLENBQUMsQ0FBQztBQUVGOzs7R0FHRztBQUNILE1BQU0sVUFBVSxHQUFHLENBQUMsYUFBc0IsSUFBSSxFQUFVLEVBQUU7SUFDeEQsSUFBSSxLQUFLLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLFVBQVU7SUFDekIsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsaUJBQWlCO0lBQ2hDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQztRQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLFNBQVM7SUFDeEMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDMUIsQ0FBQyxDQUFBO0FBRUQ7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Q0FBQyxDQUFDO2dCQUMvQixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDakIsTUFBTSxDQUFDLDhCQUE4QixDQUFDO2dCQUN4QyxDQUFDO2dCQUNELEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDZixDQUFDO1lBQ0QsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNYLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNSLENBQUM7O0FBeFVEOzs7R0FHRztBQUNZLHNCQUFnQixHQUFXLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUN0QywwQkFBb0IsR0FBVyxDQUFDLENBQUM7QUF6RGxELHNCQTZYQztBQUFBLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgKiBhcyBvcyBmcm9tICdvcyc7XG5pbXBvcnQgKiBhcyBwcm9jIGZyb20gJ3Byb2Nlc3MnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAndXRpbCc7XG5pbXBvcnQgKiBhcyB3YWxrIGZyb20gJ2tsYXcnO1xuXG5jb25zdCBERUJVRyA9IC9eZGVidWckL2kudGVzdChwcm9jLmVudi5OT0RFX0RFQlVHKTtcblxuLyoqXG4gKiBBZGQgZ2l2ZW4gQU5TSSBjb2xvciBjb2RlIHRvIHRoZSBmaXJzdCBlbGVtZW50IG9mIHRoZSBhcnJheSwgYXBwZW5kXG4gKiByZXNldCBjb2xvciBjb2RlIHRvIHRoZSBlbmQuXG4gKiBAcGFyYW0gYXJncyBGdW5jdGlvbiBhcmd1bWVudHNcbiAqIEBwYXJhbSBjb2xvciBBTlNJIGNvbG9yIGNvZGVcbiAqIEBwYXJhbSBwcmVmaSBMb2cgbGV2ZWwsIElORk8sIEVSUk9SLCBldGMuLlxuICovXG5jb25zdCBjb2xvcml6ZSA9IChhcmdzLCBjb2xvciwgcHJlZml4ID0gJycpID0+IHtcbiAgaWYgKGFyZ3MubGVuZ3RoKSB7XG4gICAgICBhcmdzLnVuc2hpZnQoYCR7Y29sb3J9JHtwcmVmaXh9YCk7XG4gICAgICBhcmdzLnB1c2goJ1xceDFiWzBtJyk7XG4gIH1cbiAgcmV0dXJuIGFyZ3M7XG59O1xuXG4vKipcbiAqIEdldCB0aGUgY3VycmVudCBjYWxsIHN0YWNrLlxuICogQHBhcmFtIG9taXRDYWxsZXIgT21pdCBjYWxsZXIgbGluZSBpZiB0cnVlXG4gKi9cbmNvbnN0IHN0YWNrdHJhY2UgPSAob21pdENhbGxlcjogYm9vbGVhbiA9IHRydWUpOiBzdHJpbmcgPT4ge1xuICBsZXQgc3RhY2sgPSBuZXcgRXJyb3IoKS5zdGFjay5zcGxpdCgnXFxuJyk7XG4gIHN0YWNrLnNoaWZ0KCk7IC8vIE1lc3NhZ2VcbiAgc3RhY2suc2hpZnQoKTsgLy8gQ3VycmVudCBtZXRob2RcbiAgaWYgKG9taXRDYWxsZXIpIHN0YWNrLnNoaWZ0KCk7IC8vIENhbGxlclxuICByZXR1cm4gc3RhY2suam9pbignXFxuJyk7XG59XG5cbmV4cG9ydCBjbGFzcyBVdGlscyB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignVGhpcyBjbGFzcyBjYW4gbm90IGJlIGluc3RhbnRpYXRlZC4nKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyB7Ym9vbH0gVHJ1ZSBpZiBpbiBkZWJ1ZyBtb2RlLlxuICAgKi9cbiAgc3RhdGljIGRiZygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gREVCVUc7XG4gIH1cblxuICAvKipcbiAgICogTG9nIGRlYnVnIG1lc3NhZ2VcbiAgICovXG4gIHN0YXRpYyBkZWJ1ZyguLi5hcmdzOiBhbnlbXSk6IHZvaWQge1xuICAgIGNvbnNvbGUuZGVidWcuYXBwbHkoY29uc29sZSwgY29sb3JpemUoYXJncywgJ1xceDFiWzJtJywgJ1tERUJVR10nKSk7XG4gIH1cblxuICAvKipcbiAgICogTG9nIGluZm8gbWVzc2FnZVxuICAgKi9cbiAgc3RhdGljIGluZm8oLi4uYXJnczogYW55W10pOiB2b2lkIHtcbiAgICBjb25zb2xlLmluZm8uYXBwbHkoY29uc29sZSwgY29sb3JpemUoYXJncywgJ1xceDFiWzM5bScsICdbSU5GT10nKSk7XG4gIH1cblxuICAvKipcbiAgICogTG9nIHdhcm5pbmcgbWVzc2FnZVxuICAgKi9cbiAgc3RhdGljIHdhcm4oLi4uYXJnczogYW55W10pOiB2b2lkIHtcbiAgICBjb25zb2xlLndhcm4uYXBwbHkoY29uc29sZSwgY29sb3JpemUoYXJncywgJ1xceDFiWzMzbScsICdbV0FSTl0nKSk7XG4gIH1cblxuICAvKipcbiAgICogTG9nIGVycm9yIG1lc3NhZ2VcbiAgICovXG4gIHN0YXRpYyBlcnJvciguLi5hcmdzOiBhbnlbXSk6IHZvaWQge1xuICAgIGNvbnNvbGUuZXJyb3IuYXBwbHkoY29uc29sZSwgY29sb3JpemUoYXJncywgJ1xceDFiWzMxbScsICdbRVJST1JdJykpO1xuICAgIGNvbnNvbGUuZXJyb3IoJ1N0YWNrdHJhY2U6Jyk7XG4gICAgY29uc29sZS5lcnJvcihzdGFja3RyYWNlKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIExvZyBmYXRhbCBtZXNzYWdlLCBhbmQgdGhyb3cgYnVpbGQgZmFpbGVkIGVycm9yLlxuICAgKi9cbiAgc3RhdGljIGZhdGFsKC4uLmFyZ3M6IGFueVtdKTogdm9pZCB7XG4gICAgY29uc29sZS5lcnJvci5hcHBseShjb25zb2xlLCBjb2xvcml6ZShhcmdzLCAnXFx4MWJbMzFtJywgJ1tGQVRBTF0nKSk7XG4gICAgY29uc29sZS5lcnJvcignU3RhY2t0cmFjZTonKTtcbiAgICBjb25zb2xlLmVycm9yKHN0YWNrdHJhY2UoKSk7XG4gICAgdGhyb3cgJ1Rlcm1pbmF0aW5nIGJ1aWxkJztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSB1bmlxdWUgc3RyaW5nLiBUaGUgdW5pcXVlbmVzcyBpcyBndWFyYW50ZWVkIHdpdGhpbiB0aGUgcHJvY2Vzcy5cbiAgICogQHJldHVybnMge3N0cmluZ30gVW5pcXVlIHN0cmluZy5cbiAgICovXG4gIHByaXZhdGUgc3RhdGljIHVuaXF1ZVN0cmluZ0Jhc2U6IG51bWJlciA9IERhdGUubm93KCk7XG4gIHByaXZhdGUgc3RhdGljIHVuaXF1ZVN0cmluZ0luY2VtZW50OiBudW1iZXIgPSAxO1xuICBzdGF0aWMgdW5pcXVlU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIChVdGlscy51bmlxdWVTdHJpbmdCYXNlICsgVXRpbHMudW5pcXVlU3RyaW5nSW5jZW1lbnQrKykudG9TdHJpbmcoMzYpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBkdXBsaWNhdGUgZW50cmllcyBpbiBhbiBhcnJheVxuICAgKiBAcGFyYW0ge2FueVtdfSBhcnJheSBBcnJheVxuICAgKiBAcmV0dXJucyB7YW55W119IEFuIGFycmF5IHdpdGggZHVwbGljYXRlZCBlbnRyaWVzIHJlbW92ZWRcbiAgICovXG4gIHN0YXRpYyB1bmlxdWVBcnJheShhcnJheTogYW55W10pOiBhbnlbXSB7XG4gICAgcmV0dXJuIFsuLi5uZXcgU2V0KGFycmF5KV07XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSB1bmlvbiBvZiBnaXZlbiBpdGVyYWJsZXNcbiAgICogQHBhcmFtIHNldHMgSXRlcmFibGVzXG4gICAqIEByZXR1cm5zIFVuaW9uIG9mIGdpdmVuIGl0ZXJhYmxlc1xuICAgKi9cbiAgc3RhdGljIHVuaW9uPFQ+KC4uLnNldHM6IEl0ZXJhYmxlPFQ+W10pOiBTZXQ8VD4ge1xuICAgIHJldHVybiAoc2V0cyB8fCBbXSkucmVkdWNlKCh1LCBzKSA9PiBuZXcgU2V0KFsuLi51LCAuLi5zXSksIG5ldyBTZXQoKSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBpbnRlcnNlY3Rpb24gb2YgZ2l2ZW4gaXRlcmFibGVzXG4gICAqIEBwYXJhbSBzZXRzIEl0ZXJhYmxlc1xuICAgKiBAcmV0dXJucyBJbnRlcnNlY3Rpb24gb2YgZ2l2ZW4gaXRlcmFibGVzXG4gICAqL1xuICBzdGF0aWMgaW50ZXJzZWN0aW9uPFQ+KC4uLnNldHM6IEl0ZXJhYmxlPFQ+W10pOiBTZXQ8VD4ge1xuICAgIGlmIChzZXRzLmxlbmd0aCA8IDEpIHJldHVybiBuZXcgU2V0KHNldHNbMF0gfHwgW10pO1xuICAgIGxldCBmaXJzdDogU2V0PFQ+ID0gbmV3IFNldChzZXRzLnNoaWZ0KCkpO1xuICAgIHNldHMuZm9yRWFjaChzZXQgPT5cbiAgICAgIGZpcnN0ID0gbmV3IFNldChbLi4uZmlyc3RdLmZpbHRlcihlID0+IG5ldyBTZXQoc2V0KS5oYXMoZSkpKVxuICAgICk7XG4gICAgcmV0dXJuIGZpcnN0O1xuICB9XG5cbiAgLyoqXG4gICAqIE5haXZlIGNoZWNrIGlmIGEgZ2l2ZW4gcGF0aCByZXByZXNlbnQgbG9jYWwgZmlsZXMuIElmIG5vdCwgcmV0dXJuc1xuICAgKiB1bmRlZmluZWQ7IElmIHllcywgcmV0dXJucyB0aGUgcGF0aCB3aXRoIHBvc3NpYmxlICdmaWxlOi8vJyBzY2hlbWVcbiAgICogcmVtb3ZlZC5cbiAgICovXG4gIHN0YXRpYyBnZXRMb2NhbFBhdGgodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICghL15bXFx3LV0rOlxcL1xcLy8udGVzdCh1cmwpKSB7XG4gICAgICByZXR1cm4gdXJsO1xuICAgIH1cbiAgICBpZiAodXJsLnRvTG9jYWxlTG93ZXJDYXNlKCkuc3RhcnRzV2l0aCgnZmlsZTovLycpKSB7XG4gICAgICByZXR1cm4gdXJsLnJlcGxhY2UoL15maWxlOlxcL1xcLy9pLCAnJyk7XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBsYXN0IGVsZW1lbnQgaW4gdGhlIGdpdmVuIGNvbGxlY3Rpb24uXG4gICAqIE5vdCBzdXJlIGFib3V0IHRoZSBwZXJmb3JtYW5jZSBzbyBzaG91bGQgbm90IHVzZSBvbiBsYXJnZSBjb2xsZWN0aW9ucy5cbiAgICogQHBhcmFtIHtJdGVyYWJsZTxUPn0gaXRlcmFibGUgSXRlcmFibGUgY29sbGVjdGlvblxuICAgKiBAcmV0dXJucyB7VH0gTGFzdCBlbGVtZW50XG4gICAqL1xuICBzdGF0aWMgbGFzdEVsZW1lbnQ8VD4oaXRlcmFibGU6IEl0ZXJhYmxlPFQ+KTogVCB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20oaXRlcmFibGUpLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgdW5pcXVlIHBhdGggaW4gdGhlIGdpdmVuIGRpciBvciBzeXN0ZW0gdG1wZGlyLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcGFyZW50IE9wdGlvbmFsIHBhcmVudCBkaXIuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbcHJlZml4PV0gcHJlZml4IE9wdGlvbmFsIHByZWZpeC5cbiAgICogQHJldHVybnMge3N0cmluZ30gVW5pcXVlIHRlbXAgZGlyLlxuICAgKi9cbiAgc3RhdGljIHRtcFBhdGgocGFyZW50OiBzdHJpbmcsIHByZWZpeDogc3RyaW5nID0gJycpOiBzdHJpbmcge1xuICAgIGxldCBkaXI6IHN0cmluZyA9IGAke3ByZWZpeH0ke1V0aWxzLnVuaXF1ZVN0cmluZygpfWA7XG4gICAgbGV0IHRtcDogc3RyaW5nID0gcGF0aC5yZXNvbHZlKHBhcmVudCB8fCBvcy50bXBkaXIoKSwgZGlyKTtcbiAgICBmcy5lbnN1cmVEaXJTeW5jKHRtcCk7XG4gICAgcmV0dXJuIHRtcDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFkIGZpbGUgaW4gdXRmOCBlbmNvZGluZ1xuICAgKiBAcGFyYW0ge3N0cmluZ30gZmlsZSBGaWxlIHBhdGhcbiAgICogQHBhcmFtIHthbnl9IG9wdHMgT3B0aW9uc1xuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fSBGaWxlIGNvbnRlbnRzXG4gICAqL1xuICBzdGF0aWMgcmVhZEZpbGUoZmlsZSwgb3B0czogYW55ID0ge30pOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiBmcy5yZWFkRmlsZShmaWxlLCBVdGlscy5zaGFsbG93TWVyZ2Uob3B0cywgeyBlbmNvZGluZzogJ3V0ZjgnIH0pKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXcml0ZSBmaWxlIGluIHV0ZjggZW5jb2RpbmdcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZpbGUgRmlsZSBwYXRoXG4gICAqIEBwYXJhbSB7YW55fSBkYXRhIEZpbGUgY29udGVudHNcbiAgICogQHBhcmFtIHthbnl9IG9wdHMgT3B0aW9uc1xuICAgKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPn1cbiAgICovXG4gIHN0YXRpYyB3cml0ZUZpbGUoZmlsZTogc3RyaW5nLCBkYXRhOiBhbnksIG9wdHM6IGFueSA9IHt9KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIGZzLm91dHB1dEZpbGUoZmlsZSwgZGF0YSwgVXRpbHMuc2hhbGxvd01lcmdlKG9wdHMsIHtcbiAgICAgIGVuY29kaW5nOiAndXRmOCdcbiAgICB9KSk7XG4gIH1cblxuICAvKipcbiAgICogRmluZCB0aGUgY2xvc2VzdCBhbmNlc3RvciB3aXRoICdwYWNrYWdlLmpzb24nIGZpbGUgaW4gaXQuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IFBhdGggb2YgdGhlIHBhY2thZ2Ugcm9vdCBkaXJlY3RvcnksIG9yIG51bGxcbiAgICovXG4gIHN0YXRpYyBhc3luYyBnZXRQYWNrYWdlUm9vdCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGxldCB3aW4zMjogYm9vbGVhbiA9IC9ed2luLy50ZXN0KHByb2Nlc3MucGxhdGZvcm0pO1xuICAgIGxldCBjd2Q6IHN0cmluZyA9IHByb2MuY3dkKCk7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGxldCBwa2c6IHN0cmluZyA9IHBhdGgucmVzb2x2ZShjd2QsICdwYWNrYWdlLmpzb24nKTtcbiAgICAgIGlmICgoYXdhaXQgZnMuc3RhdChwa2cpKS5pc0ZpbGUoKSkge1xuICAgICAgICByZXR1cm4gY3dkO1xuICAgICAgfVxuICAgICAgY3dkID0gcGF0aC5yZXNvbHZlKGN3ZCwgJy4uJyk7XG4gICAgICBpZiAoIXdpbjMyICYmIGN3ZCA9PT0gJy8nIHx8IHdpbjMyICYmIC9eW0EtWl06XFxcXD8kLy50ZXN0KGN3ZCkpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERvIHNoYWxsb3cgbWVyZ2UsIHJldHVybiBhIG5ldyBvYmplY3Qgd2l0aCBhbGwgbWVyZ2VkIHByb3BlcnRpZXNcbiAgICogQHBhcmFtIHsuLi5hbnl9IG9ianMgTGlzdCBvZiBvYmplY3RzXG4gICAqIEByZXR1cm5zIHthbnl9IE1lcmdlZCBvYmplY3RcbiAgICovXG4gIHN0YXRpYyBzaGFsbG93TWVyZ2UoLi4ub2Jqcyk6IGFueSB7XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24uYXBwbHkoT2JqZWN0LCBbe31dLmNvbmNhdChvYmpzIHx8IHt9KSk7XG4gIH1cblxuICAvKipcbiAgICogQ29weSBmaWxlc1xuICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBzb3VyY2VzIFBhdGhzIHRvIHNvdXJjZXNcbiAgICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0cyBQYXRocyB0byB0YXJnZXRzXG4gICAqIEBwYXJhbSB7YW55fSBvcHRzIE9wdGlvbnMgcGFzcyB0byBmcy5jb3B5KClcbiAgICogQHJldHVybnMge1Byb21pc2U8dm9pZD59XG4gICAqL1xuICBzdGF0aWMgYXN5bmMgY29weUZpbGVzKHNvdXJjZXM6IHN0cmluZ1tdLCB0YXJnZXRzOiBzdHJpbmdbXSwgb3B0czogYW55KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgc291cmNlcyA9IHNvdXJjZXMgfHwgW107XG4gICAgdGFyZ2V0cyA9IHRhcmdldHMgfHwgW107XG4gICAgb3B0cyA9IG9wdHMgfHwge307XG4gICAgaWYgKHNvdXJjZXMubGVuZ3RoICE9PSB0YXJnZXRzLmxlbmd0aCkge1xuICAgICAgVXRpbHMuZXJyb3IoYENvcHkgZmlsZSBlcnJvciwgc291cmNlcyBhbmQgdGFyZ2V0cyBlbnRyeSBzaXplIG1pc21hdGNoYCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGF3YWl0IFByb21pc2UuYWxsKHNvdXJjZXMubWFwKChmaWxlLCBpKSA9PlxuICAgICAgICBmcy5jb3B5KGZpbGUsIHRhcmdldHNbaV0sIG9wdHMpXG4gICAgICApKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ29uY2F0ZW5hdGUgZmlsZXNcbiAgICogQHBhcmFtIHtzdHJpbmd9IGRlc3QgUGF0aCB0byB0aGUgZGVzdGluYXRpb24gZmlsZVxuICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBpbnB1dHMgUGF0aHMgb2YgZmlsZXMgdG8gYmUgY29uY2F0ZW5hdGVkXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+fVxuICAgKi9cbiAgc3RhdGljIGFzeW5jIGNvbmNhdEZpbGVzKGRlc3Q6IHN0cmluZywgaW5wdXRzOiBzdHJpbmdbXSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxldCB3cml0YWJsZSA9IGZzLmNyZWF0ZVdyaXRlU3RyZWFtKGRlc3QsIHsgZmxhZ3M6ICd3JywgZW5jb2Rpbmc6ICd1dGY4JyB9KTtcbiAgICBsZXQgbGFzdFJlYWRhYmxlO1xuICAgIGlucHV0cy5mb3JFYWNoKGlucHV0ID0+IHtcbiAgICAgIGxhc3RSZWFkYWJsZSA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0oaW5wdXQpO1xuICAgICAgbGFzdFJlYWRhYmxlLnBpcGUod3JpdGFibGUsIHsgZW5kOiBmYWxzZSB9KTtcbiAgICAgIHdyaXRhYmxlLndyaXRlKFwiXFxuXCIpO1xuICAgIH0pO1xuICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgaWYgKGxhc3RSZWFkYWJsZSkge1xuICAgICAgICBsYXN0UmVhZGFibGUub24oJ2VuZCcsICgpID0+IHtcbiAgICAgICAgICB3cml0YWJsZS5lbmQoKTtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBldmVyeXRpbmcgaW4gdGhlIGdpdmVuIGRpciBleGNlcHQgZm9yIHRob3NlIGFwcGVhciBpbiBmaWxlVG9LZWVwXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBkaXIgRGlyZWN0b3J5IHRvIGNsZWFuXG4gICAqIEBwYXJhbSB7c3RyaW5nW119IGZpbGVzVG9LZWVwIExpc3Qgb2YgZmlsZSBwYXRocyB0byBrZWVwXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+fVxuICAgKi9cbiAgc3RhdGljIGFzeW5jIGNsZWFuRGlyZWN0b3J5KGRpcjogc3RyaW5nLCBmaWxlc1RvS2VlcDogc3RyaW5nW10pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsZXQga2VlcGVyczogU2V0PHN0cmluZz4gPSBuZXcgU2V0KCk7XG4gICAgbGV0IGRlbGV0ZWVzOiBzdHJpbmdbXSA9IFtdOyAvLyBJcyB0aGlzIGEgd29yZD9cbiAgICBsZXQgZmFpbHVyZXM6IHN0cmluZ1tdID0gW107XG5cbiAgICAoZmlsZXNUb0tlZXAgfHwgW10pLmZvckVhY2goZmlsZSA9PiB7XG4gICAgICBsZXQgcmVsYXRpdmU6IHN0cmluZyA9IGZpbGU7XG4gICAgICBpZiAocGF0aC5pc0Fic29sdXRlKGZpbGUpKSB7XG4gICAgICAgIGlmIChmaWxlLnN0YXJ0c1dpdGgoYCR7ZGlyfS9gKSkge1xuICAgICAgICAgIHJlbGF0aXZlID0gcGF0aC5yZWxhdGl2ZShkaXIsIGZpbGUpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgVXRpbHMud2FybihgJHtmaWxlfSBpcyBub3QgaW5zaWRlIG9mICR7ZGlyfSwgc2tpcHBpbmcuYCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBLZWVwIGZpbGVzIGFuZCBhbGwgYW5jZXN0b3IgZGlyc1xuICAgICAgd2hpbGUgKHJlbGF0aXZlICE9PSAnJyAmJiByZWxhdGl2ZSAhPT0gJy4nKSB7XG4gICAgICAgIGtlZXBlcnMuYWRkKHJlbGF0aXZlKTtcbiAgICAgICAgcmVsYXRpdmUgPSBwYXRoLmRpcm5hbWUocmVsYXRpdmUpO1xuICAgICAgfVxuICAgICAgLy8gQWRkIHRhcmdldCBkaXJlY3RvcnkgYXMgd2VsbFxuICAgICAga2VlcGVycy5hZGQoJycpO1xuICAgICAga2VlcGVycy5hZGQoJy4nKTtcbiAgICB9KTtcblxuICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHdhbGsoZGlyLCB7fSlcbiAgICAgICAgLm9uKCdkYXRhJywgaXRlbSA9PiB7XG4gICAgICAgICAgaWYgKCFrZWVwZXJzLmhhcyhwYXRoLnJlbGF0aXZlKGRpciwgaXRlbS5wYXRoKSkpIHtcbiAgICAgICAgICAgIGRlbGV0ZWVzLnB1c2goaXRlbS5wYXRoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5vbignZXJyb3InLCAoZXJyLCBpdGVtKSA9PlxuICAgICAgICAgIGZhaWx1cmVzLnB1c2goYCR7aXRlbS5wYXRofTogJHtlcnIubWVzc2FnZX1gKVxuICAgICAgICApXG4gICAgICAgIC5vbignZW5kJywgKCkgPT4gcmVzb2x2ZSgpKTtcbiAgICB9KTtcbiAgICBpZiAoZmFpbHVyZXMubGVuZ3RoKSB7XG4gICAgICBVdGlscy5lcnJvcignRXJyb3IgY2xlYW5uaW5nIGZpbGVzOicsIGZhaWx1cmVzLmpvaW4oJ1xcbicpKTtcbiAgICB9XG4gICAgLy8gV2hlbiBkZWxldGluZyBkaXJlY3RvcnksIHNraXAgZmlsZXMgaW5zaWRlIG9mIGl0LlxuICAgIGRlbGV0ZWVzID0gVXRpbHMuZmluZENvbW1vblBhcmVudHMoZGVsZXRlZXMpO1xuICAgIFV0aWxzLmRiZygpICYmIGRlbGV0ZWVzLmxlbmd0aCAmJiBVdGlscy5kZWJ1ZygnRGVsZXRpbmc6JywgZGVsZXRlZXMpO1xuICAgIGF3YWl0IFByb21pc2UuYWxsKGRlbGV0ZWVzLm1hcChkZWxldGVlID0+IGZzLnJlbW92ZShkZWxldGVlKSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmQgYWxsIGNvbW1vbiBwYXJlbnQgZGlyZWN0b3JpZXMgaW4gdGhlIGdpdmVuIGFycmF5IG9mIGZpbGUgcGF0aHMuXG4gICAqIEZvciBleGFtcGxlLCBnaXZpbmcgWycvYS9iL2MnLCAnL2EvYi9kJywgJy9hL2InLCAnL3gveScsICcveCddLFxuICAgKiB3aWxsIHJldHVybiBbJy9hL2InLCAnL3gnXVxuICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBwYXRocyBBbiBhcnJheSBvZiBhYnNvbHV0ZSBwYXRoc1xuICAgKiBAcmV0dXJucyB7c3RyaW5nW119IENvbW1vbiBwYXJlbnQgZGlyZWN0b3JpZXNcbiAgICovXG4gIHN0YXRpYyBmaW5kQ29tbW9uUGFyZW50cyhwYXRoczogc3RyaW5nW10pOiBzdHJpbmdbXSB7XG4gICAgbGV0IHNvcnRlZDogc3RyaW5nW10gPSAocGF0aHMgfHwgW10pLnNvcnQoKTtcbiAgICBsZXQgcGFyZW50czogc3RyaW5nW10gPSBbXTtcbiAgICBpZiAoc29ydGVkLmxlbmd0aCA9PT0gMSkge1xuICAgICAgcGFyZW50cyA9IHNvcnRlZDtcbiAgICB9XG4gICAgaWYgKHNvcnRlZC5sZW5ndGggPiAxKSB7XG4gICAgICBsZXQgY3Vycjogc3RyaW5nID0gc29ydGVkWzBdO1xuICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMTsgaSA8IHNvcnRlZC5sZW5ndGg7ICsraSkge1xuICAgICAgICBpZiAoIXNvcnRlZFtpXS5zdGFydHNXaXRoKGAke2N1cnIgPT09ICcvJyA/ICcnIDogY3Vycn0vYCkpIHtcbiAgICAgICAgICBwYXJlbnRzLnB1c2goY3Vycik7XG4gICAgICAgICAgY3VyciA9IHNvcnRlZFtpXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcGFyZW50cy5wdXNoKGN1cnIpO1xuICAgIH1cbiAgICByZXR1cm4gcGFyZW50cztcbiAgfVxuXG4gIC8qKlxuICAgKiBMaXN0IGZpbGVzIHJlY3Vyc2l2ZWx5LCBvbmx5IHJlZ3VsYXIgZmlsZXMgYW5kIHN5bWJvbCBsaW5rcyBhcmUgcmV0dXJuZWQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBkaXIgRGlyZWN0b3J5IHRvIHNjYW5cbiAgICogQHBhcmFtIHtib29sZWFufSBbcmVsYXRpdmU9ZmFsc2VdIHJlbGF0aXZlIFJldHVybiBwYXRocyByZWxhdGl2ZSB0byBkaXIgaWYgdHJ1ZVxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmdbXT59IExpc3Qgb2YgZmlsZSBwYXRoc1xuICAgKi9cbiAgc3RhdGljIGFzeW5jIGxpc3RBbGxGaWxlcyhkaXI6IHN0cmluZywgcmVsYXRpdmU6IGJvb2xlYW4gPSBmYWxzZSk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgICBsZXQgZmlsZXM6IHN0cmluZ1tdID0gW107XG4gICAgbGV0IGZhaWx1cmVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgd2FsayhkaXIsIHtcbiAgICAgICAgZmlsdGVyOiBmaWxlID0+IHtcbiAgICAgICAgICBsZXQgc3RhdCA9IGZzLnN0YXRTeW5jKGZpbGUpO1xuICAgICAgICAgIHJldHVybiBzdGF0LmlzRmlsZSgpIHx8IHN0YXQuaXNTeW1ib2xpY0xpbmsoKSB8fCBzdGF0LmlzRGlyZWN0b3J5KCk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAgIC5vbignZW5kJywgKCkgPT4gcmVzb2x2ZSgpKVxuICAgICAgICAub24oJ2Vycm9yJywgKGVyciwgaXRlbSkgPT5cbiAgICAgICAgICBmYWlsdXJlcy5wdXNoKGAke2l0ZW0ucGF0aH06ICR7ZXJyLm1lc3NhZ2V9YClcbiAgICAgICAgKVxuICAgICAgICAub24oJ2RhdGEnLCBpdGVtID0+IHtcbiAgICAgICAgICBpZiAoIWl0ZW0uc3RhdHMuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgICAgZmlsZXMucHVzaChyZWxhdGl2ZSA/IHBhdGgucmVsYXRpdmUoZGlyLCBpdGVtLnBhdGgpIDogaXRlbS5wYXRoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICAgIGlmIChmYWlsdXJlcy5sZW5ndGgpIHtcbiAgICAgIFV0aWxzLmVycm9yKCdFcnJvciBsaXN0aW5nIGRpcmVjdG9yeScsIGZhaWx1cmVzLmpvaW4oJ1xcbicpKTtcbiAgICB9XG4gICAgcmV0dXJuIGZpbGVzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRlc3QgYSBzdHJpbmcgYWdhaW5zdCBhbiBhcnJheSBvZiBSZWdFeHBzIG9yIHN0cmluZ3MsIHJldHVybiB0cnVlIG9uIGFueVxuICAgKiBtYXRjaC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0ciBOZWVkbGVcbiAgICogQHBhcmFtIHthbnlbXX0gcGF0dGVybnMgSGF5c3RhY2tcbiAgICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgbWF0Y2hlZCwgb3RoZXJ3aXNlIGZhbHNlXG4gICAqL1xuICBzdGF0aWMgbWF0Y2hPckVxdWFsKHN0cjogc3RyaW5nLCBwYXR0ZXJuczogYW55W10pOiBib29sZWFuIHtcbiAgICByZXR1cm4gcGF0dGVybnMuc29tZShwYXR0ZXJuID0+IHtcbiAgICAgIGxldCBpc1JlZ2V4ID0gcGF0dGVybiBpbnN0YW5jZW9mIFJlZ0V4cDtcbiAgICAgIHJldHVybiBpc1JlZ2V4ICYmIHBhdHRlcm4udGVzdChzdHIpIHx8ICFpc1JlZ2V4ICYmIHBhdHRlcm4gPT09IHN0cjtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0IGFueXRoaW5nIHRvIEpTT04sIFJlZ0V4cCBhbmQgZnVuY3Rpb25zIHdpbGwgYmUgY29udmVydGVkIHRvIHRoZWlyXG4gICAqIHN0cmluZyByZXByZXNlbnRhdGlvbnMsIGluc3RlYWQgb2YgYmVlbiBibGFuayBvYmplY3RzLlxuICAgKiBAcGFyYW0ge2FueX0gYW55IE9iamVjdCB0byBiZSBjb252ZXJ0ZWQgdG8gSlNPTlxuICAgKi9cbiAgc3RhdGljIHRvSnNvbihhbnkpOiBzdHJpbmcge1xuICAgIGxldCBjYWNoZSA9IG5ldyBTZXQoKTtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoYW55LCAoaywgdikgPT4ge1xuICAgICAgaWYgKHYgaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICAgICAgcmV0dXJuIHYudG9TdHJpbmcoKTtcbiAgICAgIH1cbiAgICAgIGlmICh2IGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuIGBbRnVuY3Rpb246ICR7di5uYW1lID8gdi5uYW1lIDogJzxhbm9ueW1vdXM+J31dYDtcbiAgICAgIH1cbiAgICAgIGlmICh2ICYmIHYuY29uc3RydWN0b3IgJiZcbiAgICAgICAgICBPYmplY3QuZ2V0UHJvdG90eXBlT2Yodi5jb25zdHJ1Y3RvcikubmFtZSA9PT0gJ1Byb2Nlc3NvcicpIHtcbiAgICAgICAgcmV0dXJuIGBbUHJvY2Vzc29yOiAke3YuY29uc3RydWN0b3IubmFtZX1dYDtcbiAgICAgIH1cbiAgICAgIGlmICh2ICYmIHR5cGVvZiB2ID09PSAnb2JqZWN0Jykge1xuICAgICAgICBpZiAoY2FjaGUuaGFzKHYpKSB7XG4gICAgICAgICAgcmV0dXJuICdbQ2lyY3VsYXIgc3RydWN0dXJlIG9taXR0ZWRdJztcbiAgICAgICAgfVxuICAgICAgICBjYWNoZS5hZGQodik7XG4gICAgICB9XG4gICAgICByZXR1cm4gdjtcbiAgICB9LCAxKTtcbiAgfVxufTsiXX0=