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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLCtCQUErQjtBQUMvQix5QkFBeUI7QUFDekIsZ0NBQWdDO0FBQ2hDLDZCQUE2QjtBQUU3Qiw2QkFBNkI7QUFFN0IsTUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBRW5EOzs7Ozs7R0FNRztBQUNILE1BQU0sUUFBUSxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLEdBQUcsRUFBRSxFQUFFLEVBQUU7SUFDNUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDZCxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsS0FBSyxHQUFHLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDbEMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN6QixDQUFDO0lBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQztBQUNkLENBQUMsQ0FBQztBQUVGOzs7R0FHRztBQUNILE1BQU0sVUFBVSxHQUFHLENBQUMsYUFBc0IsSUFBSSxFQUFVLEVBQUU7SUFDeEQsSUFBSSxLQUFLLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLFVBQVU7SUFDekIsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsaUJBQWlCO0lBQ2hDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQztRQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLFNBQVM7SUFDeEMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDMUIsQ0FBQyxDQUFBO0FBRUQ7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QyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCAqIGFzIG9zIGZyb20gJ29zJztcbmltcG9ydCAqIGFzIHByb2MgZnJvbSAncHJvY2Vzcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICd1dGlsJztcbmltcG9ydCAqIGFzIHdhbGsgZnJvbSAna2xhdyc7XG5cbmNvbnN0IERFQlVHID0gL15kZWJ1ZyQvaS50ZXN0KHByb2MuZW52Lk5PREVfREVCVUcpO1xuXG4vKipcbiAqIEFkZCBnaXZlbiBBTlNJIGNvbG9yIGNvZGUgdG8gdGhlIGZpcnN0IGVsZW1lbnQgb2YgdGhlIGFycmF5LCBhcHBlbmRcbiAqIHJlc2V0IGNvbG9yIGNvZGUgdG8gdGhlIGVuZC5cbiAqIEBwYXJhbSBhcmdzIEZ1bmN0aW9uIGFyZ3VtZW50c1xuICogQHBhcmFtIGNvbG9yIEFOU0kgY29sb3IgY29kZVxuICogQHBhcmFtIHByZWZpIExvZyBsZXZlbCwgSU5GTywgRVJST1IsIGV0Yy4uXG4gKi9cbmNvbnN0IGNvbG9yaXplID0gKGFyZ3MsIGNvbG9yLCBwcmVmaXggPSAnJykgPT4ge1xuICBpZiAoYXJncy5sZW5ndGgpIHtcbiAgICAgIGFyZ3MudW5zaGlmdChgJHtjb2xvcn0ke3ByZWZpeH1gKTtcbiAgICAgIGFyZ3MucHVzaCgnXFx4MWJbMG0nKTtcbiAgfVxuICByZXR1cm4gYXJncztcbn07XG5cbi8qKlxuICogR2V0IHRoZSBjdXJyZW50IGNhbGwgc3RhY2suXG4gKiBAcGFyYW0gb21pdENhbGxlciBPbWl0IGNhbGxlciBsaW5lIGlmIHRydWVcbiAqL1xuY29uc3Qgc3RhY2t0cmFjZSA9IChvbWl0Q2FsbGVyOiBib29sZWFuID0gdHJ1ZSk6IHN0cmluZyA9PiB7XG4gIGxldCBzdGFjayA9IG5ldyBFcnJvcigpLnN0YWNrLnNwbGl0KCdcXG4nKTtcbiAgc3RhY2suc2hpZnQoKTsgLy8gTWVzc2FnZVxuICBzdGFjay5zaGlmdCgpOyAvLyBDdXJyZW50IG1ldGhvZFxuICBpZiAob21pdENhbGxlcikgc3RhY2suc2hpZnQoKTsgLy8gQ2FsbGVyXG4gIHJldHVybiBzdGFjay5qb2luKCdcXG4nKTtcbn1cblxuZXhwb3J0IGNsYXNzIFV0aWxzIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdUaGlzIGNsYXNzIGNhbiBub3QgYmUgaW5zdGFudGlhdGVkLicpO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIHtib29sfSBUcnVlIGlmIGluIGRlYnVnIG1vZGUuXG4gICAqL1xuICBzdGF0aWMgZGJnKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBERUJVRztcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2cgZGVidWcgbWVzc2FnZVxuICAgKi9cbiAgc3RhdGljIGRlYnVnKC4uLmFyZ3M6IGFueVtdKTogdm9pZCB7XG4gICAgY29uc29sZS5kZWJ1Zy5hcHBseShjb25zb2xlLCBjb2xvcml6ZShhcmdzLCAnXFx4MWJbMm0nLCAnW0RFQlVHXScpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2cgaW5mbyBtZXNzYWdlXG4gICAqL1xuICBzdGF0aWMgaW5mbyguLi5hcmdzOiBhbnlbXSk6IHZvaWQge1xuICAgIGNvbnNvbGUuaW5mby5hcHBseShjb25zb2xlLCBjb2xvcml6ZShhcmdzLCAnXFx4MWJbMzltJywgJ1tJTkZPXScpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2cgd2FybmluZyBtZXNzYWdlXG4gICAqL1xuICBzdGF0aWMgd2FybiguLi5hcmdzOiBhbnlbXSk6IHZvaWQge1xuICAgIGNvbnNvbGUud2Fybi5hcHBseShjb25zb2xlLCBjb2xvcml6ZShhcmdzLCAnXFx4MWJbMzNtJywgJ1tXQVJOXScpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2cgZXJyb3IgbWVzc2FnZVxuICAgKi9cbiAgc3RhdGljIGVycm9yKC4uLmFyZ3M6IGFueVtdKTogdm9pZCB7XG4gICAgY29uc29sZS5lcnJvci5hcHBseShjb25zb2xlLCBjb2xvcml6ZShhcmdzLCAnXFx4MWJbMzFtJywgJ1tFUlJPUl0nKSk7XG4gICAgY29uc29sZS5lcnJvcignU3RhY2t0cmFjZTonKTtcbiAgICBjb25zb2xlLmVycm9yKHN0YWNrdHJhY2UoKSk7XG4gIH1cblxuICAvKipcbiAgICogTG9nIGZhdGFsIG1lc3NhZ2UsIGFuZCB0aHJvdyBidWlsZCBmYWlsZWQgZXJyb3IuXG4gICAqL1xuICBzdGF0aWMgZmF0YWwoLi4uYXJnczogYW55W10pOiB2b2lkIHtcbiAgICBjb25zb2xlLmVycm9yLmFwcGx5KGNvbnNvbGUsIGNvbG9yaXplKGFyZ3MsICdcXHgxYlszMW0nLCAnW0ZBVEFMXScpKTtcbiAgICBjb25zb2xlLmVycm9yKCdTdGFja3RyYWNlOicpO1xuICAgIGNvbnNvbGUuZXJyb3Ioc3RhY2t0cmFjZSgpKTtcbiAgICB0aHJvdyAnVGVybWluYXRpbmcgYnVpbGQnO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIHVuaXF1ZSBzdHJpbmcuIFRoZSB1bmlxdWVuZXNzIGlzIGd1YXJhbnRlZWQgd2l0aGluIHRoZSBwcm9jZXNzLlxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSBVbmlxdWUgc3RyaW5nLlxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgdW5pcXVlU3RyaW5nQmFzZTogbnVtYmVyID0gRGF0ZS5ub3coKTtcbiAgcHJpdmF0ZSBzdGF0aWMgdW5pcXVlU3RyaW5nSW5jZW1lbnQ6IG51bWJlciA9IDE7XG4gIHN0YXRpYyB1bmlxdWVTdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gKFV0aWxzLnVuaXF1ZVN0cmluZ0Jhc2UgKyBVdGlscy51bmlxdWVTdHJpbmdJbmNlbWVudCsrKS50b1N0cmluZygzNik7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGR1cGxpY2F0ZSBlbnRyaWVzIGluIGFuIGFycmF5XG4gICAqIEBwYXJhbSB7YW55W119IGFycmF5IEFycmF5XG4gICAqIEByZXR1cm5zIHthbnlbXX0gQW4gYXJyYXkgd2l0aCBkdXBsaWNhdGVkIGVudHJpZXMgcmVtb3ZlZFxuICAgKi9cbiAgc3RhdGljIHVuaXF1ZUFycmF5KGFycmF5OiBhbnlbXSk6IGFueVtdIHtcbiAgICByZXR1cm4gWy4uLm5ldyBTZXQoYXJyYXkpXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHVuaW9uIG9mIGdpdmVuIGl0ZXJhYmxlc1xuICAgKiBAcGFyYW0gc2V0cyBJdGVyYWJsZXNcbiAgICogQHJldHVybnMgVW5pb24gb2YgZ2l2ZW4gaXRlcmFibGVzXG4gICAqL1xuICBzdGF0aWMgdW5pb248VD4oLi4uc2V0czogSXRlcmFibGU8VD5bXSk6IFNldDxUPiB7XG4gICAgcmV0dXJuIChzZXRzIHx8IFtdKS5yZWR1Y2UoKHUsIHMpID0+IG5ldyBTZXQoWy4uLnUsIC4uLnNdKSwgbmV3IFNldCgpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGludGVyc2VjdGlvbiBvZiBnaXZlbiBpdGVyYWJsZXNcbiAgICogQHBhcmFtIHNldHMgSXRlcmFibGVzXG4gICAqIEByZXR1cm5zIEludGVyc2VjdGlvbiBvZiBnaXZlbiBpdGVyYWJsZXNcbiAgICovXG4gIHN0YXRpYyBpbnRlcnNlY3Rpb248VD4oLi4uc2V0czogSXRlcmFibGU8VD5bXSk6IFNldDxUPiB7XG4gICAgaWYgKHNldHMubGVuZ3RoIDwgMSkgcmV0dXJuIG5ldyBTZXQoc2V0c1swXSB8fCBbXSk7XG4gICAgbGV0IGZpcnN0OiBTZXQ8VD4gPSBuZXcgU2V0KHNldHMuc2hpZnQoKSk7XG4gICAgc2V0cy5mb3JFYWNoKHNldCA9PlxuICAgICAgZmlyc3QgPSBuZXcgU2V0KFsuLi5maXJzdF0uZmlsdGVyKGUgPT4gbmV3IFNldChzZXQpLmhhcyhlKSkpXG4gICAgKTtcbiAgICByZXR1cm4gZmlyc3Q7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBsYXN0IGVsZW1lbnQgaW4gdGhlIGdpdmVuIGNvbGxlY3Rpb24uXG4gICAqIE5vdCBzdXJlIGFib3V0IHRoZSBwZXJmb3JtYW5jZSBzbyBzaG91bGQgbm90IHVzZSBvbiBsYXJnZSBjb2xsZWN0aW9ucy5cbiAgICogQHBhcmFtIHtJdGVyYWJsZTxUPn0gaXRlcmFibGUgSXRlcmFibGUgY29sbGVjdGlvblxuICAgKiBAcmV0dXJucyB7VH0gTGFzdCBlbGVtZW50XG4gICAqL1xuICBzdGF0aWMgbGFzdEVsZW1lbnQ8VD4oaXRlcmFibGU6IEl0ZXJhYmxlPFQ+KTogVCB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20oaXRlcmFibGUpLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgdW5pcXVlIHBhdGggaW4gdGhlIGdpdmVuIGRpciBvciBzeXN0ZW0gdG1wZGlyLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcGFyZW50IE9wdGlvbmFsIHBhcmVudCBkaXIuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbcHJlZml4PV0gcHJlZml4IE9wdGlvbmFsIHByZWZpeC5cbiAgICogQHJldHVybnMge3N0cmluZ30gVW5pcXVlIHRlbXAgZGlyLlxuICAgKi9cbiAgc3RhdGljIHRtcFBhdGgocGFyZW50OiBzdHJpbmcsIHByZWZpeDogc3RyaW5nID0gJycpOiBzdHJpbmcge1xuICAgIGxldCBkaXI6IHN0cmluZyA9IGAke3ByZWZpeH0ke1V0aWxzLnVuaXF1ZVN0cmluZygpfWA7XG4gICAgbGV0IHRtcDogc3RyaW5nID0gcGF0aC5yZXNvbHZlKHBhcmVudCB8fCBvcy50bXBkaXIoKSwgZGlyKTtcbiAgICBmcy5lbnN1cmVEaXJTeW5jKHRtcCk7XG4gICAgcmV0dXJuIHRtcDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFkIGZpbGUgaW4gdXRmOCBlbmNvZGluZ1xuICAgKiBAcGFyYW0ge3N0cmluZ30gZmlsZSBGaWxlIHBhdGhcbiAgICogQHBhcmFtIHthbnl9IG9wdHMgT3B0aW9uc1xuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fSBGaWxlIGNvbnRlbnRzXG4gICAqL1xuICBzdGF0aWMgcmVhZEZpbGUoZmlsZSwgb3B0czogYW55ID0ge30pOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiBmcy5yZWFkRmlsZShmaWxlLCBVdGlscy5zaGFsbG93TWVyZ2Uob3B0cywgeyBlbmNvZGluZzogJ3V0ZjgnIH0pKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXcml0ZSBmaWxlIGluIHV0ZjggZW5jb2RpbmdcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZpbGUgRmlsZSBwYXRoXG4gICAqIEBwYXJhbSB7YW55fSBkYXRhIEZpbGUgY29udGVudHNcbiAgICogQHBhcmFtIHthbnl9IG9wdHMgT3B0aW9uc1xuICAgKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPn1cbiAgICovXG4gIHN0YXRpYyB3cml0ZUZpbGUoZmlsZTogc3RyaW5nLCBkYXRhOiBhbnksIG9wdHM6IGFueSA9IHt9KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIGZzLm91dHB1dEZpbGUoZmlsZSwgZGF0YSwgVXRpbHMuc2hhbGxvd01lcmdlKG9wdHMsIHtcbiAgICAgIGVuY29kaW5nOiAndXRmOCdcbiAgICB9KSk7XG4gIH1cblxuICAvKipcbiAgICogRmluZCB0aGUgY2xvc2VzdCBhbmNlc3RvciB3aXRoICdwYWNrYWdlLmpzb24nIGZpbGUgaW4gaXQuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IFBhdGggb2YgdGhlIHBhY2thZ2Ugcm9vdCBkaXJlY3RvcnksIG9yIG51bGxcbiAgICovXG4gIHN0YXRpYyBhc3luYyBnZXRQYWNrYWdlUm9vdCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGxldCB3aW4zMjogYm9vbGVhbiA9IC9ed2luLy50ZXN0KHByb2Nlc3MucGxhdGZvcm0pO1xuICAgIGxldCBjd2Q6IHN0cmluZyA9IHByb2MuY3dkKCk7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGxldCBwa2c6IHN0cmluZyA9IHBhdGgucmVzb2x2ZShjd2QsICdwYWNrYWdlLmpzb24nKTtcbiAgICAgIGlmICgoYXdhaXQgZnMuc3RhdChwa2cpKS5pc0ZpbGUoKSkge1xuICAgICAgICByZXR1cm4gY3dkO1xuICAgICAgfVxuICAgICAgY3dkID0gcGF0aC5yZXNvbHZlKGN3ZCwgJy4uJyk7XG4gICAgICBpZiAoIXdpbjMyICYmIGN3ZCA9PT0gJy8nIHx8IHdpbjMyICYmIC9eW0EtWl06XFxcXD8kLy50ZXN0KGN3ZCkpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERvIHNoYWxsb3cgbWVyZ2UsIHJldHVybiBhIG5ldyBvYmplY3Qgd2l0aCBhbGwgbWVyZ2VkIHByb3BlcnRpZXNcbiAgICogQHBhcmFtIHsuLi5hbnl9IG9ianMgTGlzdCBvZiBvYmplY3RzXG4gICAqIEByZXR1cm5zIHthbnl9IE1lcmdlZCBvYmplY3RcbiAgICovXG4gIHN0YXRpYyBzaGFsbG93TWVyZ2UoLi4ub2Jqcyk6IGFueSB7XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24uYXBwbHkoT2JqZWN0LCBbe31dLmNvbmNhdChvYmpzIHx8IHt9KSk7XG4gIH1cblxuICAvKipcbiAgICogQ29weSBmaWxlc1xuICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBzb3VyY2VzIFBhdGhzIHRvIHNvdXJjZXNcbiAgICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0cyBQYXRocyB0byB0YXJnZXRzXG4gICAqIEBwYXJhbSB7YW55fSBvcHRzIE9wdGlvbnMgcGFzcyB0byBmcy5jb3B5KClcbiAgICogQHJldHVybnMge1Byb21pc2U8dm9pZD59XG4gICAqL1xuICBzdGF0aWMgYXN5bmMgY29weUZpbGVzKHNvdXJjZXM6IHN0cmluZ1tdLCB0YXJnZXRzOiBzdHJpbmdbXSwgb3B0czogYW55KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgc291cmNlcyA9IHNvdXJjZXMgfHwgW107XG4gICAgdGFyZ2V0cyA9IHRhcmdldHMgfHwgW107XG4gICAgb3B0cyA9IG9wdHMgfHwge307XG4gICAgaWYgKHNvdXJjZXMubGVuZ3RoICE9PSB0YXJnZXRzLmxlbmd0aCkge1xuICAgICAgVXRpbHMuZXJyb3IoYENvcHkgZmlsZSBlcnJvciwgc291cmNlcyBhbmQgdGFyZ2V0cyBlbnRyeSBzaXplIG1pc21hdGNoYCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGF3YWl0IFByb21pc2UuYWxsKHNvdXJjZXMubWFwKChmaWxlLCBpKSA9PlxuICAgICAgICBmcy5jb3B5KGZpbGUsIHRhcmdldHNbaV0sIG9wdHMpXG4gICAgICApKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ29uY2F0ZW5hdGUgZmlsZXNcbiAgICogQHBhcmFtIHtzdHJpbmd9IGRlc3QgUGF0aCB0byB0aGUgZGVzdGluYXRpb24gZmlsZVxuICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBpbnB1dHMgUGF0aHMgb2YgZmlsZXMgdG8gYmUgY29uY2F0ZW5hdGVkXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+fVxuICAgKi9cbiAgc3RhdGljIGFzeW5jIGNvbmNhdEZpbGVzKGRlc3Q6IHN0cmluZywgaW5wdXRzOiBzdHJpbmdbXSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxldCB3cml0YWJsZSA9IGZzLmNyZWF0ZVdyaXRlU3RyZWFtKGRlc3QsIHsgZmxhZ3M6ICd3JywgZW5jb2Rpbmc6ICd1dGY4JyB9KTtcbiAgICBsZXQgbGFzdFJlYWRhYmxlO1xuICAgIGlucHV0cy5mb3JFYWNoKGlucHV0ID0+IHtcbiAgICAgIGxhc3RSZWFkYWJsZSA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0oaW5wdXQpO1xuICAgICAgbGFzdFJlYWRhYmxlLnBpcGUod3JpdGFibGUsIHsgZW5kOiBmYWxzZSB9KTtcbiAgICAgIHdyaXRhYmxlLndyaXRlKFwiXFxuXCIpO1xuICAgIH0pO1xuICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgaWYgKGxhc3RSZWFkYWJsZSkge1xuICAgICAgICBsYXN0UmVhZGFibGUub24oJ2VuZCcsICgpID0+IHtcbiAgICAgICAgICB3cml0YWJsZS5lbmQoKTtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBldmVyeXRpbmcgaW4gdGhlIGdpdmVuIGRpciBleGNlcHQgZm9yIHRob3NlIGFwcGVhciBpbiBmaWxlVG9LZWVwXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBkaXIgRGlyZWN0b3J5IHRvIGNsZWFuXG4gICAqIEBwYXJhbSB7c3RyaW5nW119IGZpbGVzVG9LZWVwIExpc3Qgb2YgZmlsZSBwYXRocyB0byBrZWVwXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+fVxuICAgKi9cbiAgc3RhdGljIGFzeW5jIGNsZWFuRGlyZWN0b3J5KGRpcjogc3RyaW5nLCBmaWxlc1RvS2VlcDogc3RyaW5nW10pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsZXQga2VlcGVyczogU2V0PHN0cmluZz4gPSBuZXcgU2V0KCk7XG4gICAgbGV0IGRlbGV0ZWVzOiBzdHJpbmdbXSA9IFtdOyAvLyBJcyB0aGlzIGEgd29yZD9cbiAgICBsZXQgZmFpbHVyZXM6IHN0cmluZ1tdID0gW107XG5cbiAgICAoZmlsZXNUb0tlZXAgfHwgW10pLmZvckVhY2goZmlsZSA9PiB7XG4gICAgICBsZXQgcmVsYXRpdmU6IHN0cmluZyA9IGZpbGU7XG4gICAgICBpZiAocGF0aC5pc0Fic29sdXRlKGZpbGUpKSB7XG4gICAgICAgIGlmIChmaWxlLnN0YXJ0c1dpdGgoYCR7ZGlyfS9gKSkge1xuICAgICAgICAgIHJlbGF0aXZlID0gcGF0aC5yZWxhdGl2ZShkaXIsIGZpbGUpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgVXRpbHMud2FybihgJHtmaWxlfSBpcyBub3QgaW5zaWRlIG9mICR7ZGlyfSwgc2tpcHBpbmcuYCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBLZWVwIGZpbGVzIGFuZCBhbGwgYW5jZXN0b3IgZGlyc1xuICAgICAgd2hpbGUgKHJlbGF0aXZlICE9PSAnJyAmJiByZWxhdGl2ZSAhPT0gJy4nKSB7XG4gICAgICAgIGtlZXBlcnMuYWRkKHJlbGF0aXZlKTtcbiAgICAgICAgcmVsYXRpdmUgPSBwYXRoLmRpcm5hbWUocmVsYXRpdmUpO1xuICAgICAgfVxuICAgICAgLy8gQWRkIHRhcmdldCBkaXJlY3RvcnkgYXMgd2VsbFxuICAgICAga2VlcGVycy5hZGQoJycpO1xuICAgICAga2VlcGVycy5hZGQoJy4nKTtcbiAgICB9KTtcblxuICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHdhbGsoZGlyLCB7fSlcbiAgICAgICAgLm9uKCdkYXRhJywgaXRlbSA9PiB7XG4gICAgICAgICAgaWYgKCFrZWVwZXJzLmhhcyhwYXRoLnJlbGF0aXZlKGRpciwgaXRlbS5wYXRoKSkpIHtcbiAgICAgICAgICAgIGRlbGV0ZWVzLnB1c2goaXRlbS5wYXRoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5vbignZXJyb3InLCAoZXJyLCBpdGVtKSA9PlxuICAgICAgICAgIGZhaWx1cmVzLnB1c2goYCR7aXRlbS5wYXRofTogJHtlcnIubWVzc2FnZX1gKVxuICAgICAgICApXG4gICAgICAgIC5vbignZW5kJywgKCkgPT4gcmVzb2x2ZSgpKTtcbiAgICB9KTtcbiAgICBpZiAoZmFpbHVyZXMubGVuZ3RoKSB7XG4gICAgICBVdGlscy5lcnJvcignRXJyb3IgY2xlYW5uaW5nIGZpbGVzOicsIGZhaWx1cmVzLmpvaW4oJ1xcbicpKTtcbiAgICB9XG4gICAgLy8gV2hlbiBkZWxldGluZyBkaXJlY3RvcnksIHNraXAgZmlsZXMgaW5zaWRlIG9mIGl0LlxuICAgIGRlbGV0ZWVzID0gVXRpbHMuZmluZENvbW1vblBhcmVudHMoZGVsZXRlZXMpO1xuICAgIFV0aWxzLmRiZygpICYmIGRlbGV0ZWVzLmxlbmd0aCAmJiBVdGlscy5kZWJ1ZygnRGVsZXRpbmc6JywgZGVsZXRlZXMpO1xuICAgIGF3YWl0IFByb21pc2UuYWxsKGRlbGV0ZWVzLm1hcChkZWxldGVlID0+IGZzLnJlbW92ZShkZWxldGVlKSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmQgYWxsIGNvbW1vbiBwYXJlbnQgZGlyZWN0b3JpZXMgaW4gdGhlIGdpdmVuIGFycmF5IG9mIGZpbGUgcGF0aHMuXG4gICAqIEZvciBleGFtcGxlLCBnaXZpbmcgWycvYS9iL2MnLCAnL2EvYi9kJywgJy9hL2InLCAnL3gveScsICcveCddLFxuICAgKiB3aWxsIHJldHVybiBbJy9hL2InLCAnL3gnXVxuICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBwYXRocyBBbiBhcnJheSBvZiBhYnNvbHV0ZSBwYXRoc1xuICAgKiBAcmV0dXJucyB7c3RyaW5nW119IENvbW1vbiBwYXJlbnQgZGlyZWN0b3JpZXNcbiAgICovXG4gIHN0YXRpYyBmaW5kQ29tbW9uUGFyZW50cyhwYXRoczogc3RyaW5nW10pOiBzdHJpbmdbXSB7XG4gICAgbGV0IHNvcnRlZDogc3RyaW5nW10gPSAocGF0aHMgfHwgW10pLnNvcnQoKTtcbiAgICBsZXQgcGFyZW50czogc3RyaW5nW10gPSBbXTtcbiAgICBpZiAoc29ydGVkLmxlbmd0aCA9PT0gMSkge1xuICAgICAgcGFyZW50cyA9IHNvcnRlZDtcbiAgICB9XG4gICAgaWYgKHNvcnRlZC5sZW5ndGggPiAxKSB7XG4gICAgICBsZXQgY3Vycjogc3RyaW5nID0gc29ydGVkWzBdO1xuICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMTsgaSA8IHNvcnRlZC5sZW5ndGg7ICsraSkge1xuICAgICAgICBpZiAoIXNvcnRlZFtpXS5zdGFydHNXaXRoKGAke2N1cnIgPT09ICcvJyA/ICcnIDogY3Vycn0vYCkpIHtcbiAgICAgICAgICBwYXJlbnRzLnB1c2goY3Vycik7XG4gICAgICAgICAgY3VyciA9IHNvcnRlZFtpXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcGFyZW50cy5wdXNoKGN1cnIpO1xuICAgIH1cbiAgICByZXR1cm4gcGFyZW50cztcbiAgfVxuXG4gIC8qKlxuICAgKiBMaXN0IGZpbGVzIHJlY3Vyc2l2ZWx5LCBvbmx5IHJlZ3VsYXIgZmlsZXMgYW5kIHN5bWJvbCBsaW5rcyBhcmUgcmV0dXJuZWQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBkaXIgRGlyZWN0b3J5IHRvIHNjYW5cbiAgICogQHBhcmFtIHtib29sZWFufSBbcmVsYXRpdmU9ZmFsc2VdIHJlbGF0aXZlIFJldHVybiBwYXRocyByZWxhdGl2ZSB0byBkaXIgaWYgdHJ1ZVxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmdbXT59IExpc3Qgb2YgZmlsZSBwYXRoc1xuICAgKi9cbiAgc3RhdGljIGFzeW5jIGxpc3RBbGxGaWxlcyhkaXI6IHN0cmluZywgcmVsYXRpdmU6IGJvb2xlYW4gPSBmYWxzZSk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgICBsZXQgZmlsZXM6IHN0cmluZ1tdID0gW107XG4gICAgbGV0IGZhaWx1cmVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgd2FsayhkaXIsIHtcbiAgICAgICAgZmlsdGVyOiBmaWxlID0+IHtcbiAgICAgICAgICBsZXQgc3RhdCA9IGZzLnN0YXRTeW5jKGZpbGUpO1xuICAgICAgICAgIHJldHVybiBzdGF0LmlzRmlsZSgpIHx8IHN0YXQuaXNTeW1ib2xpY0xpbmsoKSB8fCBzdGF0LmlzRGlyZWN0b3J5KCk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAgIC5vbignZW5kJywgKCkgPT4gcmVzb2x2ZSgpKVxuICAgICAgICAub24oJ2Vycm9yJywgKGVyciwgaXRlbSkgPT5cbiAgICAgICAgICBmYWlsdXJlcy5wdXNoKGAke2l0ZW0ucGF0aH06ICR7ZXJyLm1lc3NhZ2V9YClcbiAgICAgICAgKVxuICAgICAgICAub24oJ2RhdGEnLCBpdGVtID0+IHtcbiAgICAgICAgICBpZiAoIWl0ZW0uc3RhdHMuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgICAgZmlsZXMucHVzaChyZWxhdGl2ZSA/IHBhdGgucmVsYXRpdmUoZGlyLCBpdGVtLnBhdGgpIDogaXRlbS5wYXRoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICAgIGlmIChmYWlsdXJlcy5sZW5ndGgpIHtcbiAgICAgIFV0aWxzLmVycm9yKCdFcnJvciBsaXN0aW5nIGRpcmVjdG9yeScsIGZhaWx1cmVzLmpvaW4oJ1xcbicpKTtcbiAgICB9XG4gICAgcmV0dXJuIGZpbGVzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRlc3QgYSBzdHJpbmcgYWdhaW5zdCBhbiBhcnJheSBvZiBSZWdFeHBzIG9yIHN0cmluZ3MsIHJldHVybiB0cnVlIG9uIGFueVxuICAgKiBtYXRjaC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0ciBOZWVkbGVcbiAgICogQHBhcmFtIHthbnlbXX0gcGF0dGVybnMgSGF5c3RhY2tcbiAgICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgbWF0Y2hlZCwgb3RoZXJ3aXNlIGZhbHNlXG4gICAqL1xuICBzdGF0aWMgbWF0Y2hPckVxdWFsKHN0cjogc3RyaW5nLCBwYXR0ZXJuczogYW55W10pOiBib29sZWFuIHtcbiAgICByZXR1cm4gcGF0dGVybnMuc29tZShwYXR0ZXJuID0+IHtcbiAgICAgIGxldCBpc1JlZ2V4ID0gcGF0dGVybiBpbnN0YW5jZW9mIFJlZ0V4cDtcbiAgICAgIHJldHVybiBpc1JlZ2V4ICYmIHBhdHRlcm4udGVzdChzdHIpIHx8ICFpc1JlZ2V4ICYmIHBhdHRlcm4gPT09IHN0cjtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0IGFueXRoaW5nIHRvIEpTT04sIFJlZ0V4cCBhbmQgZnVuY3Rpb25zIHdpbGwgYmUgY29udmVydGVkIHRvIHRoZWlyXG4gICAqIHN0cmluZyByZXByZXNlbnRhdGlvbnMsIGluc3RlYWQgb2YgYmVlbiBibGFuayBvYmplY3RzLlxuICAgKiBAcGFyYW0ge2FueX0gYW55IE9iamVjdCB0byBiZSBjb252ZXJ0ZWQgdG8gSlNPTlxuICAgKi9cbiAgc3RhdGljIHRvSnNvbihhbnkpOiBzdHJpbmcge1xuICAgIGxldCBjYWNoZSA9IG5ldyBTZXQoKTtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoYW55LCAoaywgdikgPT4ge1xuICAgICAgaWYgKHYgaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICAgICAgcmV0dXJuIHYudG9TdHJpbmcoKTtcbiAgICAgIH1cbiAgICAgIGlmICh2IGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuIGBbRnVuY3Rpb246ICR7di5uYW1lID8gdi5uYW1lIDogJzxhbm9ueW1vdXM+J31dYDtcbiAgICAgIH1cbiAgICAgIGlmICh2ICYmIHYuY29uc3RydWN0b3IgJiZcbiAgICAgICAgICBPYmplY3QuZ2V0UHJvdG90eXBlT2Yodi5jb25zdHJ1Y3RvcikubmFtZSA9PT0gJ1Byb2Nlc3NvcicpIHtcbiAgICAgICAgcmV0dXJuIGBbUHJvY2Vzc29yOiAke3YuY29uc3RydWN0b3IubmFtZX1dYDtcbiAgICAgIH1cbiAgICAgIGlmICh2ICYmIHR5cGVvZiB2ID09PSAnb2JqZWN0Jykge1xuICAgICAgICBpZiAoY2FjaGUuaGFzKHYpKSB7XG4gICAgICAgICAgcmV0dXJuICdbQ2lyY3VsYXIgc3RydWN0dXJlIG9taXR0ZWRdJztcbiAgICAgICAgfVxuICAgICAgICBjYWNoZS5hZGQodik7XG4gICAgICB9XG4gICAgICByZXR1cm4gdjtcbiAgICB9LCAxKTtcbiAgfVxufTsiXX0=