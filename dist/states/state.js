"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const utils_1 = require("~/utils");
const state_models_1 = require("~/models/state-models");
const processor_models_1 = require("~/models/processor-models");
class State {
    constructor(env, rule) {
        this.env = env;
        this.rule = rule;
        this.name = this.constructor.name;
        /**
         * @see {@link Context}
         */
        this.contexts = [];
        utils_1.Utils.dbg() && utils_1.Utils.debug(`${this.name} [${this.rule.sources}] created.`);
    }
    getRule() {
        return this.rule;
    }
    /**
     * Convert given paths to relative paths, ignore those not under sourceDir
     * @param sourceDir Parent path
     * @param paths List of paths
     * @returns Relative paths
     */
    static toRelativePaths(sourceDir, paths) {
        return new Set([...paths]
            .map(p => {
            p = utils_1.Utils.getLocalPath(p);
            if (p) {
                if (!path.isAbsolute(p))
                    return p;
                if (p.startsWith(`${sourceDir}/`))
                    return path.relative(sourceDir, p);
            }
            return undefined;
        })
            .filter(p => p !== undefined));
    }
    /**
     * Find targets imported by another target, therefore should be excluded from
     * input of next processor
     * @param tts targetToSources mapping
     * @returns A set of files included by other files
     */
    static getImportedTargets(tts) {
        let importedTargets = new Set();
        let allTargets = [...tts.keys()];
        for (let i = 0; i < allTargets.length - 1; ++i) {
            for (let j = i + 1; j < allTargets.length; ++j) {
                let t1 = allTargets[i], t2 = allTargets[j];
                let s1 = tts.get(t1), s2 = tts.get(t2);
                let common = utils_1.Utils.intersection(s1, s2);
                if (s1.size === common.size && s2.size === common.size) {
                    // Impossible case
                    throw `Files (even paths) are identical? ${t1} ${s1} : ${t2} ${s2}`;
                }
                else if (s1.size === common.size) {
                    importedTargets.add(t1);
                    break; // No need to continue as t1 itself is fully contained
                }
                else if (s2.size === common.size) {
                    importedTargets.add(t2);
                }
            }
        }
        return importedTargets;
    }
    beforeBuild(task = undefined) {
    }
    afterBuild() {
    }
    nextRootDir() {
        return utils_1.Utils.tmpPath(this.env.workDir);
    }
    /**
     * Generate input for the next processor call. Input element structure:
     * {
     *   source: "path to the source file (target file from the last processor)",
     *   target: "path to the target file, processor should write to here",
     *   shouldCompile: <boolean>, whether if the file requires re-compiled
     * }
     * @param {Object} context Context of current step
     * @param {string} relPath Relative path of the source file
     */
    processorInput(context, relPath) {
        return new processor_models_1.ProcessorInputEntry(path.resolve(context.sourceDir, relPath), path.resolve(context.workDir, relPath), true);
    }
    /**
     * Generate input for the next processor call.
     * Files in the input must be ordered in insertion order so that eventually
     * in Finalizer, when files get merged, they are in the same order as
     * in input.
     * @returns {ProcessorInput} Input for the next processor call.
     */
    nextInput() {
        let nextRootDir = this.nextRootDir();
        let input;
        let nextContext = new state_models_1.Context({
            rootDir: nextRootDir,
            workDir: path.resolve(nextRootDir, this.env.relativeSourceDir),
            index: this.contexts.length
        });
        if (!this.contexts.length) {
            nextContext.sourceDir = this.env.sourceDir;
            input = new processor_models_1.ProcessorInput(nextContext.sourceDir, nextContext.workDir);
            this.rule.files.forEach(file => input.add(this.processorInput(nextContext, file)));
        }
        else {
            let prevContext = utils_1.Utils.lastElement(this.contexts);
            nextContext.sourceDir = prevContext.workDir;
            input = new processor_models_1.ProcessorInput(nextContext.sourceDir, nextContext.workDir);
            for (let [target, entry] of prevContext.output.targetEntries()) {
                if (entry.imported) {
                    utils_1.Utils.dbg() && utils_1.Utils.debug(`Skipping imported file: ${entry.target}`);
                }
                else {
                    input.add(this.processorInput(nextContext, target));
                }
            }
        }
        this.contexts.push(nextContext);
        return nextContext.input = input;
    }
    /**
     * Generate input for Finalizer
     * @returns {FinalizerInput} Input for Finalizer
     */
    finalizerInput() {
        let context = utils_1.Utils.lastElement(this.contexts);
        let input = new processor_models_1.FinalizerInput(context.workDir);
        for (let entry of context.output.values()) {
            if (entry.imported) {
                utils_1.Utils.dbg() && utils_1.Utils.debug(`Skipping imported file: ${entry.target}`);
            }
            else {
                input.add(entry.target);
            }
        }
        return input;
    }
    /**
     * Transform processor output and save it into context.
     * @param output Results returned by processor.
     */
    saveOutput(output) {
        let context = utils_1.Utils.lastElement(this.contexts);
        context.output = output;
        if (utils_1.Utils.dbg())
            utils_1.Utils.debug(`${this.name}: Output`, context.output);
        this.handleFailures(context.output.failures);
        let tts = new state_models_1.TargetToSources();
        for (let [target, entry] of context.output.targetEntries()) {
            // Convert included file paths to relative path
            tts.set(target, State.toRelativePaths(context.sourceDir, entry.contains));
        }
        // In the next step, imported files should be skipped.
        let imported = State.getImportedTargets(tts);
        utils_1.Utils.dbg() && utils_1.Utils.debug('Imported files will be excluded from next processor:', imported);
        imported.forEach(target => context.output.getByTarget(target).imported = true);
        // TODO: This is a hack, IncrementalState needs this to map to do
        // its own calculation, we saved it in context to avoid duplicated
        // processing in IncrementalState. Base State doesn't need it saved.
        context.targetToSources = tts;
    }
    handleFailures(failures) {
        // Doesn't seem there is anything need to be done yet, failure should
        // recover organically.
    }
    currentContext() {
        return utils_1.Utils.lastElement(this.contexts);
    }
}
exports.State = State;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RhdGVzL3N0YXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsNkJBQTZCO0FBQzdCLG1DQUFnQztBQUVoQyx3REFBaUU7QUFDakUsZ0VBQWdIO0FBRWhIO0lBTUUsWUFBWSxHQUFnQixFQUFFLElBQVU7UUFDdEMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO1FBRWxDOztXQUVHO1FBQ0gsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFFbkIsYUFBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLGFBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxZQUFZLENBQUMsQ0FBQztJQUM3RSxDQUFDO0lBRUQsT0FBTztRQUNMLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQ25CLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNLLE1BQU0sQ0FBQyxlQUFlLENBQUMsU0FBaUIsRUFBRSxLQUFrQjtRQUNsRSxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQzthQUN0QixHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDUCxDQUFDLEdBQUcsYUFBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNOLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNsQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMs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b0U7UUFDcEUsT0FBTyxDQUFDLGVBQWUsR0FBRyxHQUFHLENBQUM7SUFDaEMsQ0FBQztJQUVTLGNBQWMsQ0FBQyxRQUFrQjtRQUN6QyxxRUFBcUU7UUFDckUsdUJBQXVCO0lBQ3pCLENBQUM7SUFFRCxjQUFjO1FBQ1osTUFBTSxDQUFDLGFBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzFDLENBQUM7Q0FDRjtBQS9MRCxzQkErTEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgVXRpbHMgfSBmcm9tICd+L3V0aWxzJztcbmltcG9ydCB7IEVudmlyb25tZW50LCBSdWxlLCBUYXNrIH0gZnJvbSAnfi9tb2RlbHMvYnVpbGRlci1tb2RlbHMnO1xuaW1wb3J0IHsgQ29udGV4dCwgVGFyZ2V0VG9Tb3VyY2VzIH0gZnJvbSAnfi9tb2RlbHMvc3RhdGUtbW9kZWxzJztcbmltcG9ydCB7IEZpbmFsaXplcklucHV0LFByb2Nlc3NvcklucHV0LCBQcm9jZXNzb3JJbnB1dEVudHJ5LCBQcm9jZXNzb3JPdXRwdXQgfSBmcm9tICd+L21vZGVscy9wcm9jZXNzb3ItbW9kZWxzJztcblxuZXhwb3J0IGNsYXNzIFN0YXRlIHtcbiAgcHJvdGVjdGVkIGVudjogRW52aXJvbm1lbnQ7XG4gIHByb3RlY3RlZCBydWxlOiBSdWxlO1xuICBwcm90ZWN0ZWQgbmFtZTogc3RyaW5nO1xuICBwcm90ZWN0ZWQgY29udGV4dHM6IENvbnRleHRbXTtcblxuICBjb25zdHJ1Y3RvcihlbnY6IEVudmlyb25tZW50LCBydWxlOiBSdWxlKSB7XG4gICAgdGhpcy5lbnYgPSBlbnY7XG4gICAgdGhpcy5ydWxlID0gcnVsZTtcbiAgICB0aGlzLm5hbWUgPSB0aGlzLmNvbnN0cnVjdG9yLm5hbWU7XG5cbiAgICAvKipcbiAgICAgKiBAc2VlIHtAbGluayBDb250ZXh0fVxuICAgICAqL1xuICAgIHRoaXMuY29udGV4dHMgPSBbXTtcblxuICAgIFV0aWxzLmRiZygpICYmIFV0aWxzLmRlYnVnKGAke3RoaXMubmFtZX0gWyR7dGhpcy5ydWxlLnNvdXJjZXN9XSBjcmVhdGVkLmApO1xuICB9XG5cbiAgZ2V0UnVsZSgpOiBSdWxlIHtcbiAgICByZXR1cm4gdGhpcy5ydWxlO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgZ2l2ZW4gcGF0aHMgdG8gcmVsYXRpdmUgcGF0aHMsIGlnbm9yZSB0aG9zZSBub3QgdW5kZXIgc291cmNlRGlyXG4gICAqIEBwYXJhbSBzb3VyY2VEaXIgUGFyZW50IHBhdGhcbiAgICogQHBhcmFtIHBhdGhzIExpc3Qgb2YgcGF0aHNcbiAgICogQHJldHVybnMgUmVsYXRpdmUgcGF0aHNcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIHRvUmVsYXRpdmVQYXRocyhzb3VyY2VEaXI6IHN0cmluZywgcGF0aHM6IFNldDxzdHJpbmc+KTogU2V0PHN0cmluZz4ge1xuICAgIHJldHVybiBuZXcgU2V0KFsuLi5wYXRoc11cbiAgICAgIC5tYXAocCA9PiB7XG4gICAgICAgIHAgPSBVdGlscy5nZXRMb2NhbFBhdGgocCk7XG4gICAgICAgIGlmIChwKSB7XG4gICAgICAgICAgaWYgKCFwYXRoLmlzQWJzb2x1dGUocCkpIHJldHVybiBwO1xuICAgICAgICAgIGlmIChwLnN0YXJ0c1dpdGgoYCR7c291cmNlRGlyfS9gKSkgcmV0dXJuIHBhdGgucmVsYXRpdmUoc291cmNlRGlyLCBwKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfSlcbiAgICAgIC5maWx0ZXIocCA9PiBwICE9PSB1bmRlZmluZWQpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kIHRhcmdldHMgaW1wb3J0ZWQgYnkgYW5vdGhlciB0YXJnZXQsIHRoZXJlZm9yZSBzaG91bGQgYmUgZXhjbHVkZWQgZnJvbVxuICAgKiBpbnB1dCBvZiBuZXh0IHByb2Nlc3NvclxuICAgKiBAcGFyYW0gdHRzIHRhcmdldFRvU291cmNlcyBtYXBwaW5nXG4gICAqIEByZXR1cm5zIEEgc2V0IG9mIGZpbGVzIGluY2x1ZGVkIGJ5IG90aGVyIGZpbGVzXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBnZXRJbXBvcnRlZFRhcmdldHModHRzOiBUYXJnZXRUb1NvdXJjZXMpOiBTZXQ8c3RyaW5nPiB7XG4gICAgbGV0IGltcG9ydGVkVGFyZ2V0czogU2V0PHN0cmluZz4gPSBuZXcgU2V0KCk7XG4gICAgbGV0IGFsbFRhcmdldHMgPSBbLi4udHRzLmtleXMoKV07XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhbGxUYXJnZXRzLmxlbmd0aCAtIDE7ICsraSkge1xuICAgICAgZm9yIChsZXQgaiA9IGkgKyAxOyBqIDwgYWxsVGFyZ2V0cy5sZW5ndGg7ICsraikge1xuICAgICAgICBsZXQgdDEgPSBhbGxUYXJnZXRzW2ldLCB0MiA9IGFsbFRhcmdldHNbal07XG4gICAgICAgIGxldCBzMSA9IHR0cy5nZXQodDEpLCBzMiA9IHR0cy5nZXQodDIpO1xuICAgICAgICBsZXQgY29tbW9uID0gVXRpbHMuaW50ZXJzZWN0aW9uKHMxLCBzMik7XG4gICAgICAgIGlmIChzMS5zaXplID09PSBjb21tb24uc2l6ZSAmJiBzMi5zaXplID09PSBjb21tb24uc2l6ZSkge1xuICAgICAgICAgIC8vIEltcG9zc2libGUgY2FzZVxuICAgICAgICAgIHRocm93IGBGaWxlcyAoZXZlbiBwYXRocykgYXJlIGlkZW50aWNhbD8gJHt0MX0gJHtzMX0gOiAke3QyfSAke3MyfWA7XG4gICAgICAgIH0gZWxzZSBpZiAoczEuc2l6ZSA9PT0gY29tbW9uLnNpemUpIHtcbiAgICAgICAgICBpbXBvcnRlZFRhcmdldHMuYWRkKHQxKTtcbiAgICAgICAgICBicmVhazsgLy8gTm8gbmVlZCB0byBjb250aW51ZSBhcyB0MSBpdHNlbGYgaXMgZnVsbHkgY29udGFpbmVkXG4gICAgICAgIH0gZWxzZSBpZiAoczIuc2l6ZSA9PT0gY29tbW9uLnNpemUpIHtcbiAgICAgICAgICBpbXBvcnRlZFRhcmdldHMuYWRkKHQyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaW1wb3J0ZWRUYXJnZXRzO1xuICB9XG5cbiAgYmVmb3JlQnVpbGQodGFzazogVGFzayA9IHVuZGVmaW5lZCk6IHZvaWQge1xuICB9XG5cbiAgYWZ0ZXJCdWlsZCgpOiB2b2lkIHtcbiAgfVxuXG4gIHByb3RlY3RlZCBuZXh0Um9vdERpcigpOiBzdHJpbmcge1xuICAgIHJldHVybiBVdGlscy50bXBQYXRoKHRoaXMuZW52LndvcmtEaXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGlucHV0IGZvciB0aGUgbmV4dCBwcm9jZXNzb3IgY2FsbC4gSW5wdXQgZWxlbWVudCBzdHJ1Y3R1cmU6XG4gICAqIHtcbiAgICogICBzb3VyY2U6IFwicGF0aCB0byB0aGUgc291cmNlIGZpbGUgKHRhcmdldCBmaWxlIGZyb20gdGhlIGxhc3QgcHJvY2Vzc29yKVwiLFxuICAgKiAgIHRhcmdldDogXCJwYXRoIHRvIHRoZSB0YXJnZXQgZmlsZSwgcHJvY2Vzc29yIHNob3VsZCB3cml0ZSB0byBoZXJlXCIsXG4gICAqICAgc2hvdWxkQ29tcGlsZTogPGJvb2xlYW4+LCB3aGV0aGVyIGlmIHRoZSBmaWxlIHJlcXVpcmVzIHJlLWNvbXBpbGVkXG4gICAqIH1cbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHQgQ29udGV4dCBvZiBjdXJyZW50IHN0ZXBcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbFBhdGggUmVsYXRpdmUgcGF0aCBvZiB0aGUgc291cmNlIGZpbGVcbiAgICovXG4gIHByb3RlY3RlZCBwcm9jZXNzb3JJbnB1dChjb250ZXh0OiBDb250ZXh0LCByZWxQYXRoOiBzdHJpbmcpOiBQcm9jZXNzb3JJbnB1dEVudHJ5IHtcbiAgICByZXR1cm4gbmV3IFByb2Nlc3NvcklucHV0RW50cnkoXG4gICAgICBwYXRoLnJlc29sdmUoY29udGV4dC5zb3VyY2VEaXIsIHJlbFBhdGgpLFxuICAgICAgcGF0aC5yZXNvbHZlKGNvbnRleHQud29ya0RpciwgcmVsUGF0aCksXG4gICAgICB0cnVlXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBpbnB1dCBmb3IgdGhlIG5leHQgcHJvY2Vzc29yIGNhbGwuXG4gICAqIEZpbGVzIGluIHRoZSBpbnB1dCBtdXN0IGJlIG9yZGVyZWQgaW4gaW5zZXJ0aW9uIG9yZGVyIHNvIHRoYXQgZXZlbnR1YWxseVxuICAgKiBpbiBGaW5hbGl6ZXIsIHdoZW4gZmlsZXMgZ2V0IG1lcmdlZCwgdGhleSBhcmUgaW4gdGhlIHNhbWUgb3JkZXIgYXNcbiAgICogaW4gaW5wdXQuXG4gICAqIEByZXR1cm5zIHtQcm9jZXNzb3JJbnB1dH0gSW5wdXQgZm9yIHRoZSBuZXh0IHByb2Nlc3NvciBjYWxsLlxuICAgKi9cbiAgbmV4dElucHV0KCk6IFByb2Nlc3NvcklucHV0IHtcbiAgICBsZXQgbmV4dFJvb3REaXIgPSB0aGlzLm5leHRSb290RGlyKCk7XG4gICAgbGV0IGlucHV0OiBQcm9jZXNzb3JJbnB1dDtcbiAgICBsZXQgbmV4dENvbnRleHQgPSBuZXcgQ29udGV4dCh7XG4gICAgICByb290RGlyOiBuZXh0Um9vdERpcixcbiAgICAgIHdvcmtEaXI6IHBhdGgucmVzb2x2ZShuZXh0Um9vdERpciwgdGhpcy5lbnYucmVsYXRpdmVTb3VyY2VEaXIpLFxuICAgICAgaW5kZXg6IHRoaXMuY29udGV4dHMubGVuZ3RoXG4gICAgfSk7XG4gICAgaWYgKCF0aGlzLmNvbnRleHRzLmxlbmd0aCkge1xuICAgICAgbmV4dENvbnRleHQuc291cmNlRGlyID0gdGhpcy5lbnYuc291cmNlRGlyO1xuICAgICAgaW5wdXQgPSBuZXcgUHJvY2Vzc29ySW5wdXQobmV4dENvbnRleHQuc291cmNlRGlyLCBuZXh0Q29udGV4dC53b3JrRGlyKTtcbiAgICAgIHRoaXMucnVsZS5maWxlcy5mb3JFYWNoKGZpbGUgPT5cbiAgICAgICAgaW5wdXQuYWRkKHRoaXMucHJvY2Vzc29ySW5wdXQobmV4dENvbnRleHQsIGZpbGUpKVxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHByZXZDb250ZXh0ID0gVXRpbHMubGFzdEVsZW1lbnQodGhpcy5jb250ZXh0cyk7XG4gICAgICBuZXh0Q29udGV4dC5zb3VyY2VEaXIgPSBwcmV2Q29udGV4dC53b3JrRGlyO1xuICAgICAgaW5wdXQgPSBuZXcgUHJvY2Vzc29ySW5wdXQobmV4dENvbnRleHQuc291cmNlRGlyLCBuZXh0Q29udGV4dC53b3JrRGlyKTtcbiAgICAgIGZvciAobGV0IFt0YXJnZXQsIGVudHJ5XSBvZiBwcmV2Q29udGV4dC5vdXRwdXQudGFyZ2V0RW50cmllcygpKSB7XG4gICAgICAgIGlmIChlbnRyeS5pbXBvcnRlZCkge1xuICAgICAgICAgIFV0aWxzLmRiZygpICYmIFV0aWxzLmRlYnVnKGBTa2lwcGluZyBpbXBvcnRlZCBmaWxlOiAke2VudHJ5LnRhcmdldH1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpbnB1dC5hZGQodGhpcy5wcm9jZXNzb3JJbnB1dChuZXh0Q29udGV4dCwgdGFyZ2V0KSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmNvbnRleHRzLnB1c2gobmV4dENvbnRleHQpO1xuICAgIHJldHVybiBuZXh0Q29udGV4dC5pbnB1dCA9IGlucHV0O1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGlucHV0IGZvciBGaW5hbGl6ZXJcbiAgICogQHJldHVybnMge0ZpbmFsaXplcklucHV0fSBJbnB1dCBmb3IgRmluYWxpemVyXG4gICAqL1xuICBmaW5hbGl6ZXJJbnB1dCgpOiBGaW5hbGl6ZXJJbnB1dCB7XG4gICAgbGV0IGNvbnRleHQgPSBVdGlscy5sYXN0RWxlbWVudCh0aGlzLmNvbnRleHRzKTtcbiAgICBsZXQgaW5wdXQgPSBuZXcgRmluYWxpemVySW5wdXQoY29udGV4dC53b3JrRGlyKTtcbiAgICBmb3IgKGxldCBlbnRyeSBvZiBjb250ZXh0Lm91dHB1dC52YWx1ZXMoKSkge1xuICAgICAgaWYgKGVudHJ5LmltcG9ydGVkKSB7XG4gICAgICAgIFV0aWxzLmRiZygpICYmIFV0aWxzLmRlYnVnKGBTa2lwcGluZyBpbXBvcnRlZCBmaWxlOiAke2VudHJ5LnRhcmdldH1gKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlucHV0LmFkZChlbnRyeS50YXJnZXQpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaW5wdXQ7XG4gIH1cblxuICAvKipcbiAgICogVHJhbnNmb3JtIHByb2Nlc3NvciBvdXRwdXQgYW5kIHNhdmUgaXQgaW50byBjb250ZXh0LlxuICAgKiBAcGFyYW0gb3V0cHV0IFJlc3VsdHMgcmV0dXJuZWQgYnkgcHJvY2Vzc29yLlxuICAgKi9cbiAgc2F2ZU91dHB1dChvdXRwdXQ6IFByb2Nlc3Nvck91dHB1dCk6IHZvaWQge1xuICAgIGxldCBjb250ZXh0ID0gVXRpbHMubGFzdEVsZW1lbnQodGhpcy5jb250ZXh0cyk7XG4gICAgY29udGV4dC5vdXRwdXQgPSBvdXRwdXQ7XG4gICAgaWYgKFV0aWxzLmRiZygpKSBVdGlscy5kZWJ1ZyhgJHt0aGlzLm5hbWV9OiBPdXRwdXRgLCBjb250ZXh0Lm91dHB1dCk7XG5cbiAgICB0aGlzLmhhbmRsZUZhaWx1cmVzKGNvbnRleHQub3V0cHV0LmZhaWx1cmVzKTtcblxuICAgIGxldCB0dHMgPSBuZXcgVGFyZ2V0VG9Tb3VyY2VzKCk7XG4gICAgZm9yIChsZXQgW3RhcmdldCwgZW50cnldIG9mIGNvbnRleHQub3V0cHV0LnRhcmdldEVudHJpZXMoKSkge1xuICAgICAgLy8gQ29udmVydCBpbmNsdWRlZCBmaWxlIHBhdGhzIHRvIHJlbGF0aXZlIHBhdGhcbiAgICAgIHR0cy5zZXQodGFyZ2V0LCBTdGF0ZS50b1JlbGF0aXZlUGF0aHMoY29udGV4dC5zb3VyY2VEaXIsIGVudHJ5LmNvbnRhaW5zKSk7XG4gICAgfVxuXG4gICAgLy8gSW4gdGhlIG5leHQgc3RlcCwgaW1wb3J0ZWQgZmlsZXMgc2hvdWxkIGJlIHNraXBwZWQuXG4gICAgbGV0IGltcG9ydGVkID0gU3RhdGUuZ2V0SW1wb3J0ZWRUYXJnZXRzKHR0cyk7XG4gICAgVXRpbHMuZGJnKCkgJiYgVXRpbHMuZGVidWcoJ0ltcG9ydGVkIGZpbGVzIHdpbGwgYmUgZXhjbHVkZWQgZnJvbSBuZXh0IHByb2Nlc3NvcjonLCBpbXBvcnRlZCk7XG4gICAgaW1wb3J0ZWQuZm9yRWFjaCh0YXJnZXQgPT5cbiAgICAgIGNvbnRleHQub3V0cHV0LmdldEJ5VGFyZ2V0KHRhcmdldCkuaW1wb3J0ZWQgPSB0cnVlXG4gICAgKTtcblxuICAgIC8vIFRPRE86IFRoaXMgaXMgYSBoYWNrLCBJbmNyZW1lbnRhbFN0YXRlIG5lZWRzIHRoaXMgdG8gbWFwIHRvIGRvXG4gICAgLy8gaXRzIG93biBjYWxjdWxhdGlvbiwgd2Ugc2F2ZWQgaXQgaW4gY29udGV4dCB0byBhdm9pZCBkdXBsaWNhdGVkXG4gICAgLy8gcHJvY2Vzc2luZyBpbiBJbmNyZW1lbnRhbFN0YXRlLiBCYXNlIFN0YXRlIGRvZXNuJ3QgbmVlZCBpdCBzYXZlZC5cbiAgICBjb250ZXh0LnRhcmdldFRvU291cmNlcyA9IHR0cztcbiAgfVxuXG4gIHByb3RlY3RlZCBoYW5kbGVGYWlsdXJlcyhmYWlsdXJlczogc3RyaW5nW10pOiB2b2lkIHtcbiAgICAvLyBEb2Vzbid0IHNlZW0gdGhlcmUgaXMgYW55dGhpbmcgbmVlZCB0byBiZSBkb25lIHlldCwgZmFpbHVyZSBzaG91bGRcbiAgICAvLyByZWNvdmVyIG9yZ2FuaWNhbGx5LlxuICB9XG5cbiAgY3VycmVudENvbnRleHQoKTogQ29udGV4dCB7XG4gICAgcmV0dXJuIFV0aWxzLmxhc3RFbGVtZW50KHRoaXMuY29udGV4dHMpO1xuICB9XG59Il19