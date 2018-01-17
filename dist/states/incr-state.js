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
    findReompileSources(file) {
        let targets = this.sourceToTargets.get(file) || new Set();
        let sources = new Set();
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
        return lastBuildContext ? lastBuildContext.workDir : super.nextRootDir();
    }
    processorInput(context, file) {
        let entry = new processor_models_1.ProcessorInputEntry(path.resolve(context.sourceDir, file), path.resolve(context.workDir, file), false, undefined);
        // Original source files in recompileSources should be compiled
        if (context.index === 0) {
            entry.shouldCompile = this.recompileSources.has(file);
        }
        // First build, or previous build didn't advance to this step, source should be
        // compiled regardless.
        let lastBuildContext = this.getLastBuildContext(context.index);
        if (!lastBuildContext) {
            entry.shouldCompile = true;
        }
        else if (!lastBuildContext.output.hasSource(file)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5jci1zdGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdGF0ZXMvaW5jci1zdGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZCQUE2QjtBQUM3QixtQ0FBZ0M7QUFDaEMsNERBQTZFO0FBQzdFLHdEQUFrRjtBQUNsRiwwQ0FBdUM7QUFDdkMsZ0VBQWlGO0FBRWpGLHNCQUE4QixTQUFRLGFBQUs7SUFxQnpDLFlBQVksR0FBZ0IsRUFBRSxJQUFVO1FBQ3RDLEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDakIsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLDhCQUFlLEVBQUUsQ0FBQztRQUM3QyxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksOEJBQWUsRUFBRSxDQUFDO1FBQzdDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ3BDLENBQUM7SUFFRDs7Ozs7Ozs7OztPQVVHO0lBQ0ssbUJBQW1CLENBQUMsSUFBWTtRQUN0QyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLEdBQUcsRUFBVSxDQUFDO1FBQ2xFLElBQUksT0FBTyxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7UUFDaEMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUM1QixzQkFBc0I7WUFDdEIsaUVBQWlFO1lBQ2pFLGtEQUFrRDtZQUNsRCxJQUFJLElBQUksR0FBRyxXQUFXLENBQUM7WUFDdkIsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDbkQsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFD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QyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFFLENBQUM7UUFDRCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUN2QyxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztJQUNyQixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsVUFBVSxDQUFDLE1BQXVCO1FBQ2hDLEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFekIsSUFBSSxPQUFPLEdBQUcsYUFBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFL0MsbURBQW1EO1FBQ25ELE9BQU8sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNwRCxJQUFJLENBQUMsZUFBZSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUM7UUFDL0MsT0FBTyxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFN0UsRUFBRSxDQUFDLENBQUMsYUFBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNoQixhQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksT0FBTyxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUN2RCxhQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksT0FBTyxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUN6RCxDQUFDO0lBQ0gsQ0FBQztDQUNGO0FBbEpELDRDQWtKQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBVdGlscyB9IGZyb20gJ34vdXRpbHMnO1xuaW1wb3J0IHsgRWRpdEV2ZW50LCBFbnZpcm9ubWVudCwgUnVsZSwgVGFzayB9IGZyb20gJ34vbW9kZWxzL2J1aWxkZXItbW9kZWxzJztcbmltcG9ydCB7IFRhcmdldFRvU291cmNlcywgU291cmNlVG9UYXJnZXRzLCBDb250ZXh0IH0gZnJvbSAnfi9tb2RlbHMvc3RhdGUtbW9kZWxzJztcbmltcG9ydCB7IFN0YXRlIH0gZnJvbSAnfi9zdGF0ZXMvc3RhdGUnO1xuaW1wb3J0IHsgUHJvY2Vzc29yT3V0cHV0LCBQcm9jZXNzb3JJbnB1dEVudHJ5IH0gZnJvbSAnfi9tb2RlbHMvcHJvY2Vzc29yLW1vZGVscyc7XG5cbmV4cG9ydCBjbGFzcyBJbmNyZW1lbnRhbFN0YXRlIGV4dGVuZHMgU3RhdGUge1xuICAvKipcbiAgICogMSB0byBNIG1hcHBpbmcsIGtleSBpcyB0aGUgdGFyZ2V0IGZpbGUsIHZhbHVlIGlzIGEgc2V0IG9mIHNvdXJjZVxuICAgKiBmaWxlcyB3aGljaCBjb21wb3NlIHRoZSB0YXJnZXQgZmlsZVxuICAgKi9cbiAgdGFyZ2V0VG9Tb3VyY2VzOiBUYXJnZXRUb1NvdXJjZXM7XG4gIC8qKlxuICAgKiAxIHRvIE0gbWFwcGluZywga2V5IGlzIHRoZSBzb3VyY2UgZmlsZSwgdmFsdWUgaXMgYSBzZXQgb2YgdGFyZ2V0XG4gICAqIGZpbGVzIHdoaWNoIGNvbnRhaW4gdGhlIHNvdXJjZSBmaWxlXG4gICAqL1xuICBzb3VyY2VUb1RhcmdldHM6IFNvdXJjZVRvVGFyZ2V0cztcbiAgLyoqXG4gICAqIFRoaXMgaXMgYSBzZXQgb2Ygc291cmNlcyB0aGF0IHNob3VsZCBiZSBmb3JjZWQgdG8gcmUtY29tcGlsZSBpbiB0aGVcbiAgICogbmV4dCBpbmNyZW1lbnRhbCBidWlsZFxuICAgKi9cbiAgcmVjb21waWxlU291cmNlczogU2V0PHN0cmluZz47XG4gIC8qKlxuICAgKiBDb25ldHh0IGxpc3QgZnJvbSB0aGUgbGFzdCBidWlsZFxuICAgKi9cbiAgbGFzdEJ1aWxkQ29udGV4dHM6IENvbnRleHRbXTtcblxuICBjb25zdHJ1Y3RvcihlbnY6IEVudmlyb25tZW50LCBydWxlOiBSdWxlKSB7XG4gICAgc3VwZXIoZW52LCBydWxlKTtcbiAgICB0aGlzLnRhcmdldFRvU291cmNlcyA9IG5ldyBUYXJnZXRUb1NvdXJjZXMoKTtcbiAgICB0aGlzLnNvdXJjZVRvVGFyZ2V0cyA9IG5ldyBTb3VyY2VUb1RhcmdldHMoKTtcbiAgICB0aGlzLnJlY29tcGlsZVNvdXJjZXMgPSBuZXcgU2V0KCk7XG4gIH1cblxuICAvKipcbiAgICogRmluZCBmaWxlcyByZXF1cmluZyByZS1jb21waWxlIHdoZW4gdGhlIGdpdmVuIGZpbGUgY2hhbmdlZC5cbiAgICogRmlyc3QgZmluZCB0aGUgdGFyZ2V0cyBhZmZlY3RlZCBieSB0aGUgY2hhbmdlZCBmaWxlLCB0aGVuIGJhY2t0cmFjayBlYWNoXG4gICAqIGV4ZWN1dGlvbiBjb250ZXh0LCBmaW5kIHRoZSBvcmlnaW5hbCBzb3VyY2Ugb2YgZWFjaCB0YXJnZXQuXG4gICAqXG4gICAqIEZpbGUgYWRkaXRpb25zIHdpbGwgZmFsbCB0aHJvdWdoLCBidXQgY2F1Z2h0IGxhdGVyIGluXG4gICAqIFtwcm9jZXNzb3JJbnB1dCgpXXtAbGluayBJbmNyZW1lbnRhbFN0YXRlI3Byb2Nlc3NvcklucHV0fVxuICAgKlxuICAgKiBAcGFyYW0gZmlsZSBUaGUgYWRkZWQvdXBkYXRlZC9kZWxldGVkIGZpbGUuXG4gICAqIEByZXR1cm5zIExpc3Qgb2YgZmlsZXMgcmVxdWlyaW5nIHJlLWNvbXBpbGUuXG4gICAqL1xuICBwcml2YXRlIGZpbmRSZW9tcGlsZVNvdXJjZXMoZmlsZTogc3RyaW5nKTogU2V0PHN0cmluZz4ge1xuICAgIGxldCB0YXJnZXRzID0gdGhpcy5zb3VyY2VUb1RhcmdldHMuZ2V0KGZpbGUpIHx8IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgIGxldCBzb3VyY2VzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgdGFyZ2V0cy5mb3JFYWNoKGZpbmFsVGFyZ2V0ID0+IHtcbiAgICAgIC8vIEJhY2t0cmFja2luZyBzb3VyY2VcbiAgICAgIC8vIFRPRE86IFRoaXMgbWlnaHQgYmUgdW5uY2VjZXNzYXJ5IHRob3VnaCwgdGhlIGtleSBvZiB0aGUgb3V0cHV0XG4gICAgICAvLyBtYXAgaXMgdGhlIG9yaWdpbmFsIHNvdXJjZSAobmVlZHMgY29uZmlybWF0aW9uKVxuICAgICAgbGV0IGZpbGUgPSBmaW5hbFRhcmdldDtcbiAgICAgIGZvciAobGV0IGkgPSB0aGlzLmNvbnRleHRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIGxldCBjb250ZXh0ID0gdGhpcy5jb250ZXh0c1tpXTtcbiAgICAgICAgZmlsZSA9IGNvbnRleHQub3V0cHV0LmdldEJ5VGFyZ2V0KGZpbGUpLnNvdXJjZTtcbiAgICAgICAgZmlsZSA9IHBhdGgucmVsYXRpdmUoY29udGV4dC5zb3VyY2VEaXIsIGZpbGUpO1xuICAgICAgfVxuICAgICAgc291cmNlcy5hZGQoZmlsZSk7XG4gICAgfSk7XG4gICAgVXRpbHMuZGJnKCkgJiYgVXRpbHMuZGVidWcoJ1JlLWNvbXBpbGUgY2FuZGlkYXRlczonLCBzb3VyY2VzKTtcbiAgICByZXR1cm4gc291cmNlcztcbiAgfVxuXG4gIHByaXZhdGUgZ2V0TGFzdEJ1aWxkQ29udGV4dChpbmRleDogbnVtYmVyKTogQ29udGV4dCB7XG4gICAgcmV0dXJuIHRoaXMubGFzdEJ1aWxkQ29udGV4dHMgPyB0aGlzLmxhc3RCdWlsZENvbnRleHRzW2luZGV4XSA6IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHByb3RlY3RlZCBuZXh0Um9vdERpcigpOiBzdHJpbmcge1xuICAgIC8vIEF0IHRoaXMgcG9pbnQsIG5ldyBjb250ZXh0IGhhc24ndCBiZWVuIHB1c2hlZCB0byB0aGlzLmNvbnRleHRzLFxuICAgIC8vIHNvIGluZGV4IHNob3VsZCBiZSBjb250ZXh0IGxlbmd0aCB3aXRob3V0IG1pbnVzIG9uZVxuICAgIGxldCBsYXN0QnVpbGRDb250ZXh0ID0gdGhpcy5nZXRMYXN0QnVpbGRDb250ZXh0KHRoaXMuY29udGV4dHMubGVuZ3RoKTtcbiAgICByZXR1cm4gbGFzdEJ1aWxkQ29udGV4dCA/IGxhc3RCdWlsZENvbnRleHQud29ya0RpciA6IHN1cGVyLm5leHRSb290RGlyKCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgcHJvY2Vzc29ySW5wdXQoY29udGV4dDogQ29udGV4dCwgZmlsZTogc3RyaW5nKTogUHJvY2Vzc29ySW5wdXRFbnRyeSB7XG4gICAgbGV0IGVudHJ5ID0gbmV3IFByb2Nlc3NvcklucHV0RW50cnkoXG4gICAgICBwYXRoLnJlc29sdmUoY29udGV4dC5zb3VyY2VEaXIsIGZpbGUpLFxuICAgICAgcGF0aC5yZXNvbHZlKGNvbnRleHQud29ya0RpciwgZmlsZSksXG4gICAgICBmYWxzZSxcbiAgICAgIHVuZGVmaW5lZFxuICAgICk7XG5cbiAgICAvLyBPcmlnaW5hbCBzb3VyY2UgZmlsZXMgaW4gcmVjb21waWxlU291cmNlcyBzaG91bGQgYmUgY29tcGlsZWRcbiAgICBpZiAoY29udGV4dC5pbmRleCA9PT0gMCkge1xuICAgICAgZW50cnkuc2hvdWxkQ29tcGlsZSA9IHRoaXMucmVjb21waWxlU291cmNlcy5oYXMoZmlsZSk7XG4gICAgfVxuICAgIC8vIEZpcnN0IGJ1aWxkLCBvciBwcmV2aW91cyBidWlsZCBkaWRuJ3QgYWR2YW5jZSB0byB0aGlzIHN0ZXAsIHNvdXJjZSBzaG91bGQgYmVcbiAgICAvLyBjb21waWxlZCByZWdhcmRsZXNzLlxuICAgIGxldCBsYXN0QnVpbGRDb250ZXh0ID0gdGhpcy5nZXRMYXN0QnVpbGRDb250ZXh0KGNvbnRleHQuaW5kZXgpO1xuICAgIGlmICghbGFzdEJ1aWxkQ29udGV4dCkge1xuICAgICAgZW50cnkuc2hvdWxkQ29tcGlsZSA9IHRydWU7XG4gICAgfVxuICAgIC8vIE5vIG91cHV0IGZyb20gbGFzdCBleGVjdGlvbiwgZWl0aGVyIHRoaXMgaXMgYSBuZXcgZmlsZSwgb3IgdGhlIGZpbGVcbiAgICAvLyBmYWlsZWQgY29tcGlsZSBsYXN0IHRpbWUsIGVpdGhlciB3YXkgaXQgc2hvdWxkIGJlIHJlLWNvbXBpbGVkXG4gICAgZWxzZSBpZiAoIWxhc3RCdWlsZENvbnRleHQub3V0cHV0Lmhhc1NvdXJjZShmaWxlKSkge1xuICAgICAgZW50cnkuc2hvdWxkQ29tcGlsZSA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gV2hlbiBjb21waWxlIGlzIHNraXBwZWQsIHByb2Nlc3NvciBuZWVkcyBvdXRwdXQgZnJvbSBsYXN0IGJ1aWxkIHRvXG4gICAgLy8gZ2VuZXJhdGUgaXRzIG93biBvdXRwdXRcbiAgICBpZiAobGFzdEJ1aWxkQ29udGV4dCkge1xuICAgICAgZW50cnkubGFzdE91dHB1dCA9IGxhc3RCdWlsZENvbnRleHQub3V0cHV0LmdldEJ5U291cmNlKGZpbGUpO1xuICAgIH1cblxuICAgIHJldHVybiBlbnRyeTtcbiAgfVxuXG4gIGJlZm9yZUJ1aWxkKHRhc2s6IFRhc2sgPSBuZXcgVGFzaygpKTogdm9pZCB7XG4gICAgc3VwZXIuYmVmb3JlQnVpbGQodGFzayk7XG4gICAgLy8gQ29tcHV0ZSByZS1jb21waWxlIHNvdXJjZXNcbiAgICB0aGlzLnJlY29tcGlsZVNvdXJjZXMgPSBbLi4udGFzay52YWx1ZXMoKV1cbiAgICAgIC5yZWR1Y2UoKGFsbCwgYmF0Y2gpID0+IGFsbC5jb25jYXQoWy4uLmJhdGNoXSksIFtdKVxuICAgICAgLm1hcChmaWxlID0+IHRoaXMuZmluZFJlb21waWxlU291cmNlcyhmaWxlKSlcbiAgICAgIC5yZWR1Y2UoKGNhbmRzLCBzb3VyY2VzKSA9PiBVdGlscy51bmlvbihjYW5kcywgc291cmNlcyksIG5ldyBTZXQoKSk7XG5cbiAgICAvLyBVcGRhdGUgZmlsZSBsaXN0IGFjY29yZGluZyB0byBmaWxlIHN5c3RlbSB1cGRhdGVcbiAgICBpZiAodGFzay5oYXMoRWRpdEV2ZW50LkFERCkpIHtcbiAgICAgIHRhc2suZ2V0KEVkaXRFdmVudC5BREQpLmZvckVhY2goZiA9PiB0aGlzLnJ1bGUuZmlsZXMuYWRkKGYpKTtcbiAgICB9XG4gICAgaWYgKHRhc2suaGFzKEVkaXRFdmVudC5ERUwpKSB7XG4gICAgICB0YXNrLmdldChFZGl0RXZlbnQuREVMKS5mb3JFYWNoKGYgPT4gdGhpcy5ydWxlLmZpbGVzLmRlbGV0ZShmKSk7XG4gICAgfVxuXG4gICAgLy8gUmVpbml0aWF0ZSBUVFNcbiAgICBpZiAodGhpcy5ydWxlLmZpbGVzLnNpemUpIHtcbiAgICAgIHRoaXMudGFyZ2V0VG9Tb3VyY2VzID0gbmV3IFRhcmdldFRvU291cmNlcygpO1xuICAgICAgdGhpcy5ydWxlLmZpbGVzLmZvckVhY2goZiA9PiB0aGlzLnRhcmdldFRvU291cmNlcy5zZXQoZiwgbmV3IFNldChbZl0pKSk7XG4gICAgfVxuICAgIHRoaXMubGFzdEJ1aWxkQ29udGV4dHMgPSB0aGlzLmNvbnRleHRzO1xuICAgIHRoaXMuY29udGV4dHMgPSBbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFuc2Zvcm0gcHJvY2Vzc29yIG91dHB1dCBhbmQgc2F2ZSBpdCBpbnRvIGNvbnRleHQuXG4gICAqIEBwYXJhbSBvdXRwdXQgUmVzdWx0cyByZXR1cm5lZCBieSBwcm9jZXNzb3IuXG4gICAqL1xuICBzYXZlT3V0cHV0KG91dHB1dDogUHJvY2Vzc29yT3V0cHV0KTogdm9pZCB7XG4gICAgc3VwZXIuc2F2ZU91dHB1dChvdXRwdXQpO1xuXG4gICAgbGV0IGNvbnRleHQgPSBVdGlscy5sYXN0RWxlbWVudCh0aGlzLmNvbnRleHRzKTtcblxuICAgIC8vIFVwZGF0ZSB0YXJnZXRUb1NvdXJjZXNNYXAgYW5kIHNvdXJjZVRvVGFyZ2V0c01hcFxuICAgIGNvbnRleHQudGFyZ2V0VG9Tb3VyY2VzLnRyYWNlKHRoaXMudGFyZ2V0VG9Tb3VyY2VzKTtcbiAgICB0aGlzLnRhcmdldFRvU291cmNlcyA9IGNvbnRleHQudGFyZ2V0VG9Tb3VyY2VzO1xuICAgIGNvbnRleHQuc291cmNlVG9UYXJnZXRzID0gdGhpcy5zb3VyY2VUb1RhcmdldHMgPSB0aGlzLnRhcmdldFRvU291cmNlcy5mbGlwKCk7XG5cbiAgICBpZiAoVXRpbHMuZGJnKCkpIHtcbiAgICAgIFV0aWxzLmRlYnVnKGAke3RoaXMubmFtZX06IFRUU2AsIHRoaXMudGFyZ2V0VG9Tb3VyY2VzKTtcbiAgICAgIFV0aWxzLmRlYnVnKGAke3RoaXMubmFtZX06IFNUVGAsIHRoaXMuc291cmNlVG9UYXJnZXRzKTtcbiAgICB9XG4gIH1cbn0iXX0=