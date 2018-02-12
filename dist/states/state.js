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
        let input = new processor_models_1.FinalizerInput();
        let context = utils_1.Utils.lastElement(this.contexts);
        for (let entry of context.output.values()) {
            if (entry.imported) {
                utils_1.Utils.dbg() && utils_1.Utils.debug(`Skipping imported file: ${entry.target}`);
            }
            else {
                input.add(entry.target);
            }
        }
        input.sourceDir = context.workDir;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RhdGVzL3N0YXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsNkJBQTZCO0FBQzdCLG1DQUFnQztBQUVoQyx3REFBaUU7QUFDakUsZ0VBQWdIO0FBRWhIO0lBTUUsWUFBWSxHQUFnQixFQUFFLElBQVU7UUFDdEMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO1FBRWxDOztXQUVHO1FBQ0gsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFFbkIsYUFBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLGFBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxZQUFZLENBQUMsQ0FBQztJQUM3RSxDQUFDO0lBRUQsT0FBTztRQUNMLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQ25CLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNLLE1BQU0sQ0FBQyxlQUFlLENBQUMsU0FBaUIsRUFBRSxLQUFrQjtRQUNsRSxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQzthQUN0QixHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDUCxDQUFDLEdBQUcsYUFBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNOLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNsQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMs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aUU7UUFDakUsa0VBQWtFO1FBQ2xFLG9FQUFvRTtRQUNwRSxPQUFPLENBQUMsZUFBZSxHQUFHLEdBQUcsQ0FBQztJQUNoQyxDQUFDO0lBRVMsY0FBYyxDQUFDLFFBQWtCO1FBQ3pDLHFFQUFxRTtRQUNyRSx1QkFBdUI7SUFDekIsQ0FBQztJQUVELGNBQWM7UUFDWixNQUFNLENBQUMsYUFBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDMUMsQ0FBQztDQUNGO0FBaE1ELHNCQWdNQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBVdGlscyB9IGZyb20gJ34vdXRpbHMnO1xuaW1wb3J0IHsgRW52aXJvbm1lbnQsIFJ1bGUsIFRhc2sgfSBmcm9tICd+L21vZGVscy9idWlsZGVyLW1vZGVscyc7XG5pbXBvcnQgeyBDb250ZXh0LCBUYXJnZXRUb1NvdXJjZXMgfSBmcm9tICd+L21vZGVscy9zdGF0ZS1tb2RlbHMnO1xuaW1wb3J0IHsgRmluYWxpemVySW5wdXQsUHJvY2Vzc29ySW5wdXQsIFByb2Nlc3NvcklucHV0RW50cnksIFByb2Nlc3Nvck91dHB1dCB9IGZyb20gJ34vbW9kZWxzL3Byb2Nlc3Nvci1tb2RlbHMnO1xuXG5leHBvcnQgY2xhc3MgU3RhdGUge1xuICBwcm90ZWN0ZWQgZW52OiBFbnZpcm9ubWVudDtcbiAgcHJvdGVjdGVkIHJ1bGU6IFJ1bGU7XG4gIHByb3RlY3RlZCBuYW1lOiBzdHJpbmc7XG4gIHByb3RlY3RlZCBjb250ZXh0czogQ29udGV4dFtdO1xuXG4gIGNvbnN0cnVjdG9yKGVudjogRW52aXJvbm1lbnQsIHJ1bGU6IFJ1bGUpIHtcbiAgICB0aGlzLmVudiA9IGVudjtcbiAgICB0aGlzLnJ1bGUgPSBydWxlO1xuICAgIHRoaXMubmFtZSA9IHRoaXMuY29uc3RydWN0b3IubmFtZTtcblxuICAgIC8qKlxuICAgICAqIEBzZWUge0BsaW5rIENvbnRleHR9XG4gICAgICovXG4gICAgdGhpcy5jb250ZXh0cyA9IFtdO1xuXG4gICAgVXRpbHMuZGJnKCkgJiYgVXRpbHMuZGVidWcoYCR7dGhpcy5uYW1lfSBbJHt0aGlzLnJ1bGUuc291cmNlc31dIGNyZWF0ZWQuYCk7XG4gIH1cblxuICBnZXRSdWxlKCk6IFJ1bGUge1xuICAgIHJldHVybiB0aGlzLnJ1bGU7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCBnaXZlbiBwYXRocyB0byByZWxhdGl2ZSBwYXRocywgaWdub3JlIHRob3NlIG5vdCB1bmRlciBzb3VyY2VEaXJcbiAgICogQHBhcmFtIHNvdXJjZURpciBQYXJlbnQgcGF0aFxuICAgKiBAcGFyYW0gcGF0aHMgTGlzdCBvZiBwYXRoc1xuICAgKiBAcmV0dXJucyBSZWxhdGl2ZSBwYXRoc1xuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgdG9SZWxhdGl2ZVBhdGhzKHNvdXJjZURpcjogc3RyaW5nLCBwYXRoczogU2V0PHN0cmluZz4pOiBTZXQ8c3RyaW5nPiB7XG4gICAgcmV0dXJuIG5ldyBTZXQoWy4uLnBhdGhzXVxuICAgICAgLm1hcChwID0+IHtcbiAgICAgICAgcCA9IFV0aWxzLmdldExvY2FsUGF0aChwKTtcbiAgICAgICAgaWYgKHApIHtcbiAgICAgICAgICBpZiAoIXBhdGguaXNBYnNvbHV0ZShwKSkgcmV0dXJuIHA7XG4gICAgICAgICAgaWYgKHAuc3RhcnRzV2l0aChgJHtzb3VyY2VEaXJ9L2ApKSByZXR1cm4gcGF0aC5yZWxhdGl2ZShzb3VyY2VEaXIsIHApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9KVxuICAgICAgLmZpbHRlcihwID0+IHAgIT09IHVuZGVmaW5lZClcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmQgdGFyZ2V0cyBpbXBvcnRlZCBieSBhbm90aGVyIHRhcmdldCwgdGhlcmVmb3JlIHNob3VsZCBiZSBleGNsdWRlZCBmcm9tXG4gICAqIGlucHV0IG9mIG5leHQgcHJvY2Vzc29yXG4gICAqIEBwYXJhbSB0dHMgdGFyZ2V0VG9Tb3VyY2VzIG1hcHBpbmdcbiAgICogQHJldHVybnMgQSBzZXQgb2YgZmlsZXMgaW5jbHVkZWQgYnkgb3RoZXIgZmlsZXNcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGdldEltcG9ydGVkVGFyZ2V0cyh0dHM6IFRhcmdldFRvU291cmNlcyk6IFNldDxzdHJpbmc+IHtcbiAgICBsZXQgaW1wb3J0ZWRUYXJnZXRzOiBTZXQ8c3RyaW5nPiA9IG5ldyBTZXQoKTtcbiAgICBsZXQgYWxsVGFyZ2V0cyA9IFsuLi50dHMua2V5cygpXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFsbFRhcmdldHMubGVuZ3RoIC0gMTsgKytpKSB7XG4gICAgICBmb3IgKGxldCBqID0gaSArIDE7IGogPCBhbGxUYXJnZXRzLmxlbmd0aDsgKytqKSB7XG4gICAgICAgIGxldCB0MSA9IGFsbFRhcmdldHNbaV0sIHQyID0gYWxsVGFyZ2V0c1tqXTtcbiAgICAgICAgbGV0IHMxID0gdHRzLmdldCh0MSksIHMyID0gdHRzLmdldCh0Mik7XG4gICAgICAgIGxldCBjb21tb24gPSBVdGlscy5pbnRlcnNlY3Rpb24oczEsIHMyKTtcbiAgICAgICAgaWYgKHMxLnNpemUgPT09IGNvbW1vbi5zaXplICYmIHMyLnNpemUgPT09IGNvbW1vbi5zaXplKSB7XG4gICAgICAgICAgLy8gSW1wb3NzaWJsZSBjYXNlXG4gICAgICAgICAgdGhyb3cgYEZpbGVzIChldmVuIHBhdGhzKSBhcmUgaWRlbnRpY2FsPyAke3QxfSAke3MxfSA6ICR7dDJ9ICR7czJ9YDtcbiAgICAgICAgfSBlbHNlIGlmIChzMS5zaXplID09PSBjb21tb24uc2l6ZSkge1xuICAgICAgICAgIGltcG9ydGVkVGFyZ2V0cy5hZGQodDEpO1xuICAgICAgICAgIGJyZWFrOyAvLyBObyBuZWVkIHRvIGNvbnRpbnVlIGFzIHQxIGl0c2VsZiBpcyBmdWxseSBjb250YWluZWRcbiAgICAgICAgfSBlbHNlIGlmIChzMi5zaXplID09PSBjb21tb24uc2l6ZSkge1xuICAgICAgICAgIGltcG9ydGVkVGFyZ2V0cy5hZGQodDIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBpbXBvcnRlZFRhcmdldHM7XG4gIH1cblxuICBiZWZvcmVCdWlsZCh0YXNrOiBUYXNrID0gdW5kZWZpbmVkKTogdm9pZCB7XG4gIH1cblxuICBhZnRlckJ1aWxkKCk6IHZvaWQge1xuICB9XG5cbiAgcHJvdGVjdGVkIG5leHRSb290RGlyKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIFV0aWxzLnRtcFBhdGgodGhpcy5lbnYud29ya0Rpcik7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgaW5wdXQgZm9yIHRoZSBuZXh0IHByb2Nlc3NvciBjYWxsLiBJbnB1dCBlbGVtZW50IHN0cnVjdHVyZTpcbiAgICoge1xuICAgKiAgIHNvdXJjZTogXCJwYXRoIHRvIHRoZSBzb3VyY2UgZmlsZSAodGFyZ2V0IGZpbGUgZnJvbSB0aGUgbGFzdCBwcm9jZXNzb3IpXCIsXG4gICAqICAgdGFyZ2V0OiBcInBhdGggdG8gdGhlIHRhcmdldCBmaWxlLCBwcm9jZXNzb3Igc2hvdWxkIHdyaXRlIHRvIGhlcmVcIixcbiAgICogICBzaG91bGRDb21waWxlOiA8Ym9vbGVhbj4sIHdoZXRoZXIgaWYgdGhlIGZpbGUgcmVxdWlyZXMgcmUtY29tcGlsZWRcbiAgICogfVxuICAgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dCBDb250ZXh0IG9mIGN1cnJlbnQgc3RlcFxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVsUGF0aCBSZWxhdGl2ZSBwYXRoIG9mIHRoZSBzb3VyY2UgZmlsZVxuICAgKi9cbiAgcHJvdGVjdGVkIHByb2Nlc3NvcklucHV0KGNvbnRleHQ6IENvbnRleHQsIHJlbFBhdGg6IHN0cmluZyk6IFByb2Nlc3NvcklucHV0RW50cnkge1xuICAgIHJldHVybiBuZXcgUHJvY2Vzc29ySW5wdXRFbnRyeShcbiAgICAgIHBhdGgucmVzb2x2ZShjb250ZXh0LnNvdXJjZURpciwgcmVsUGF0aCksXG4gICAgICBwYXRoLnJlc29sdmUoY29udGV4dC53b3JrRGlyLCByZWxQYXRoKSxcbiAgICAgIHRydWVcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGlucHV0IGZvciB0aGUgbmV4dCBwcm9jZXNzb3IgY2FsbC5cbiAgICogRmlsZXMgaW4gdGhlIGlucHV0IG11c3QgYmUgb3JkZXJlZCBpbiBpbnNlcnRpb24gb3JkZXIgc28gdGhhdCBldmVudHVhbGx5XG4gICAqIGluIEZpbmFsaXplciwgd2hlbiBmaWxlcyBnZXQgbWVyZ2VkLCB0aGV5IGFyZSBpbiB0aGUgc2FtZSBvcmRlciBhc1xuICAgKiBpbiBpbnB1dC5cbiAgICogQHJldHVybnMge1Byb2Nlc3NvcklucHV0fSBJbnB1dCBmb3IgdGhlIG5leHQgcHJvY2Vzc29yIGNhbGwuXG4gICAqL1xuICBuZXh0SW5wdXQoKTogUHJvY2Vzc29ySW5wdXQge1xuICAgIGxldCBuZXh0Um9vdERpciA9IHRoaXMubmV4dFJvb3REaXIoKTtcbiAgICBsZXQgaW5wdXQ6IFByb2Nlc3NvcklucHV0O1xuICAgIGxldCBuZXh0Q29udGV4dCA9IG5ldyBDb250ZXh0KHtcbiAgICAgIHJvb3REaXI6IG5leHRSb290RGlyLFxuICAgICAgd29ya0RpcjogcGF0aC5yZXNvbHZlKG5leHRSb290RGlyLCB0aGlzLmVudi5yZWxhdGl2ZVNvdXJjZURpciksXG4gICAgICBpbmRleDogdGhpcy5jb250ZXh0cy5sZW5ndGhcbiAgICB9KTtcbiAgICBpZiAoIXRoaXMuY29udGV4dHMubGVuZ3RoKSB7XG4gICAgICBuZXh0Q29udGV4dC5zb3VyY2VEaXIgPSB0aGlzLmVudi5zb3VyY2VEaXI7XG4gICAgICBpbnB1dCA9IG5ldyBQcm9jZXNzb3JJbnB1dChuZXh0Q29udGV4dC5zb3VyY2VEaXIsIG5leHRDb250ZXh0LndvcmtEaXIpO1xuICAgICAgdGhpcy5ydWxlLmZpbGVzLmZvckVhY2goZmlsZSA9PlxuICAgICAgICBpbnB1dC5hZGQodGhpcy5wcm9jZXNzb3JJbnB1dChuZXh0Q29udGV4dCwgZmlsZSkpXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgcHJldkNvbnRleHQgPSBVdGlscy5sYXN0RWxlbWVudCh0aGlzLmNvbnRleHRzKTtcbiAgICAgIG5leHRDb250ZXh0LnNvdXJjZURpciA9IHByZXZDb250ZXh0LndvcmtEaXI7XG4gICAgICBpbnB1dCA9IG5ldyBQcm9jZXNzb3JJbnB1dChuZXh0Q29udGV4dC5zb3VyY2VEaXIsIG5leHRDb250ZXh0LndvcmtEaXIpO1xuICAgICAgZm9yIChsZXQgW3RhcmdldCwgZW50cnldIG9mIHByZXZDb250ZXh0Lm91dHB1dC50YXJnZXRFbnRyaWVzKCkpIHtcbiAgICAgICAgaWYgKGVudHJ5LmltcG9ydGVkKSB7XG4gICAgICAgICAgVXRpbHMuZGJnKCkgJiYgVXRpbHMuZGVidWcoYFNraXBwaW5nIGltcG9ydGVkIGZpbGU6ICR7ZW50cnkudGFyZ2V0fWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlucHV0LmFkZCh0aGlzLnByb2Nlc3NvcklucHV0KG5leHRDb250ZXh0LCB0YXJnZXQpKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuY29udGV4dHMucHVzaChuZXh0Q29udGV4dCk7XG4gICAgcmV0dXJuIG5leHRDb250ZXh0LmlucHV0ID0gaW5wdXQ7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgaW5wdXQgZm9yIEZpbmFsaXplclxuICAgKiBAcmV0dXJucyB7RmluYWxpemVySW5wdXR9IElucHV0IGZvciBGaW5hbGl6ZXJcbiAgICovXG4gIGZpbmFsaXplcklucHV0KCk6IEZpbmFsaXplcklucHV0IHtcbiAgICBsZXQgaW5wdXQgPSBuZXcgRmluYWxpemVySW5wdXQoKTtcbiAgICBsZXQgY29udGV4dCA9IFV0aWxzLmxhc3RFbGVtZW50KHRoaXMuY29udGV4dHMpO1xuICAgIGZvciAobGV0IGVudHJ5IG9mIGNvbnRleHQub3V0cHV0LnZhbHVlcygpKSB7XG4gICAgICBpZiAoZW50cnkuaW1wb3J0ZWQpIHtcbiAgICAgICAgVXRpbHMuZGJnKCkgJiYgVXRpbHMuZGVidWcoYFNraXBwaW5nIGltcG9ydGVkIGZpbGU6ICR7ZW50cnkudGFyZ2V0fWApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5wdXQuYWRkKGVudHJ5LnRhcmdldCk7XG4gICAgICB9XG4gICAgfVxuICAgIGlucHV0LnNvdXJjZURpciA9IGNvbnRleHQud29ya0RpcjtcbiAgICByZXR1cm4gaW5wdXQ7XG4gIH1cblxuICAvKipcbiAgICogVHJhbnNmb3JtIHByb2Nlc3NvciBvdXRwdXQgYW5kIHNhdmUgaXQgaW50byBjb250ZXh0LlxuICAgKiBAcGFyYW0gb3V0cHV0IFJlc3VsdHMgcmV0dXJuZWQgYnkgcHJvY2Vzc29yLlxuICAgKi9cbiAgc2F2ZU91dHB1dChvdXRwdXQ6IFByb2Nlc3Nvck91dHB1dCk6IHZvaWQge1xuICAgIGxldCBjb250ZXh0ID0gVXRpbHMubGFzdEVsZW1lbnQodGhpcy5jb250ZXh0cyk7XG4gICAgY29udGV4dC5vdXRwdXQgPSBvdXRwdXQ7XG4gICAgaWYgKFV0aWxzLmRiZygpKSBVdGlscy5kZWJ1ZyhgJHt0aGlzLm5hbWV9OiBPdXRwdXRgLCBjb250ZXh0Lm91dHB1dCk7XG5cbiAgICB0aGlzLmhhbmRsZUZhaWx1cmVzKGNvbnRleHQub3V0cHV0LmZhaWx1cmVzKTtcblxuICAgIGxldCB0dHMgPSBuZXcgVGFyZ2V0VG9Tb3VyY2VzKCk7XG4gICAgZm9yIChsZXQgW3RhcmdldCwgZW50cnldIG9mIGNvbnRleHQub3V0cHV0LnRhcmdldEVudHJpZXMoKSkge1xuICAgICAgLy8gQ29udmVydCBpbmNsdWRlZCBmaWxlIHBhdGhzIHRvIHJlbGF0aXZlIHBhdGhcbiAgICAgIHR0cy5zZXQodGFyZ2V0LCBTdGF0ZS50b1JlbGF0aXZlUGF0aHMoY29udGV4dC5zb3VyY2VEaXIsIGVudHJ5LmNvbnRhaW5zKSk7XG4gICAgfVxuXG4gICAgLy8gSW4gdGhlIG5leHQgc3RlcCwgaW1wb3J0ZWQgZmlsZXMgc2hvdWxkIGJlIHNraXBwZWQuXG4gICAgbGV0IGltcG9ydGVkID0gU3RhdGUuZ2V0SW1wb3J0ZWRUYXJnZXRzKHR0cyk7XG4gICAgVXRpbHMuZGJnKCkgJiYgVXRpbHMuZGVidWcoJ0ltcG9ydGVkIGZpbGVzIHdpbGwgYmUgZXhjbHVkZWQgZnJvbSBuZXh0IHByb2Nlc3NvcjonLCBpbXBvcnRlZCk7XG4gICAgaW1wb3J0ZWQuZm9yRWFjaCh0YXJnZXQgPT5cbiAgICAgIGNvbnRleHQub3V0cHV0LmdldEJ5VGFyZ2V0KHRhcmdldCkuaW1wb3J0ZWQgPSB0cnVlXG4gICAgKTtcblxuICAgIC8vIFRPRE86IFRoaXMgaXMgYSBoYWNrLCBJbmNyZW1lbnRhbFN0YXRlIG5lZWRzIHRoaXMgdG8gbWFwIHRvIGRvXG4gICAgLy8gaXRzIG93biBjYWxjdWxhdGlvbiwgd2Ugc2F2ZWQgaXQgaW4gY29udGV4dCB0byBhdm9pZCBkdXBsaWNhdGVkXG4gICAgLy8gcHJvY2Vzc2luZyBpbiBJbmNyZW1lbnRhbFN0YXRlLiBCYXNlIFN0YXRlIGRvZXNuJ3QgbmVlZCBpdCBzYXZlZC5cbiAgICBjb250ZXh0LnRhcmdldFRvU291cmNlcyA9IHR0cztcbiAgfVxuXG4gIHByb3RlY3RlZCBoYW5kbGVGYWlsdXJlcyhmYWlsdXJlczogc3RyaW5nW10pOiB2b2lkIHtcbiAgICAvLyBEb2Vzbid0IHNlZW0gdGhlcmUgaXMgYW55dGhpbmcgbmVlZCB0byBiZSBkb25lIHlldCwgZmFpbHVyZSBzaG91bGRcbiAgICAvLyByZWNvdmVyIG9yZ2FuaWNhbGx5LlxuICB9XG5cbiAgY3VycmVudENvbnRleHQoKTogQ29udGV4dCB7XG4gICAgcmV0dXJuIFV0aWxzLmxhc3RFbGVtZW50KHRoaXMuY29udGV4dHMpO1xuICB9XG59Il19