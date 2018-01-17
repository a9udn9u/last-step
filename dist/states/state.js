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
            if (!path.isAbsolute(p))
                return p;
            if (p.startsWith(`${sourceDir}/`))
                return path.relative(sourceDir, p);
            return null;
        })
            .filter(p => p !== null));
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
        let nextContext = new state_models_1.Context({
            rootDir: nextRootDir,
            workDir: path.resolve(nextRootDir, this.env.relativeSourceDir),
            index: this.contexts.length,
            input: new processor_models_1.ProcessorInput()
        });
        if (!this.contexts.length) {
            nextContext.sourceDir = this.env.sourceDir;
            this.rule.files.forEach(file => nextContext.input.add(this.processorInput(nextContext, file)));
        }
        else {
            let prevContext = utils_1.Utils.lastElement(this.contexts);
            nextContext.sourceDir = prevContext.workDir;
            for (let entry of prevContext.output.values()) {
                if (entry.imported) {
                    utils_1.Utils.dbg() && utils_1.Utils.debug(`Skipping imported file: ${entry.target}`);
                }
                else {
                    let relPath = path.relative(prevContext.workDir, entry.target);
                    nextContext.input.add(this.processorInput(nextContext, relPath));
                }
            }
        }
        this.contexts.push(nextContext);
        return nextContext.input;
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
        this.handleFailures(output.failures);
        let tts = new state_models_1.TargetToSources();
        for (let entry of context.output.values()) {
            let target = path.relative(context.workDir, entry.target);
            // Convert included file paths to relative path
            tts.set(target, State.toRelativePaths(context.sourceDir, entry.contains));
        }
        // In the next step, imported files should be skipped.
        let toBeRemoved = State.getImportedTargets(tts);
        utils_1.Utils.dbg() && utils_1.Utils.debug('Excluded from next processor:', toBeRemoved);
        toBeRemoved.forEach(target => {
            let absPath = path.resolve(context.workDir, target);
            context.output.getByTarget(absPath).imported = true;
        });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RhdGVzL3N0YXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsNkJBQTZCO0FBQzdCLG1DQUFnQztBQUVoQyx3REFBaUU7QUFDakUsZ0VBQStHO0FBRS9HO0lBTUUsWUFBWSxHQUFnQixFQUFFLElBQVU7UUFDdEMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO1FBRWxDOztXQUVHO1FBQ0gsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFFbkIsYUFBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLGFBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxZQUFZLENBQUMsQ0FBQztJQUM3RSxDQUFDO0lBRUQsT0FBTztRQUNMLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQ25CLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNLLE1BQU0sQ0FBQyxlQUFlLENBQUMsU0FBaUIsRUFBRSxLQUFrQjtRQUNsRSxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQzthQUN0QixHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDUCxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNsQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsU0FBUyxHQUFHLENBQUMsQ0FBQztnQkFBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENB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QUFvRTtRQUNwRSxPQUFPLENBQUMsZUFBZSxHQUFHLEdBQUcsQ0FBQztJQUNoQyxDQUFDO0lBRVMsY0FBYyxDQUFDLFFBQWtCO1FBQ3pDLHFFQUFxRTtRQUNyRSx1QkFBdUI7SUFDekIsQ0FBQztJQUVELGNBQWM7UUFDWixNQUFNLENBQUMsYUFBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDMUMsQ0FBQztDQUNGO0FBOUxELHNCQThMQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBVdGlscyB9IGZyb20gJ34vdXRpbHMnO1xuaW1wb3J0IHsgRW52aXJvbm1lbnQsIFJ1bGUsIFRhc2sgfSBmcm9tICd+L21vZGVscy9idWlsZGVyLW1vZGVscyc7XG5pbXBvcnQgeyBDb250ZXh0LCBUYXJnZXRUb1NvdXJjZXMgfSBmcm9tICd+L21vZGVscy9zdGF0ZS1tb2RlbHMnO1xuaW1wb3J0IHsgRmluYWxpemVySW5wdXQsUHJvY2Vzc29ySW5wdXQsIFByb2Nlc3NvcklucHV0RW50cnksUHJvY2Vzc29yT3V0cHV0IH0gZnJvbSAnfi9tb2RlbHMvcHJvY2Vzc29yLW1vZGVscyc7XG5cbmV4cG9ydCBjbGFzcyBTdGF0ZSB7XG4gIHByb3RlY3RlZCBlbnY6IEVudmlyb25tZW50O1xuICBwcm90ZWN0ZWQgcnVsZTogUnVsZTtcbiAgcHJvdGVjdGVkIG5hbWU6IHN0cmluZztcbiAgcHJvdGVjdGVkIGNvbnRleHRzOiBDb250ZXh0W107XG5cbiAgY29uc3RydWN0b3IoZW52OiBFbnZpcm9ubWVudCwgcnVsZTogUnVsZSkge1xuICAgIHRoaXMuZW52ID0gZW52O1xuICAgIHRoaXMucnVsZSA9IHJ1bGU7XG4gICAgdGhpcy5uYW1lID0gdGhpcy5jb25zdHJ1Y3Rvci5uYW1lO1xuXG4gICAgLyoqXG4gICAgICogQHNlZSB7QGxpbmsgQ29udGV4dH1cbiAgICAgKi9cbiAgICB0aGlzLmNvbnRleHRzID0gW107XG5cbiAgICBVdGlscy5kYmcoKSAmJiBVdGlscy5kZWJ1ZyhgJHt0aGlzLm5hbWV9IFske3RoaXMucnVsZS5zb3VyY2VzfV0gY3JlYXRlZC5gKTtcbiAgfVxuXG4gIGdldFJ1bGUoKTogUnVsZSB7XG4gICAgcmV0dXJuIHRoaXMucnVsZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0IGdpdmVuIHBhdGhzIHRvIHJlbGF0aXZlIHBhdGhzLCBpZ25vcmUgdGhvc2Ugbm90IHVuZGVyIHNvdXJjZURpclxuICAgKiBAcGFyYW0gc291cmNlRGlyIFBhcmVudCBwYXRoXG4gICAqIEBwYXJhbSBwYXRocyBMaXN0IG9mIHBhdGhzXG4gICAqIEByZXR1cm5zIFJlbGF0aXZlIHBhdGhzXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyB0b1JlbGF0aXZlUGF0aHMoc291cmNlRGlyOiBzdHJpbmcsIHBhdGhzOiBTZXQ8c3RyaW5nPik6IFNldDxzdHJpbmc+IHtcbiAgICByZXR1cm4gbmV3IFNldChbLi4ucGF0aHNdXG4gICAgICAubWFwKHAgPT4ge1xuICAgICAgICBpZiAoIXBhdGguaXNBYnNvbHV0ZShwKSkgcmV0dXJuIHA7XG4gICAgICAgIGlmIChwLnN0YXJ0c1dpdGgoYCR7c291cmNlRGlyfS9gKSkgcmV0dXJuIHBhdGgucmVsYXRpdmUoc291cmNlRGlyLCBwKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9KVxuICAgICAgLmZpbHRlcihwID0+IHAgIT09IG51bGwpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kIHRhcmdldHMgaW1wb3J0ZWQgYnkgYW5vdGhlciB0YXJnZXQsIHRoZXJlZm9yZSBzaG91bGQgYmUgZXhjbHVkZWQgZnJvbVxuICAgKiBpbnB1dCBvZiBuZXh0IHByb2Nlc3NvclxuICAgKiBAcGFyYW0gdHRzIHRhcmdldFRvU291cmNlcyBtYXBwaW5nXG4gICAqIEByZXR1cm5zIEEgc2V0IG9mIGZpbGVzIGluY2x1ZGVkIGJ5IG90aGVyIGZpbGVzXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBnZXRJbXBvcnRlZFRhcmdldHModHRzOiBUYXJnZXRUb1NvdXJjZXMpOiBTZXQ8c3RyaW5nPiB7XG4gICAgbGV0IGltcG9ydGVkVGFyZ2V0czogU2V0PHN0cmluZz4gPSBuZXcgU2V0KCk7XG4gICAgbGV0IGFsbFRhcmdldHMgPSBbLi4udHRzLmtleXMoKV07XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhbGxUYXJnZXRzLmxlbmd0aCAtIDE7ICsraSkge1xuICAgICAgZm9yIChsZXQgaiA9IGkgKyAxOyBqIDwgYWxsVGFyZ2V0cy5sZW5ndGg7ICsraikge1xuICAgICAgICBsZXQgdDEgPSBhbGxUYXJnZXRzW2ldLCB0MiA9IGFsbFRhcmdldHNbal07XG4gICAgICAgIGxldCBzMSA9IHR0cy5nZXQodDEpLCBzMiA9IHR0cy5nZXQodDIpO1xuICAgICAgICBsZXQgY29tbW9uID0gVXRpbHMuaW50ZXJzZWN0aW9uKHMxLCBzMik7XG4gICAgICAgIGlmIChzMS5zaXplID09PSBjb21tb24uc2l6ZSAmJiBzMi5zaXplID09PSBjb21tb24uc2l6ZSkge1xuICAgICAgICAgIC8vIEltcG9zc2libGUgY2FzZVxuICAgICAgICAgIHRocm93IGBGaWxlcyAoZXZlbiBwYXRocykgYXJlIGlkZW50aWNhbD8gJHt0MX0gJHtzMX0gOiAke3QyfSAke3MyfWA7XG4gICAgICAgIH0gZWxzZSBpZiAoczEuc2l6ZSA9PT0gY29tbW9uLnNpemUpIHtcbiAgICAgICAgICBpbXBvcnRlZFRhcmdldHMuYWRkKHQxKTtcbiAgICAgICAgICBicmVhazsgLy8gTm8gbmVlZCB0byBjb250aW51ZSBhcyB0MSBpdHNlbGYgaXMgZnVsbHkgY29udGFpbmVkXG4gICAgICAgIH0gZWxzZSBpZiAoczIuc2l6ZSA9PT0gY29tbW9uLnNpemUpIHtcbiAgICAgICAgICBpbXBvcnRlZFRhcmdldHMuYWRkKHQyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaW1wb3J0ZWRUYXJnZXRzO1xuICB9XG5cbiAgYmVmb3JlQnVpbGQodGFzazogVGFzayA9IHVuZGVmaW5lZCk6IHZvaWQge1xuICB9XG5cbiAgYWZ0ZXJCdWlsZCgpOiB2b2lkIHtcbiAgfVxuXG4gIHByb3RlY3RlZCBuZXh0Um9vdERpcigpOiBzdHJpbmcge1xuICAgIHJldHVybiBVdGlscy50bXBQYXRoKHRoaXMuZW52LndvcmtEaXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGlucHV0IGZvciB0aGUgbmV4dCBwcm9jZXNzb3IgY2FsbC4gSW5wdXQgZWxlbWVudCBzdHJ1Y3R1cmU6XG4gICAqIHtcbiAgICogICBzb3VyY2U6IFwicGF0aCB0byB0aGUgc291cmNlIGZpbGUgKHRhcmdldCBmaWxlIGZyb20gdGhlIGxhc3QgcHJvY2Vzc29yKVwiLFxuICAgKiAgIHRhcmdldDogXCJwYXRoIHRvIHRoZSB0YXJnZXQgZmlsZSwgcHJvY2Vzc29yIHNob3VsZCB3cml0ZSB0byBoZXJlXCIsXG4gICAqICAgc2hvdWxkQ29tcGlsZTogPGJvb2xlYW4+LCB3aGV0aGVyIGlmIHRoZSBmaWxlIHJlcXVpcmVzIHJlLWNvbXBpbGVkXG4gICAqIH1cbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHQgQ29udGV4dCBvZiBjdXJyZW50IHN0ZXBcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbFBhdGggUmVsYXRpdmUgcGF0aCBvZiB0aGUgc291cmNlIGZpbGVcbiAgICovXG4gIHByb3RlY3RlZCBwcm9jZXNzb3JJbnB1dChjb250ZXh0OiBDb250ZXh0LCByZWxQYXRoOiBzdHJpbmcpOiBQcm9jZXNzb3JJbnB1dEVudHJ5IHtcbiAgICByZXR1cm4gbmV3IFByb2Nlc3NvcklucHV0RW50cnkoXG4gICAgICBwYXRoLnJlc29sdmUoY29udGV4dC5zb3VyY2VEaXIsIHJlbFBhdGgpLFxuICAgICAgcGF0aC5yZXNvbHZlKGNvbnRleHQud29ya0RpciwgcmVsUGF0aCksXG4gICAgICB0cnVlXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBpbnB1dCBmb3IgdGhlIG5leHQgcHJvY2Vzc29yIGNhbGwuXG4gICAqIEZpbGVzIGluIHRoZSBpbnB1dCBtdXN0IGJlIG9yZGVyZWQgaW4gaW5zZXJ0aW9uIG9yZGVyIHNvIHRoYXQgZXZlbnR1YWxseVxuICAgKiBpbiBGaW5hbGl6ZXIsIHdoZW4gZmlsZXMgZ2V0IG1lcmdlZCwgdGhleSBhcmUgaW4gdGhlIHNhbWUgb3JkZXIgYXNcbiAgICogaW4gaW5wdXQuXG4gICAqIEByZXR1cm5zIHtQcm9jZXNzb3JJbnB1dH0gSW5wdXQgZm9yIHRoZSBuZXh0IHByb2Nlc3NvciBjYWxsLlxuICAgKi9cbiAgbmV4dElucHV0KCk6IFByb2Nlc3NvcklucHV0IHtcbiAgICBsZXQgbmV4dFJvb3REaXIgPSB0aGlzLm5leHRSb290RGlyKCk7XG4gICAgbGV0IG5leHRDb250ZXh0ID0gbmV3IENvbnRleHQoe1xuICAgICAgcm9vdERpcjogbmV4dFJvb3REaXIsXG4gICAgICB3b3JrRGlyOiBwYXRoLnJlc29sdmUobmV4dFJvb3REaXIsIHRoaXMuZW52LnJlbGF0aXZlU291cmNlRGlyKSxcbiAgICAgIGluZGV4OiB0aGlzLmNvbnRleHRzLmxlbmd0aCxcbiAgICAgIGlucHV0OiBuZXcgUHJvY2Vzc29ySW5wdXQoKVxuICAgIH0pO1xuICAgIGlmICghdGhpcy5jb250ZXh0cy5sZW5ndGgpIHtcbiAgICAgIG5leHRDb250ZXh0LnNvdXJjZURpciA9IHRoaXMuZW52LnNvdXJjZURpcjtcbiAgICAgIHRoaXMucnVsZS5maWxlcy5mb3JFYWNoKGZpbGUgPT5cbiAgICAgICAgbmV4dENvbnRleHQuaW5wdXQuYWRkKHRoaXMucHJvY2Vzc29ySW5wdXQobmV4dENvbnRleHQsIGZpbGUpKVxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHByZXZDb250ZXh0ID0gVXRpbHMubGFzdEVsZW1lbnQodGhpcy5jb250ZXh0cyk7XG4gICAgICBuZXh0Q29udGV4dC5zb3VyY2VEaXIgPSBwcmV2Q29udGV4dC53b3JrRGlyO1xuICAgICAgZm9yIChsZXQgZW50cnkgb2YgcHJldkNvbnRleHQub3V0cHV0LnZhbHVlcygpKSB7XG4gICAgICAgIGlmIChlbnRyeS5pbXBvcnRlZCkge1xuICAgICAgICAgIFV0aWxzLmRiZygpICYmIFV0aWxzLmRlYnVnKGBTa2lwcGluZyBpbXBvcnRlZCBmaWxlOiAke2VudHJ5LnRhcmdldH1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsZXQgcmVsUGF0aCA9IHBhdGgucmVsYXRpdmUocHJldkNvbnRleHQud29ya0RpciwgZW50cnkudGFyZ2V0KTtcbiAgICAgICAgICBuZXh0Q29udGV4dC5pbnB1dC5hZGQodGhpcy5wcm9jZXNzb3JJbnB1dChuZXh0Q29udGV4dCwgcmVsUGF0aCkpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5jb250ZXh0cy5wdXNoKG5leHRDb250ZXh0KTtcbiAgICByZXR1cm4gbmV4dENvbnRleHQuaW5wdXQ7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgaW5wdXQgZm9yIEZpbmFsaXplclxuICAgKiBAcmV0dXJucyB7RmluYWxpemVySW5wdXR9IElucHV0IGZvciBGaW5hbGl6ZXJcbiAgICovXG4gIGZpbmFsaXplcklucHV0KCk6IEZpbmFsaXplcklucHV0IHtcbiAgICBsZXQgaW5wdXQgPSBuZXcgRmluYWxpemVySW5wdXQoKTtcbiAgICBsZXQgY29udGV4dCA9IFV0aWxzLmxhc3RFbGVtZW50KHRoaXMuY29udGV4dHMpO1xuICAgIGZvciAobGV0IGVudHJ5IG9mIGNvbnRleHQub3V0cHV0LnZhbHVlcygpKSB7XG4gICAgICBpZiAoZW50cnkuaW1wb3J0ZWQpIHtcbiAgICAgICAgVXRpbHMuZGJnKCkgJiYgVXRpbHMuZGVidWcoYFNraXBwaW5nIGltcG9ydGVkIGZpbGU6ICR7ZW50cnkudGFyZ2V0fWApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5wdXQuYWRkKGVudHJ5LnRhcmdldCk7XG4gICAgICB9XG4gICAgfVxuICAgIGlucHV0LnNvdXJjZURpciA9IGNvbnRleHQud29ya0RpcjtcbiAgICByZXR1cm4gaW5wdXQ7XG4gIH1cblxuICAvKipcbiAgICogVHJhbnNmb3JtIHByb2Nlc3NvciBvdXRwdXQgYW5kIHNhdmUgaXQgaW50byBjb250ZXh0LlxuICAgKiBAcGFyYW0gb3V0cHV0IFJlc3VsdHMgcmV0dXJuZWQgYnkgcHJvY2Vzc29yLlxuICAgKi9cbiAgc2F2ZU91dHB1dChvdXRwdXQ6IFByb2Nlc3Nvck91dHB1dCk6IHZvaWQge1xuICAgIGxldCBjb250ZXh0ID0gVXRpbHMubGFzdEVsZW1lbnQodGhpcy5jb250ZXh0cyk7XG4gICAgY29udGV4dC5vdXRwdXQgPSBvdXRwdXQ7XG4gICAgaWYgKFV0aWxzLmRiZygpKSBVdGlscy5kZWJ1ZyhgJHt0aGlzLm5hbWV9OiBPdXRwdXRgLCBjb250ZXh0Lm91dHB1dCk7XG5cbiAgICB0aGlzLmhhbmRsZUZhaWx1cmVzKG91dHB1dC5mYWlsdXJlcyk7XG5cbiAgICBsZXQgdHRzID0gbmV3IFRhcmdldFRvU291cmNlcygpO1xuICAgIGZvciAobGV0IGVudHJ5IG9mIGNvbnRleHQub3V0cHV0LnZhbHVlcygpKSB7XG4gICAgICBsZXQgdGFyZ2V0ID0gcGF0aC5yZWxhdGl2ZShjb250ZXh0LndvcmtEaXIsIGVudHJ5LnRhcmdldCk7XG4gICAgICAvLyBDb252ZXJ0IGluY2x1ZGVkIGZpbGUgcGF0aHMgdG8gcmVsYXRpdmUgcGF0aFxuICAgICAgdHRzLnNldCh0YXJnZXQsIFN0YXRlLnRvUmVsYXRpdmVQYXRocyhjb250ZXh0LnNvdXJjZURpciwgZW50cnkuY29udGFpbnMpKTtcbiAgICB9XG5cbiAgICAvLyBJbiB0aGUgbmV4dCBzdGVwLCBpbXBvcnRlZCBmaWxlcyBzaG91bGQgYmUgc2tpcHBlZC5cbiAgICBsZXQgdG9CZVJlbW92ZWQgPSBTdGF0ZS5nZXRJbXBvcnRlZFRhcmdldHModHRzKTtcbiAgICBVdGlscy5kYmcoKSAmJiBVdGlscy5kZWJ1ZygnRXhjbHVkZWQgZnJvbSBuZXh0IHByb2Nlc3NvcjonLCB0b0JlUmVtb3ZlZCk7XG4gICAgdG9CZVJlbW92ZWQuZm9yRWFjaCh0YXJnZXQgPT4ge1xuICAgICAgbGV0IGFic1BhdGggPSBwYXRoLnJlc29sdmUoY29udGV4dC53b3JrRGlyLCB0YXJnZXQpO1xuICAgICAgY29udGV4dC5vdXRwdXQuZ2V0QnlUYXJnZXQoYWJzUGF0aCkuaW1wb3J0ZWQgPSB0cnVlO1xuICAgIH0pO1xuXG4gICAgLy8gVE9ETzogVGhpcyBpcyBhIGhhY2ssIEluY3JlbWVudGFsU3RhdGUgbmVlZHMgdGhpcyB0byBtYXAgdG8gZG9cbiAgICAvLyBpdHMgb3duIGNhbGN1bGF0aW9uLCB3ZSBzYXZlZCBpdCBpbiBjb250ZXh0IHRvIGF2b2lkIGR1cGxpY2F0ZWRcbiAgICAvLyBwcm9jZXNzaW5nIGluIEluY3JlbWVudGFsU3RhdGUuIEJhc2UgU3RhdGUgZG9lc24ndCBuZWVkIGl0IHNhdmVkLlxuICAgIGNvbnRleHQudGFyZ2V0VG9Tb3VyY2VzID0gdHRzO1xuICB9XG5cbiAgcHJvdGVjdGVkIGhhbmRsZUZhaWx1cmVzKGZhaWx1cmVzOiBzdHJpbmdbXSk6IHZvaWQge1xuICAgIC8vIERvZXNuJ3Qgc2VlbSB0aGVyZSBpcyBhbnl0aGluZyBuZWVkIHRvIGJlIGRvbmUgeWV0LCBmYWlsdXJlIHNob3VsZFxuICAgIC8vIHJlY292ZXIgb3JnYW5pY2FsbHkuXG4gIH1cblxuICBjdXJyZW50Q29udGV4dCgpOiBDb250ZXh0IHtcbiAgICByZXR1cm4gVXRpbHMubGFzdEVsZW1lbnQodGhpcy5jb250ZXh0cyk7XG4gIH1cbn0iXX0=