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
const path = require("path");
const utils_1 = require("~/utils");
const state_1 = require("~/states/state");
const processor_1 = require("~/processors/processor");
const finalizer_1 = require("~/processors/finalizer");
const builder_models_1 = require("~/models/builder-models");
class Builder {
    constructor(rootDir, workDir, userFile, defaults) {
        this.envPromise = this.buildEnv(rootDir, workDir, userFile, defaults);
        this.name = this.constructor.name;
        this.stateClass = state_1.State;
        this.ruleToTargets = new Map();
    }
    /**
     * Import configs in user file, merge with default configs
     * @param {string} userFile Path to user config file
     * @returns {any} User configs
     */
    getConfig(userFile) {
        let userConfig = {};
        if (fs.existsSync(userFile)) {
            try {
                userConfig = require(userFile);
            }
            catch (err) {
                utils_1.Utils.fatal(`${userFile} corrupted or unreadable.`, err);
            }
        }
        else {
            utils_1.Utils.info(`${userFile} doesn't exist, will use default config.`);
        }
        return userConfig;
    }
    /**
     * Sanitize config.
     * @param {Configuration} config Config
     * @param {string} rootDir Project root directory
     * @returns {Configuration} Santinized config
     */
    sanitizeConfig(config, rootDir) {
        config.relativeSourceDir = config.sourceDir;
        config.relativeTargetDir = config.targetDir;
        config.sourceDir = path.resolve(rootDir, config.sourceDir);
        config.targetDir = path.resolve(rootDir, config.targetDir);
        config.rules.forEach(rule => {
            rule.sources = rule.sources ? [].concat(rule.sources) : [];
            rule.files = new Set();
            rule.finalizer = new finalizer_1.Finalizer(config.targetDir, rule.targets);
            rule.processors = rule.processors || [];
            rule.processors.forEach(processor => {
                if (processor.process !== processor_1.Processor.prototype.process) {
                    utils_1.Utils.fatal(`${processor.id}: .process() shouldn't be overriden.`);
                }
            });
        });
        return config;
    }
    /**
     * Merge default and user config.
     * @param {any} defaults Default config
     * @param {any} userConfig User config
     * @returns {Configuration} Merged config
     */
    mergeConfig(defaults, userConfig) {
        let fallbackRules = defaults.fallbackRules;
        let rules = userConfig.rules || [];
        let config;
        delete defaults.fallbackRules;
        delete userConfig.fallbackRules;
        config = utils_1.Utils.shallowMerge(defaults, userConfig);
        config.rules = fallbackRules.concat(rules);
        return config;
    }
    /**
     * Matches a file path against rules in reversed order, return the first found
     * @param config Config
     * @param file File to match
     * @returns The matched rule, or undefined if no match
     */
    matchRule(config, file) {
        // Traverse in reverse order so later rules have higher priorities
        for (let i = config.rules.length - 1; i >= 0; --i) {
            let rule = config.rules[i];
            if (utils_1.Utils.matchOrEqual(file, rule.sources)) {
                return rule;
            }
        }
    }
    /**
     * Scan source directory, get full manifest of files, and add matched files
     * to each rule in config.
     * Also build mapping from file path to matching rule.
     * @param {Object} config Config
     * @returns {Array} [Config with matched files, file path to rule mapping]
     */
    matchSourceFiles(config) {
        return __awaiter(this, void 0, void 0, function* () {
            this.fileToRule = new Map();
            (yield utils_1.Utils.listAllFiles(config.sourceDir, true)).forEach(file => {
                let rule = this.matchRule(config, file);
                if (rule) {
                    rule.files.add(file);
                    this.fileToRule.set(file, rule);
                }
            });
            return config;
        });
    }
    /**
     * Consolidate global variables
     * @param {string} rootDir Project directory
     * @param {string} workDir Work directory
     * @param {string} userFile User file name
     * @param {any} defaults Default config
     */
    buildEnv(rootDir, workDir, userFile, defaults) {
        return __awaiter(this, void 0, void 0, function* () {
            let userFilePath = path.resolve(rootDir, userFile);
            let userConfig = this.getConfig(userFilePath);
            let mergedConfig = this.mergeConfig(defaults, userConfig);
            let sanitizedConfig = this.sanitizeConfig(mergedConfig, rootDir);
            let config = yield this.matchSourceFiles(sanitizedConfig);
            let env = new builder_models_1.Environment();
            env.rootDir = rootDir;
            env.workDir = workDir;
            env.sourceDir = config.sourceDir;
            env.targetDir = config.targetDir;
            env.relativeSourceDir = config.relativeSourceDir;
            env.relativeTargetDir = config.relativeTargetDir;
            env.userFile = userFilePath;
            env.config = config;
            utils_1.Utils.dbg() && utils_1.Utils.debug('Environment: ', utils_1.Utils.toJson(env));
            return env;
        });
    }
    /**
     * Get all build targets
     * @returns Array for targets
     */
    getAllTargets() {
        return [...this.ruleToTargets.values()]
            .reduce((all, perRule) => all.concat(perRule), []);
    }
    /**
     * Ensures a symlink to the node_modules dir exists in the processor work dir
     * @param dir Work dir of a processor
     */
    ensureNodeModules(dir) {
        return __awaiter(this, void 0, void 0, function* () {
            let npdir = path.resolve(this.env.rootDir, 'node_modules');
            let symlink = path.resolve(dir, 'node_modules');
            return fs.ensureSymlink(npdir, symlink);
        });
    }
    /**
     * Invoke processors in a rule, mutate states
     * @param rule Rule
     * @param state State
     * @returns true if all processors succeeded, false otherwise
     */
    invokeProcessors(rule, state) {
        return __awaiter(this, void 0, void 0, function* () {
            let success = true;
            for (let processor of rule.processors) {
                let input = state.nextInput();
                yield this.ensureNodeModules(state.currentContext().rootDir);
                let output = yield processor.process(input);
                state.saveOutput(output);
                success = success && !output.failures.length;
            }
            if (rule.processors.length) {
                let targets = yield rule.finalizer.finalize(state.finalizerInput());
                utils_1.Utils.dbg() && utils_1.Utils.debug(`Build passed in ${rule.sources}:`, targets);
                this.ruleToTargets.set(rule, targets);
            }
            return success;
        });
    }
    /**
     * Do one time build
     * @returns Promise, resolve when done.
     */
    build() {
        return __awaiter(this, void 0, void 0, function* () {
            let success = true;
            this.env = yield this.envPromise;
            this.states = yield Promise.all(this.env.config.rules.map((rule) => __awaiter(this, void 0, void 0, function* () {
                let state = new this.stateClass(this.env, rule);
                if (rule.files.size) {
                    state.beforeBuild();
                    success = (yield this.invokeProcessors(rule, state)) && success;
                    state.afterBuild();
                }
                return state;
            })));
            let targets = this.getAllTargets();
            utils_1.Utils.dbg() && utils_1.Utils.debug(`${this.name}: Final targets`, targets);
            return utils_1.Utils.cleanDirectory(this.env.targetDir, targets)
                .then(() => utils_1.Utils.info(`Build ${success ? 'SUCCESS' : 'FAILED'}`))
                .catch(ex => utils_1.Utils.error(`Error happened during cleanup`, ex));
        });
    }
    exit() {
    }
}
exports.Builder = Builder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9idWlsZGVycy9idWlsZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSwrQkFBK0I7QUFDL0IsNkJBQTZCO0FBQzdCLG1DQUFnQztBQUNoQywwQ0FBdUM7QUFDdkMsc0RBQW1EO0FBQ25ELHNEQUFtRDtBQUNuRCw0REFBMkU7QUFHM0U7SUFTRSxZQUFZLE9BQWUsRUFBRSxPQUFlLEVBQUUsUUFBZ0IsRUFBRSxRQUFhO1FBQzNFLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN0RSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO1FBQ2xDLElBQUksQ0FBQyxVQUFVLEdBQUcsYUFBSyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUNqQyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLFNBQVMsQ0FBQyxRQUFnQjtRQUNoQyxJQUFJLFVBQVUsR0FBUSxFQUFFLENBQUM7UUFDekIsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUIsSUFBSSxDQUFDO2dCQUNILFVBQVUsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDakMsQ0FBQztZQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ2IsYUFBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLFFBQVEsMkJBQTJCLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDM0QsQ0FBQztRQUNILENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLGFBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxRQUFRLDBDQUEwQyxDQUFDLENB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LENBQUMsQ0FBQztRQUNuRSxDQUFDO0tBQUE7SUFFRCxJQUFJO0lBQ0osQ0FBQztDQUNGO0FBL01ELDBCQStNQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBVdGlscyB9IGZyb20gJ34vdXRpbHMnO1xuaW1wb3J0IHsgU3RhdGUgfSBmcm9tICd+L3N0YXRlcy9zdGF0ZSc7XG5pbXBvcnQgeyBQcm9jZXNzb3IgfSBmcm9tICd+L3Byb2Nlc3NvcnMvcHJvY2Vzc29yJztcbmltcG9ydCB7IEZpbmFsaXplciB9IGZyb20gJ34vcHJvY2Vzc29ycy9maW5hbGl6ZXInO1xuaW1wb3J0IHsgUnVsZSwgRW52aXJvbm1lbnQsIENvbmZpZ3VyYXRpb24gfSBmcm9tICd+L21vZGVscy9idWlsZGVyLW1vZGVscyc7XG5pbXBvcnQgeyBQcm9jZXNzb3JJbnB1dCB9IGZyb20gJ34vbW9kZWxzL3Byb2Nlc3Nvci1tb2RlbHMnO1xuXG5leHBvcnQgY2xhc3MgQnVpbGRlciB7XG4gIHByb3RlY3RlZCBuYW1lOiBzdHJpbmc7XG4gIHByb3RlY3RlZCBlbnZQcm9taXNlOiBQcm9taXNlPEVudmlyb25tZW50PjtcbiAgcHJvdGVjdGVkIHN0YXRlQ2xhc3M6IHR5cGVvZiBTdGF0ZTtcbiAgcHJvdGVjdGVkIGVudjogRW52aXJvbm1lbnQ7XG4gIHByb3RlY3RlZCBzdGF0ZXM6IFN0YXRlW107XG4gIHByb3RlY3RlZCBmaWxlVG9SdWxlOiBNYXA8c3RyaW5nLCBSdWxlPjtcbiAgcHJvdGVjdGVkIHJ1bGVUb1RhcmdldHM6IE1hcDxSdWxlLCBzdHJpbmdbXT47XG5cbiAgY29uc3RydWN0b3Iocm9vdERpcjogc3RyaW5nLCB3b3JrRGlyOiBzdHJpbmcsIHVzZXJGaWxlOiBzdHJpbmcsIGRlZmF1bHRzOiBhbnkpIHtcbiAgICB0aGlzLmVudlByb21pc2UgPSB0aGlzLmJ1aWxkRW52KHJvb3REaXIsIHdvcmtEaXIsIHVzZXJGaWxlLCBkZWZhdWx0cyk7XG4gICAgdGhpcy5uYW1lID0gdGhpcy5jb25zdHJ1Y3Rvci5uYW1lO1xuICAgIHRoaXMuc3RhdGVDbGFzcyA9IFN0YXRlO1xuICAgIHRoaXMucnVsZVRvVGFyZ2V0cyA9IG5ldyBNYXAoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbXBvcnQgY29uZmlncyBpbiB1c2VyIGZpbGUsIG1lcmdlIHdpdGggZGVmYXVsdCBjb25maWdzXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1c2VyRmlsZSBQYXRoIHRvIHVzZXIgY29uZmlnIGZpbGVcbiAgICogQHJldHVybnMge2FueX0gVXNlciBjb25maWdzXG4gICAqL1xuICBwcml2YXRlIGdldENvbmZpZyh1c2VyRmlsZTogc3RyaW5nKTogYW55IHtcbiAgICBsZXQgdXNlckNvbmZpZzogYW55ID0ge307XG4gICAgaWYgKGZzLmV4aXN0c1N5bmModXNlckZpbGUpKSB7XG4gICAgICB0cnkge1xuICAgICAgICB1c2VyQ29uZmlnID0gcmVxdWlyZSh1c2VyRmlsZSk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgVXRpbHMuZmF0YWwoYCR7dXNlckZpbGV9IGNvcnJ1cHRlZCBvciB1bnJlYWRhYmxlLmAsIGVycik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIFV0aWxzLmluZm8oYCR7dXNlckZpbGV9IGRvZXNuJ3QgZXhpc3QsIHdpbGwgdXNlIGRlZmF1bHQgY29uZmlnLmApO1xuICAgIH1cbiAgICByZXR1cm4gdXNlckNvbmZpZztcbiAgfVxuXG4gIC8qKlxuICAgKiBTYW5pdGl6ZSBjb25maWcuXG4gICAqIEBwYXJhbSB7Q29uZmlndXJhdGlvbn0gY29uZmlnIENvbmZpZ1xuICAgKiBAcGFyYW0ge3N0cmluZ30gcm9vdERpciBQcm9qZWN0IHJvb3QgZGlyZWN0b3J5XG4gICAqIEByZXR1cm5zIHtDb25maWd1cmF0aW9ufSBTYW50aW5pemVkIGNvbmZpZ1xuICAgKi9cbiAgcHJpdmF0ZSBzYW5pdGl6ZUNvbmZpZyhjb25maWc6IENvbmZpZ3VyYXRpb24sIHJvb3REaXI6IHN0cmluZyk6IENvbmZpZ3VyYXRpb24ge1xuICAgIGNvbmZpZy5yZWxhdGl2ZVNvdXJjZURpciA9IGNvbmZpZy5zb3VyY2VEaXI7XG4gICAgY29uZmlnLnJlbGF0aXZlVGFyZ2V0RGlyID0gY29uZmlnLnRhcmdldERpcjtcbiAgICBjb25maWcuc291cmNlRGlyID0gcGF0aC5yZXNvbHZlKHJvb3REaXIsIGNvbmZpZy5zb3VyY2VEaXIpO1xuICAgIGNvbmZpZy50YXJnZXREaXIgPSBwYXRoLnJlc29sdmUocm9vdERpciwgY29uZmlnLnRhcmdldERpcik7XG4gICAgY29uZmlnLnJ1bGVzLmZvckVhY2gocnVsZSA9PiB7XG4gICAgICBydWxlLnNvdXJjZXMgPSBydWxlLnNvdXJjZXMgPyBbXS5jb25jYXQocnVsZS5zb3VyY2VzKSA6IFtdO1xuICAgICAgcnVsZS5maWxlcyA9IG5ldyBTZXQoKTtcbiAgICAgIHJ1bGUuZmluYWxpemVyID0gbmV3IEZpbmFsaXplcihjb25maWcudGFyZ2V0RGlyLCBydWxlLnRhcmdldHMpO1xuICAgICAgcnVsZS5wcm9jZXNzb3JzID0gcnVsZS5wcm9jZXNzb3JzIHx8IFtdO1xuICAgICAgcnVsZS5wcm9jZXNzb3JzLmZvckVhY2gocHJvY2Vzc29yID0+IHtcbiAgICAgICAgaWYgKHByb2Nlc3Nvci5wcm9jZXNzICE9PSBQcm9jZXNzb3IucHJvdG90eXBlLnByb2Nlc3MpIHtcbiAgICAgICAgICBVdGlscy5mYXRhbChgJHtwcm9jZXNzb3IuaWR9OiAucHJvY2VzcygpIHNob3VsZG4ndCBiZSBvdmVycmlkZW4uYCk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSk7XG4gICAgcmV0dXJuIGNvbmZpZztcbiAgfVxuXG4gIC8qKlxuICAgKiBNZXJnZSBkZWZhdWx0IGFuZCB1c2VyIGNvbmZpZy5cbiAgICogQHBhcmFtIHthbnl9IGRlZmF1bHRzIERlZmF1bHQgY29uZmlnXG4gICAqIEBwYXJhbSB7YW55fSB1c2VyQ29uZmlnIFVzZXIgY29uZmlnXG4gICAqIEByZXR1cm5zIHtDb25maWd1cmF0aW9ufSBNZXJnZWQgY29uZmlnXG4gICAqL1xuICBwcml2YXRlIG1lcmdlQ29uZmlnKGRlZmF1bHRzOiBhbnksIHVzZXJDb25maWc6IGFueSk6IENvbmZpZ3VyYXRpb24ge1xuICAgIGxldCBmYWxsYmFja1J1bGVzOiBhbnlbXSA9IGRlZmF1bHRzLmZhbGxiYWNrUnVsZXM7XG4gICAgbGV0IHJ1bGVzOiBhbnlbXSA9IHVzZXJDb25maWcucnVsZXMgfHwgW107XG4gICAgbGV0IGNvbmZpZzogQ29uZmlndXJhdGlvbjtcbiAgICBkZWxldGUgZGVmYXVsdHMuZmFsbGJhY2tSdWxlcztcbiAgICBkZWxldGUgdXNlckNvbmZpZy5mYWxsYmFja1J1bGVzO1xuICAgIGNvbmZpZyA9IFV0aWxzLnNoYWxsb3dNZXJnZShkZWZhdWx0cywgdXNlckNvbmZpZyk7XG4gICAgY29uZmlnLnJ1bGVzID0gZmFsbGJhY2tSdWxlcy5jb25jYXQocnVsZXMpO1xuICAgIHJldHVybiBjb25maWc7XG4gIH1cblxuICAvKipcbiAgICogTWF0Y2hlcyBhIGZpbGUgcGF0aCBhZ2FpbnN0IHJ1bGVzIGluIHJldmVyc2VkIG9yZGVyLCByZXR1cm4gdGhlIGZpcnN0IGZvdW5kXG4gICAqIEBwYXJhbSBjb25maWcgQ29uZmlnXG4gICAqIEBwYXJhbSBmaWxlIEZpbGUgdG8gbWF0Y2hcbiAgICogQHJldHVybnMgVGhlIG1hdGNoZWQgcnVsZSwgb3IgdW5kZWZpbmVkIGlmIG5vIG1hdGNoXG4gICAqL1xuICBwcm90ZWN0ZWQgbWF0Y2hSdWxlKGNvbmZpZzogQ29uZmlndXJhdGlvbiwgZmlsZTogc3RyaW5nKTogUnVsZSB7XG4gICAgLy8gVHJhdmVyc2UgaW4gcmV2ZXJzZSBvcmRlciBzbyBsYXRlciBydWxlcyBoYXZlIGhpZ2hlciBwcmlvcml0aWVzXG4gICAgZm9yIChsZXQgaSA9IGNvbmZpZy5ydWxlcy5sZW5ndGggLSAxOyBpID49MDsgLS1pKSB7XG4gICAgICBsZXQgcnVsZSA9IGNvbmZpZy5ydWxlc1tpXTtcbiAgICAgIGlmIChVdGlscy5tYXRjaE9yRXF1YWwoZmlsZSwgcnVsZS5zb3VyY2VzKSkge1xuICAgICAgICByZXR1cm4gcnVsZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2NhbiBzb3VyY2UgZGlyZWN0b3J5LCBnZXQgZnVsbCBtYW5pZmVzdCBvZiBmaWxlcywgYW5kIGFkZCBtYXRjaGVkIGZpbGVzXG4gICAqIHRvIGVhY2ggcnVsZSBpbiBjb25maWcuXG4gICAqIEFsc28gYnVpbGQgbWFwcGluZyBmcm9tIGZpbGUgcGF0aCB0byBtYXRjaGluZyBydWxlLlxuICAgKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIENvbmZpZ1xuICAgKiBAcmV0dXJucyB7QXJyYXl9IFtDb25maWcgd2l0aCBtYXRjaGVkIGZpbGVzLCBmaWxlIHBhdGggdG8gcnVsZSBtYXBwaW5nXVxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBtYXRjaFNvdXJjZUZpbGVzKGNvbmZpZzogQ29uZmlndXJhdGlvbik6IFByb21pc2U8Q29uZmlndXJhdGlvbj4ge1xuICAgIHRoaXMuZmlsZVRvUnVsZSA9IG5ldyBNYXAoKTtcbiAgICAoYXdhaXQgVXRpbHMubGlzdEFsbEZpbGVzKGNvbmZpZy5zb3VyY2VEaXIsIHRydWUpKS5mb3JFYWNoKGZpbGUgPT4ge1xuICAgICAgbGV0IHJ1bGUgPSB0aGlzLm1hdGNoUnVsZShjb25maWcsIGZpbGUpO1xuICAgICAgaWYgKHJ1bGUpIHtcbiAgICAgICAgcnVsZS5maWxlcy5hZGQoZmlsZSk7XG4gICAgICAgIHRoaXMuZmlsZVRvUnVsZS5zZXQoZmlsZSwgcnVsZSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGNvbmZpZztcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25zb2xpZGF0ZSBnbG9iYWwgdmFyaWFibGVzXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByb290RGlyIFByb2plY3QgZGlyZWN0b3J5XG4gICAqIEBwYXJhbSB7c3RyaW5nfSB3b3JrRGlyIFdvcmsgZGlyZWN0b3J5XG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1c2VyRmlsZSBVc2VyIGZpbGUgbmFtZVxuICAgKiBAcGFyYW0ge2FueX0gZGVmYXVsdHMgRGVmYXVsdCBjb25maWdcbiAgICovXG4gIHByaXZhdGUgYXN5bmMgYnVpbGRFbnYocm9vdERpcjogc3RyaW5nLCB3b3JrRGlyOiBzdHJpbmcsIHVzZXJGaWxlOiBzdHJpbmcsIGRlZmF1bHRzOiBhbnkpOiBQcm9taXNlPEVudmlyb25tZW50PiB7XG4gICAgbGV0IHVzZXJGaWxlUGF0aDogc3RyaW5nID0gcGF0aC5yZXNvbHZlKHJvb3REaXIsIHVzZXJGaWxlKTtcbiAgICBsZXQgdXNlckNvbmZpZzogYW55ID0gdGhpcy5nZXRDb25maWcodXNlckZpbGVQYXRoKTtcbiAgICBsZXQgbWVyZ2VkQ29uZmlnOiBDb25maWd1cmF0aW9uID0gdGhpcy5tZXJnZUNvbmZpZyhkZWZhdWx0cywgdXNlckNvbmZpZyk7XG4gICAgbGV0IHNhbml0aXplZENvbmZpZzogQ29uZmlndXJhdGlvbiA9IHRoaXMuc2FuaXRpemVDb25maWcobWVyZ2VkQ29uZmlnLCByb290RGlyKTtcbiAgICBsZXQgY29uZmlnID0gYXdhaXQgdGhpcy5tYXRjaFNvdXJjZUZpbGVzKHNhbml0aXplZENvbmZpZyk7XG5cbiAgICBsZXQgZW52ID0gbmV3IEVudmlyb25tZW50KCk7XG4gICAgZW52LnJvb3REaXIgPSByb290RGlyO1xuICAgIGVudi53b3JrRGlyID0gd29ya0RpcjtcbiAgICBlbnYuc291cmNlRGlyID0gY29uZmlnLnNvdXJjZURpcjtcbiAgICBlbnYudGFyZ2V0RGlyID0gY29uZmlnLnRhcmdldERpcjtcbiAgICBlbnYucmVsYXRpdmVTb3VyY2VEaXIgPSBjb25maWcucmVsYXRpdmVTb3VyY2VEaXI7XG4gICAgZW52LnJlbGF0aXZlVGFyZ2V0RGlyID0gY29uZmlnLnJlbGF0aXZlVGFyZ2V0RGlyO1xuICAgIGVudi51c2VyRmlsZSA9IHVzZXJGaWxlUGF0aDtcbiAgICBlbnYuY29uZmlnID0gY29uZmlnO1xuICAgIFV0aWxzLmRiZygpICYmIFV0aWxzLmRlYnVnKCdFbnZpcm9ubWVudDogJywgVXRpbHMudG9Kc29uKGVudikpO1xuICAgIHJldHVybiBlbnY7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBidWlsZCB0YXJnZXRzXG4gICAqIEByZXR1cm5zIEFycmF5IGZvciB0YXJnZXRzXG4gICAqL1xuICBwcm90ZWN0ZWQgZ2V0QWxsVGFyZ2V0cygpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIFsuLi50aGlzLnJ1bGVUb1RhcmdldHMudmFsdWVzKCldXG4gICAgICAucmVkdWNlKChhbGwsIHBlclJ1bGUpID0+IGFsbC5jb25jYXQocGVyUnVsZSksIFtdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFbnN1cmVzIGEgc3ltbGluayB0byB0aGUgbm9kZV9tb2R1bGVzIGRpciBleGlzdHMgaW4gdGhlIHByb2Nlc3NvciB3b3JrIGRpclxuICAgKiBAcGFyYW0gZGlyIFdvcmsgZGlyIG9mIGEgcHJvY2Vzc29yXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIGVuc3VyZU5vZGVNb2R1bGVzKGRpcjogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IG5wZGlyID0gcGF0aC5yZXNvbHZlKHRoaXMuZW52LnJvb3REaXIsICdub2RlX21vZHVsZXMnKTtcbiAgICBsZXQgc3ltbGluayA9IHBhdGgucmVzb2x2ZShkaXIsICdub2RlX21vZHVsZXMnKTtcbiAgICByZXR1cm4gZnMuZW5zdXJlU3ltbGluayhucGRpciwgc3ltbGluayk7XG4gIH1cblxuICAvKipcbiAgICogSW52b2tlIHByb2Nlc3NvcnMgaW4gYSBydWxlLCBtdXRhdGUgc3RhdGVzXG4gICAqIEBwYXJhbSBydWxlIFJ1bGVcbiAgICogQHBhcmFtIHN0YXRlIFN0YXRlXG4gICAqIEByZXR1cm5zIHRydWUgaWYgYWxsIHByb2Nlc3NvcnMgc3VjY2VlZGVkLCBmYWxzZSBvdGhlcndpc2VcbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBpbnZva2VQcm9jZXNzb3JzKHJ1bGU6IFJ1bGUsIHN0YXRlOiBTdGF0ZSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGxldCBzdWNjZXNzOiBib29sZWFuID0gdHJ1ZTtcbiAgICBmb3IgKGxldCBwcm9jZXNzb3Igb2YgcnVsZS5wcm9jZXNzb3JzKSB7XG4gICAgICBsZXQgaW5wdXQ6IFByb2Nlc3NvcklucHV0ID0gc3RhdGUubmV4dElucHV0KCk7XG4gICAgICBhd2FpdCB0aGlzLmVuc3VyZU5vZGVNb2R1bGVzKHN0YXRlLmN1cnJlbnRDb250ZXh0KCkucm9vdERpcik7XG4gICAgICBsZXQgb3V0cHV0ID0gYXdhaXQgcHJvY2Vzc29yLnByb2Nlc3MoaW5wdXQpO1xuICAgICAgc3RhdGUuc2F2ZU91dHB1dChvdXRwdXQpO1xuICAgICAgc3VjY2VzcyA9IHN1Y2Nlc3MgJiYgIW91dHB1dC5mYWlsdXJlcy5sZW5ndGg7XG4gICAgfVxuICAgIGlmIChydWxlLnByb2Nlc3NvcnMubGVuZ3RoKSB7XG4gICAgICBsZXQgdGFyZ2V0czogc3RyaW5nW10gPSBhd2FpdCBydWxlLmZpbmFsaXplci5maW5hbGl6ZShzdGF0ZS5maW5hbGl6ZXJJbnB1dCgpKTtcbiAgICAgIFV0aWxzLmRiZygpICYmIFV0aWxzLmRlYnVnKGBCdWlsZCBwYXNzZWQgaW4gJHtydWxlLnNvdXJjZXN9OmAsIHRhcmdldHMpO1xuICAgICAgdGhpcy5ydWxlVG9UYXJnZXRzLnNldChydWxlLCB0YXJnZXRzKTtcbiAgICB9XG4gICAgcmV0dXJuIHN1Y2Nlc3M7XG4gIH1cblxuICAvKipcbiAgICogRG8gb25lIHRpbWUgYnVpbGRcbiAgICogQHJldHVybnMgUHJvbWlzZSwgcmVzb2x2ZSB3aGVuIGRvbmUuXG4gICAqL1xuICBhc3luYyBidWlsZCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsZXQgc3VjY2VzczogYm9vbGVhbiA9IHRydWU7XG4gICAgdGhpcy5lbnYgPSBhd2FpdCB0aGlzLmVudlByb21pc2U7XG4gICAgdGhpcy5zdGF0ZXMgPSBhd2FpdCBQcm9taXNlLmFsbCh0aGlzLmVudi5jb25maWcucnVsZXMubWFwKGFzeW5jIHJ1bGUgPT4ge1xuICAgICAgbGV0IHN0YXRlID0gbmV3IHRoaXMuc3RhdGVDbGFzcyh0aGlzLmVudiwgcnVsZSk7XG4gICAgICBpZiAocnVsZS5maWxlcy5zaXplKSB7XG4gICAgICAgIHN0YXRlLmJlZm9yZUJ1aWxkKCk7XG4gICAgICAgIHN1Y2Nlc3MgPSBhd2FpdCB0aGlzLmludm9rZVByb2Nlc3NvcnMocnVsZSwgc3RhdGUpICYmIHN1Y2Nlc3M7XG4gICAgICAgIHN0YXRlLmFmdGVyQnVpbGQoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdGF0ZTtcbiAgICB9KSk7XG4gICAgbGV0IHRhcmdldHM6IHN0cmluZ1tdID0gdGhpcy5nZXRBbGxUYXJnZXRzKCk7XG4gICAgVXRpbHMuZGJnKCkgJiYgVXRpbHMuZGVidWcoYCR7dGhpcy5uYW1lfTogRmluYWwgdGFyZ2V0c2AsIHRhcmdldHMpO1xuXG4gICAgcmV0dXJuIFV0aWxzLmNsZWFuRGlyZWN0b3J5KHRoaXMuZW52LnRhcmdldERpciwgdGFyZ2V0cylcbiAgICAgIC50aGVuKCgpID0+IFV0aWxzLmluZm8oYEJ1aWxkICR7c3VjY2VzcyA/ICdTVUNDRVNTJyA6ICdGQUlMRUQnfWApKVxuICAgICAgLmNhdGNoKGV4ID0+IFV0aWxzLmVycm9yKGBFcnJvciBoYXBwZW5lZCBkdXJpbmcgY2xlYW51cGAsIGV4KSk7XG4gIH1cblxuICBleGl0KCk6IHZvaWQge1xuICB9XG59XG4iXX0=