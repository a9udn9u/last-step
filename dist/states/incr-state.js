"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const utils_1 = require("~/utils");
const builder_models_1 = require("~/models/builder-models");
const state_models_1 = require("~/models/state-models");
const state_1 = require("~/states/state");
const processor_models_1 = require("~/models/processor-models");
class IncrementalState extends state_1.State {
    constructor(env, rule) {
        super(env, rule);
        this.targetToSources = new state_models_1.TargetToSources();
        this.sourceToTargets = new state_models_1.SourceToTargets();
        this.recompileSources = new Set();
    }
    /**
     * Find files requring re-compile when the given file changed.
     * First find the targets affected by the changed file, then backtrack each
     * execution context, find the original source of each target.
     *
     * File additions will fall through, but caught later in
     * [processorInput()]{@link IncrementalState#processorInput}
     *
     * @param file The added/updated/deleted file.
     * @returns List of files requiring re-compile.
     */
    findReompileSources(source) {
        let sources = new Set();
        let targets = this.sourceToTargets.get(source);
        if (!targets) {
            sources.add(source);
        }
        else {
            targets.forEach(finalTarget => {
                // Backtracking source
                // TODO: This might be unncecessary though, the key of the output
                // map is the original source (needs confirmation)
                let file = finalTarget;
                for (let i = this.contexts.length - 1; i >= 0; --i) {
                    let context = this.contexts[i];
                    file = context.output.getByTarget(file).source;
                    file = path.relative(context.sourceDir, file);
                }
                sources.add(file);
            });
        }
        utils_1.Utils.dbg() && utils_1.Utils.debug('Re-compile candidates:', sources);
        return sources;
    }
    getLastBuildContext(index) {
        return this.lastBuildContexts ? this.lastBuildContexts[index] : undefined;
    }
    nextRootDir() {
        // At this point, new context hasn't been pushed to this.contexts,
        // so index should be context length without minus one
        let lastBuildContext = this.getLastBuildContext(this.contexts.length);
        return lastBuildContext ? lastBuildContext.rootDir : super.nextRootDir();
    }
    processorInput(context, file) {
        let entry = new processor_models_1.ProcessorInputEntry(path.resolve(context.sourceDir, file), path.resolve(context.workDir, file), false, undefined);
        let lastBuildContext = this.getLastBuildContext(context.index);
        // Original source files in recompileSources should be compiled
        if (context.index === 0) {
            if (this.recompileSources.has(file)) {
                entry.shouldCompile = true;
                utils_1.Utils.dbg() && utils_1.Utils.debug(`Recompile ${file} because itself or its dependencies have changed.`);
            }
        }
        // First build, or previous build didn't advance to this step, source should be
        // compiled regardless.
        if (!lastBuildContext) {
            entry.shouldCompile = true;
        }
        else if (!lastBuildContext.output.hasSource(file)) {
            utils_1.Utils.dbg() && utils_1.Utils.debug(`Recompile ${file} because it's new or it failed last time.`);
            entry.shouldCompile = true;
        }
        // When compile is skipped, processor needs output from last build to
        // generate its own output
        if (lastBuildContext) {
            entry.lastOutput = lastBuildContext.output.getBySource(file);
        }
        return entry;
    }
    beforeBuild(task = new builder_models_1.Task()) {
        super.beforeBuild(task);
        // Compute re-compile sources
        this.recompileSources = [...task.values()]
            .reduce((all, batch) => all.concat([...batch]), [])
            .map(file => this.findReompileSources(file))
            .reduce((cands, sources) => utils_1.Utils.union(cands, sources), new Set());
        // Update file list according to file system update
        if (task.has(builder_models_1.EditEvent.ADD)) {
            task.get(builder_models_1.EditEvent.ADD).forEach(f => this.rule.files.add(f));
        }
        if (task.has(builder_models_1.EditEvent.DEL)) {
            task.get(builder_models_1.EditEvent.DEL).forEach(f => this.rule.files.delete(f));
        }
        // Reinitiate TTS
        if (this.rule.files.size) {
            this.targetToSources = new state_models_1.TargetToSources();
            this.rule.files.forEach(f => this.targetToSources.set(f, new Set([f])));
            this.sourceToTargets = this.targetToSources.flip();
        }
        this.lastBuildContexts = this.contexts;
        this.contexts = [];
    }
    /**
     * Transform processor output and save it into context.
     * @param output Results returned by processor.
     */
    saveOutput(output) {
        super.saveOutput(output);
        let context = utils_1.Utils.lastElement(this.contexts);
        // Update targetToSourcesMap and sourceToTargetsMap
        context.targetToSources.trace(this.targetToSources);
        this.targetToSources = context.targetToSources;
        context.sourceToTargets = this.sourceToTargets = this.targetToSources.flip();
        if (utils_1.Utils.dbg()) {
            utils_1.Utils.debug(`${this.name}: TTS`, this.targetToSources);
            utils_1.Utils.debug(`${this.name}: STT`, this.sourceToTargets);
        }
    }
}
exports.IncrementalState = IncrementalState;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5jci1zdGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdGF0ZXMvaW5jci1zdGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZCQUE2QjtBQUM3QixtQ0FBZ0M7QUFDaEMsNERBQTZFO0FBQzdFLHdEQUFrRjtBQUNsRiwwQ0FBdUM7QUFDdkMsZ0VBQWlGO0FBRWpGLHNCQUE4QixTQUFRLGFBQUs7SUFxQnpDLFlBQVksR0FBZ0IsRUFBRSxJQUFVO1FBQ3RDLEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDakIsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLDhCQUFlLEVBQUUsQ0FBQztRQUM3QyxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksOEJBQWUsRUFBRSxDQUFDO1FBQzdDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ3BDLENBQUM7SUFFRDs7Ozs7Ozs7OztPQVVHO0lBQ0ssbUJBQW1CLENBQUMsTUFBYztRQUN4QyxJQUFJLE9BQU8sR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1FBQ2hDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQy9DLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNiLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdEIsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sT0FBTyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBRTtnQkFDNUIsc0JBQXNCO2dCQUN0QixpRUFBaUU7Z0JBQ2pFLGtEQUFrRDtnQkFDbEQsSUFBSSxJQUFJLEdBQUcsV0FBVyxDQUFDO2dCQUN2QixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUs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LEVBQUUsQ0FBQztRQUU3RSxFQUFFLENBQUMsQ0FBQyxhQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2hCLGFBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxPQUFPLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ3ZELGFBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxPQUFPLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3pELENBQUM7SUFDSCxDQUFDO0NBQ0Y7QUEzSkQsNENBMkpDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IFV0aWxzIH0gZnJvbSAnfi91dGlscyc7XG5pbXBvcnQgeyBFZGl0RXZlbnQsIEVudmlyb25tZW50LCBSdWxlLCBUYXNrIH0gZnJvbSAnfi9tb2RlbHMvYnVpbGRlci1tb2RlbHMnO1xuaW1wb3J0IHsgVGFyZ2V0VG9Tb3VyY2VzLCBTb3VyY2VUb1RhcmdldHMsIENvbnRleHQgfSBmcm9tICd+L21vZGVscy9zdGF0ZS1tb2RlbHMnO1xuaW1wb3J0IHsgU3RhdGUgfSBmcm9tICd+L3N0YXRlcy9zdGF0ZSc7XG5pbXBvcnQgeyBQcm9jZXNzb3JPdXRwdXQsIFByb2Nlc3NvcklucHV0RW50cnkgfSBmcm9tICd+L21vZGVscy9wcm9jZXNzb3ItbW9kZWxzJztcblxuZXhwb3J0IGNsYXNzIEluY3JlbWVudGFsU3RhdGUgZXh0ZW5kcyBTdGF0ZSB7XG4gIC8qKlxuICAgKiAxIHRvIE0gbWFwcGluZywga2V5IGlzIHRoZSB0YXJnZXQgZmlsZSwgdmFsdWUgaXMgYSBzZXQgb2Ygc291cmNlXG4gICAqIGZpbGVzIHdoaWNoIGNvbXBvc2UgdGhlIHRhcmdldCBmaWxlXG4gICAqL1xuICB0YXJnZXRUb1NvdXJjZXM6IFRhcmdldFRvU291cmNlcztcbiAgLyoqXG4gICAqIDEgdG8gTSBtYXBwaW5nLCBrZXkgaXMgdGhlIHNvdXJjZSBmaWxlLCB2YWx1ZSBpcyBhIHNldCBvZiB0YXJnZXRcbiAgICogZmlsZXMgd2hpY2ggY29udGFpbiB0aGUgc291cmNlIGZpbGVcbiAgICovXG4gIHNvdXJjZVRvVGFyZ2V0czogU291cmNlVG9UYXJnZXRzO1xuICAvKipcbiAgICogVGhpcyBpcyBhIHNldCBvZiBzb3VyY2VzIHRoYXQgc2hvdWxkIGJlIGZvcmNlZCB0byByZS1jb21waWxlIGluIHRoZVxuICAgKiBuZXh0IGluY3JlbWVudGFsIGJ1aWxkXG4gICAqL1xuICByZWNvbXBpbGVTb3VyY2VzOiBTZXQ8c3RyaW5nPjtcbiAgLyoqXG4gICAqIENvbmV0eHQgbGlzdCBmcm9tIHRoZSBsYXN0IGJ1aWxkXG4gICAqL1xuICBsYXN0QnVpbGRDb250ZXh0czogQ29udGV4dFtdO1xuXG4gIGNvbnN0cnVjdG9yKGVudjogRW52aXJvbm1lbnQsIHJ1bGU6IFJ1bGUpIHtcbiAgICBzdXBlcihlbnYsIHJ1bGUpO1xuICAgIHRoaXMudGFyZ2V0VG9Tb3VyY2VzID0gbmV3IFRhcmdldFRvU291cmNlcygpO1xuICAgIHRoaXMuc291cmNlVG9UYXJnZXRzID0gbmV3IFNvdXJjZVRvVGFyZ2V0cygpO1xuICAgIHRoaXMucmVjb21waWxlU291cmNlcyA9IG5ldyBTZXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kIGZpbGVzIHJlcXVyaW5nIHJlLWNvbXBpbGUgd2hlbiB0aGUgZ2l2ZW4gZmlsZSBjaGFuZ2VkLlxuICAgKiBGaXJzdCBmaW5kIHRoZSB0YXJnZXRzIGFmZmVjdGVkIGJ5IHRoZSBjaGFuZ2VkIGZpbGUsIHRoZW4gYmFja3RyYWNrIGVhY2hcbiAgICogZXhlY3V0aW9uIGNvbnRleHQsIGZpbmQgdGhlIG9yaWdpbmFsIHNvdXJjZSBvZiBlYWNoIHRhcmdldC5cbiAgICpcbiAgICogRmlsZSBhZGRpdGlvbnMgd2lsbCBmYWxsIHRocm91Z2gsIGJ1dCBjYXVnaHQgbGF0ZXIgaW5cbiAgICogW3Byb2Nlc3NvcklucHV0KClde0BsaW5rIEluY3JlbWVudGFsU3RhdGUjcHJvY2Vzc29ySW5wdXR9XG4gICAqXG4gICAqIEBwYXJhbSBmaWxlIFRoZSBhZGRlZC91cGRhdGVkL2RlbGV0ZWQgZmlsZS5cbiAgICogQHJldHVybnMgTGlzdCBvZiBmaWxlcyByZXF1aXJpbmcgcmUtY29tcGlsZS5cbiAgICovXG4gIHByaXZhdGUgZmluZFJlb21waWxlU291cmNlcyhzb3VyY2U6IHN0cmluZyk6IFNldDxzdHJpbmc+IHtcbiAgICBsZXQgc291cmNlcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgIGxldCB0YXJnZXRzID0gdGhpcy5zb3VyY2VUb1RhcmdldHMuZ2V0KHNvdXJjZSk7XG4gICAgaWYgKCF0YXJnZXRzKSB7XG4gICAgICBzb3VyY2VzLmFkZChzb3VyY2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0YXJnZXRzLmZvckVhY2goZmluYWxUYXJnZXQgPT4ge1xuICAgICAgICAvLyBCYWNrdHJhY2tpbmcgc291cmNlXG4gICAgICAgIC8vIFRPRE86IFRoaXMgbWlnaHQgYmUgdW5uY2VjZXNzYXJ5IHRob3VnaCwgdGhlIGtleSBvZiB0aGUgb3V0cHV0XG4gICAgICAgIC8vIG1hcCBpcyB0aGUgb3JpZ2luYWwgc291cmNlIChuZWVkcyBjb25maXJtYXRpb24pXG4gICAgICAgIGxldCBmaWxlID0gZmluYWxUYXJnZXQ7XG4gICAgICAgIGZvciAobGV0IGkgPSB0aGlzLmNvbnRleHRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgICAgbGV0IGNvbnRleHQgPSB0aGlzLmNvbnRleHRzW2ldO1xuICAgICAgICAgIGZpbGUgPSBjb250ZXh0Lm91dHB1dC5nZXRCeVRhcmdldChmaWxlKS5zb3VyY2U7XG4gICAgICAgICAgZmlsZSA9IHBhdGgucmVsYXRpdmUoY29udGV4dC5zb3VyY2VEaXIsIGZpbGUpO1xuICAgICAgICB9XG4gICAgICAgIHNvdXJjZXMuYWRkKGZpbGUpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIFV0aWxzLmRiZygpICYmIFV0aWxzLmRlYnVnKCdSZS1jb21waWxlIGNhbmRpZGF0ZXM6Jywgc291cmNlcyk7XG4gICAgcmV0dXJuIHNvdXJjZXM7XG4gIH1cblxuICBwcml2YXRlIGdldExhc3RCdWlsZENvbnRleHQoaW5kZXg6IG51bWJlcik6IENvbnRleHQge1xuICAgIHJldHVybiB0aGlzLmxhc3RCdWlsZENvbnRleHRzID8gdGhpcy5sYXN0QnVpbGRDb250ZXh0c1tpbmRleF0gOiB1bmRlZmluZWQ7XG4gIH1cblxuICBwcm90ZWN0ZWQgbmV4dFJvb3REaXIoKTogc3RyaW5nIHtcbiAgICAvLyBBdCB0aGlzIHBvaW50LCBuZXcgY29udGV4dCBoYXNuJ3QgYmVlbiBwdXNoZWQgdG8gdGhpcy5jb250ZXh0cyxcbiAgICAvLyBzbyBpbmRleCBzaG91bGQgYmUgY29udGV4dCBsZW5ndGggd2l0aG91dCBtaW51cyBvbmVcbiAgICBsZXQgbGFzdEJ1aWxkQ29udGV4dCA9IHRoaXMuZ2V0TGFzdEJ1aWxkQ29udGV4dCh0aGlzLmNvbnRleHRzLmxlbmd0aCk7XG4gICAgcmV0dXJuIGxhc3RCdWlsZENvbnRleHQgPyBsYXN0QnVpbGRDb250ZXh0LnJvb3REaXIgOiBzdXBlci5uZXh0Um9vdERpcigpO1xuICB9XG5cbiAgcHJvdGVjdGVkIHByb2Nlc3NvcklucHV0KGNvbnRleHQ6IENvbnRleHQsIGZpbGU6IHN0cmluZyk6IFByb2Nlc3NvcklucHV0RW50cnkge1xuICAgIGxldCBlbnRyeSA9IG5ldyBQcm9jZXNzb3JJbnB1dEVudHJ5KFxuICAgICAgcGF0aC5yZXNvbHZlKGNvbnRleHQuc291cmNlRGlyLCBmaWxlKSxcbiAgICAgIHBhdGgucmVzb2x2ZShjb250ZXh0LndvcmtEaXIsIGZpbGUpLFxuICAgICAgZmFsc2UsXG4gICAgICB1bmRlZmluZWRcbiAgICApO1xuXG4gICAgbGV0IGxhc3RCdWlsZENvbnRleHQgPSB0aGlzLmdldExhc3RCdWlsZENvbnRleHQoY29udGV4dC5pbmRleCk7XG4gICAgLy8gT3JpZ2luYWwgc291cmNlIGZpbGVzIGluIHJlY29tcGlsZVNvdXJjZXMgc2hvdWxkIGJlIGNvbXBpbGVkXG4gICAgaWYgKGNvbnRleHQuaW5kZXggPT09IDApIHtcbiAgICAgIGlmICh0aGlzLnJlY29tcGlsZVNvdXJjZXMuaGFzKGZpbGUpKSB7XG4gICAgICAgIGVudHJ5LnNob3VsZENvbXBpbGUgPSB0cnVlO1xuICAgICAgICBVdGlscy5kYmcoKSAmJiBVdGlscy5kZWJ1ZyhgUmVjb21waWxlICR7ZmlsZX0gYmVjYXVzZSBpdHNlbGYgb3IgaXRzIGRlcGVuZGVuY2llcyBoYXZlIGNoYW5nZWQuYCk7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIEZpcnN0IGJ1aWxkLCBvciBwcmV2aW91cyBidWlsZCBkaWRuJ3QgYWR2YW5jZSB0byB0aGlzIHN0ZXAsIHNvdXJjZSBzaG91bGQgYmVcbiAgICAvLyBjb21waWxlZCByZWdhcmRsZXNzLlxuICAgIGlmICghbGFzdEJ1aWxkQ29udGV4dCkge1xuICAgICAgZW50cnkuc2hvdWxkQ29tcGlsZSA9IHRydWU7XG4gICAgfVxuICAgIC8vIE5vIG91cHV0IGZyb20gbGFzdCBleGVjdGlvbiwgZWl0aGVyIHRoaXMgaXMgYSBuZXcgZmlsZSwgb3IgdGhlIGZpbGVcbiAgICAvLyBmYWlsZWQgY29tcGlsZSBsYXN0IHRpbWUsIGVpdGhlciB3YXkgaXQgc2hvdWxkIGJlIHJlLWNvbXBpbGVkXG4gICAgZWxzZSBpZiAoIWxhc3RCdWlsZENvbnRleHQub3V0cHV0Lmhhc1NvdXJjZShmaWxlKSkge1xuICAgICAgVXRpbHMuZGJnKCkgJiYgVXRpbHMuZGVidWcoYFJlY29tcGlsZSAke2ZpbGV9IGJlY2F1c2UgaXQncyBuZXcgb3IgaXQgZmFpbGVkIGxhc3QgdGltZS5gKTtcbiAgICAgIGVudHJ5LnNob3VsZENvbXBpbGUgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIFdoZW4gY29tcGlsZSBpcyBza2lwcGVkLCBwcm9jZXNzb3IgbmVlZHMgb3V0cHV0IGZyb20gbGFzdCBidWlsZCB0b1xuICAgIC8vIGdlbmVyYXRlIGl0cyBvd24gb3V0cHV0XG4gICAgaWYgKGxhc3RCdWlsZENvbnRleHQpIHtcbiAgICAgIGVudHJ5Lmxhc3RPdXRwdXQgPSBsYXN0QnVpbGRDb250ZXh0Lm91dHB1dC5nZXRCeVNvdXJjZShmaWxlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZW50cnk7XG4gIH1cblxuICBiZWZvcmVCdWlsZCh0YXNrOiBUYXNrID0gbmV3IFRhc2soKSk6IHZvaWQge1xuICAgIHN1cGVyLmJlZm9yZUJ1aWxkKHRhc2spO1xuICAgIC8vIENvbXB1dGUgcmUtY29tcGlsZSBzb3VyY2VzXG4gICAgdGhpcy5yZWNvbXBpbGVTb3VyY2VzID0gWy4uLnRhc2sudmFsdWVzKCldXG4gICAgICAucmVkdWNlKChhbGwsIGJhdGNoKSA9PiBhbGwuY29uY2F0KFsuLi5iYXRjaF0pLCBbXSlcbiAgICAgIC5tYXAoZmlsZSA9PiB0aGlzLmZpbmRSZW9tcGlsZVNvdXJjZXMoZmlsZSkpXG4gICAgICAucmVkdWNlKChjYW5kcywgc291cmNlcykgPT4gVXRpbHMudW5pb24oY2FuZHMsIHNvdXJjZXMpLCBuZXcgU2V0KCkpO1xuXG4gICAgLy8gVXBkYXRlIGZpbGUgbGlzdCBhY2NvcmRpbmcgdG8gZmlsZSBzeXN0ZW0gdXBkYXRlXG4gICAgaWYgKHRhc2suaGFzKEVkaXRFdmVudC5BREQpKSB7XG4gICAgICB0YXNrLmdldChFZGl0RXZlbnQuQUREKS5mb3JFYWNoKGYgPT4gdGhpcy5ydWxlLmZpbGVzLmFkZChmKSk7XG4gICAgfVxuICAgIGlmICh0YXNrLmhhcyhFZGl0RXZlbnQuREVMKSkge1xuICAgICAgdGFzay5nZXQoRWRpdEV2ZW50LkRFTCkuZm9yRWFjaChmID0+IHRoaXMucnVsZS5maWxlcy5kZWxldGUoZikpO1xuICAgIH1cblxuICAgIC8vIFJlaW5pdGlhdGUgVFRTXG4gICAgaWYgKHRoaXMucnVsZS5maWxlcy5zaXplKSB7XG4gICAgICB0aGlzLnRhcmdldFRvU291cmNlcyA9IG5ldyBUYXJnZXRUb1NvdXJjZXMoKTtcbiAgICAgIHRoaXMucnVsZS5maWxlcy5mb3JFYWNoKGYgPT4gdGhpcy50YXJnZXRUb1NvdXJjZXMuc2V0KGYsIG5ldyBTZXQoW2ZdKSkpO1xuICAgICAgdGhpcy5zb3VyY2VUb1RhcmdldHMgPSB0aGlzLnRhcmdldFRvU291cmNlcy5mbGlwKCk7XG4gICAgfVxuICAgIHRoaXMubGFzdEJ1aWxkQ29udGV4dHMgPSB0aGlzLmNvbnRleHRzO1xuICAgIHRoaXMuY29udGV4dHMgPSBbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFuc2Zvcm0gcHJvY2Vzc29yIG91dHB1dCBhbmQgc2F2ZSBpdCBpbnRvIGNvbnRleHQuXG4gICAqIEBwYXJhbSBvdXRwdXQgUmVzdWx0cyByZXR1cm5lZCBieSBwcm9jZXNzb3IuXG4gICAqL1xuICBzYXZlT3V0cHV0KG91dHB1dDogUHJvY2Vzc29yT3V0cHV0KTogdm9pZCB7XG4gICAgc3VwZXIuc2F2ZU91dHB1dChvdXRwdXQpO1xuXG4gICAgbGV0IGNvbnRleHQgPSBVdGlscy5sYXN0RWxlbWVudCh0aGlzLmNvbnRleHRzKTtcblxuICAgIC8vIFVwZGF0ZSB0YXJnZXRUb1NvdXJjZXNNYXAgYW5kIHNvdXJjZVRvVGFyZ2V0c01hcFxuICAgIGNvbnRleHQudGFyZ2V0VG9Tb3VyY2VzLnRyYWNlKHRoaXMudGFyZ2V0VG9Tb3VyY2VzKTtcbiAgICB0aGlzLnRhcmdldFRvU291cmNlcyA9IGNvbnRleHQudGFyZ2V0VG9Tb3VyY2VzO1xuICAgIGNvbnRleHQuc291cmNlVG9UYXJnZXRzID0gdGhpcy5zb3VyY2VUb1RhcmdldHMgPSB0aGlzLnRhcmdldFRvU291cmNlcy5mbGlwKCk7XG5cbiAgICBpZiAoVXRpbHMuZGJnKCkpIHtcbiAgICAgIFV0aWxzLmRlYnVnKGAke3RoaXMubmFtZX06IFRUU2AsIHRoaXMudGFyZ2V0VG9Tb3VyY2VzKTtcbiAgICAgIFV0aWxzLmRlYnVnKGAke3RoaXMubmFtZX06IFNUVGAsIHRoaXMuc291cmNlVG9UYXJnZXRzKTtcbiAgICB9XG4gIH1cbn0iXX0=