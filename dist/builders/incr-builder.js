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
const path = require("path");
const chokidar = require("chokidar");
const utils_1 = require("~/utils");
const builder_1 = require("~/builders/builder");
const incr_state_1 = require("~/states/incr-state");
const builder_models_1 = require("~/models/builder-models");
const BUILD_DELAY = 250;
const CHOKIDAR_OPTIONS = {
    persistent: true,
    ignoreInitial: true,
    followSymlinks: true,
    usePolling: false,
    atomic: 250,
    alwaysStat: false,
    awaitWriteFinish: true
};
class IncrementalBuilder extends builder_1.Builder {
    constructor(rootDir, workDir, userFile, defaults) {
        super(rootDir, workDir, userFile, defaults);
        this.stateClass = incr_state_1.IncrementalState;
        this.buildPromise = Promise.resolve();
        this.editQueues = new Map();
        this.ruleToState = new Map();
    }
    shouldIgnore(file) {
        let rel = path.relative(this.env.sourceDir, file);
        let rule = this.matchRule(this.env.config, rel);
        let ignore = !rule || !rule.processors.length;
        ignore && utils_1.Utils.dbg() && utils_1.Utils.debug(`${this.name}: Ignore`, file);
        return ignore;
    }
    watchReady() {
        utils_1.Utils.info('Listening to file changes, press CTRL+C to exit.');
    }
    watchError(ex) {
        utils_1.Utils.warn('Error happened in file watcher, rebuild may fix it.', ex);
    }
    triggerBuild() {
        // Already triggered
        if (this.buildDelayTimeout !== undefined)
            return;
        this.buildDelayTimeout = setTimeout(() => this.buildPromise.then(() => {
            this.incremental();
            this.buildDelayTimeout = undefined;
        }), BUILD_DELAY);
    }
    intake(action, file) {
        let relative = path.relative(this.env.sourceDir, file);
        let queue = this.editQueues.get(relative) || new builder_models_1.EditQueue();
        queue.push(action);
        this.editQueues.set(relative, queue);
        utils_1.Utils.info(action, file);
        this.triggerBuild();
    }
    /**
     * Generate a map from updates. Key of the map is an State instance, value
     * the updated files.
     * @param {Object} Updates
     * @returns {Map<State, Object>} Tasks
     */
    generateTasks(updates) {
        let tasks = new Map();
        updates.forEach((event, file) => {
            let rule = this.fileToRule.get(file);
            if (!rule) {
                rule = this.matchRule(this.env.config, file);
                // When the file is deleted, it's not removed from fileRuleMap,
                // this is a feature, because if the file is later added again,
                // disk operations can be avoided.
                this.fileToRule.set(file, rule);
                utils_1.Utils.info(`${file} matched ${rule.sources}`);
            }
            let state = this.ruleToState.get(rule);
            let task = tasks.get(state) || new builder_models_1.Task();
            let files = task.get(event) || new Set();
            files.add(file);
            task.set(event, files);
            tasks.set(state, task);
        });
        return tasks;
    }
    incremental() {
        return __awaiter(this, void 0, void 0, function* () {
            let resolve;
            this.buildPromise = new Promise(r => resolve = r);
            let updates = new Map();
            this.editQueues.forEach((queue, file) => {
                let event = queue.reduce();
                if (event)
                    updates.set(file, event);
            });
            this.editQueues = new Map();
            let tasks = this.generateTasks(updates);
            if (utils_1.Utils.dbg()) {
                tasks.forEach((task, state) => utils_1.Utils.debug(`Build tasks for ${state.getRule().sources}`, task));
            }
            let success = true;
            let entries = Array.from(tasks.entries());
            yield Promise.all(entries.map(([state, task]) => __awaiter(this, void 0, void 0, function* () {
                let rule = state.getRule();
                state.beforeBuild(task);
                success = (yield this.invokeProcessors(rule, state)) && success;
                state.afterBuild();
            })));
            yield utils_1.Utils.cleanDirectory(this.env.targetDir, this.getAllTargets())
                .then(() => utils_1.Utils.info(`Build ${success ? 'COMPLETED' : 'INCOMPLETE'}`))
                .catch(ex => utils_1.Utils.error('Error happened during cleanup', ex));
            resolve();
        });
    }
    build() {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            yield _super("build").call(this);
            this.states.forEach(s => this.ruleToState.set(s.getRule(), s));
            this.watcher = chokidar.watch(this.env.sourceDir, Object.assign({}, CHOKIDAR_OPTIONS, { ignored: this.shouldIgnore.bind(this) }));
            this.watcher
                .on('ready', () => this.watchReady())
                .on('error', ex => this.watchError(ex))
                .on('add', p => this.intake(builder_models_1.EditEvent.ADD, p))
                .on('unlink', p => this.intake(builder_models_1.EditEvent.DEL, p))
                .on('change', p => this.intake(builder_models_1.EditEvent.CHG, p));
            return new Promise(resolve => this.exitPromiseResolve = resolve);
        });
    }
    exit() {
        this.watcher && this.watcher.close();
        this.buildPromise.then(() => this.exitPromiseResolve());
    }
}
exports.IncrementalBuilder = IncrementalBuilder;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5jci1idWlsZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2J1aWxkZXJzL2luY3ItYnVpbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsNkJBQTZCO0FBQzdCLHFDQUFxQztBQUNyQyxtQ0FBZ0M7QUFDaEMsZ0RBQTZDO0FBRTdDLG9EQUF1RDtBQUN2RCw0REFBMkU7QUFFM0UsTUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDO0FBRXhCLE1BQU0sZ0JBQWdCLEdBQUc7SUFDdkIsVUFBVSxFQUFFLElBQUk7SUFDaEIsYUFBYSxFQUFFLElBQUk7SUFDbkIsY0FBYyxFQUFFLElBQUk7SUFDcEIsVUFBVSxFQUFFLEtBQUs7SUFDakIsTUFBTSxFQUFFLEdBQUc7SUFDWCxVQUFVLEVBQUUsS0FBSztJQUNqQixnQkFBZ0IsRUFBRSxJQUFJO0NBQ3ZCLENBQUM7QUFFRix3QkFBZ0MsU0FBUSxpQkFBTztJQWlCN0MsWUFBWSxPQUFPLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRO1FBQzlDLEtBQUssQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUU1QyxJQUFJLENBQUMsVUFBVSxHQUFHLDZCQUFnQixDQUFDO1FBQ25DLElBQUksQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3RDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUM1QixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7SUFDL0IsQ0FBQztJQUVPLFlBQVksQ0FBQyxJQUFZO1FBQy9CLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbEQsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJ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RUFBRSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUM7SUFDMUQsQ0FBQztDQUNGO0FBbEpELGdEQWtKQztBQUFBLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgY2hva2lkYXIgZnJvbSAnY2hva2lkYXInO1xuaW1wb3J0IHsgVXRpbHMgfSBmcm9tICd+L3V0aWxzJztcbmltcG9ydCB7IEJ1aWxkZXIgfSBmcm9tICd+L2J1aWxkZXJzL2J1aWxkZXInO1xuaW1wb3J0IHsgU3RhdGUgfSBmcm9tICd+L3N0YXRlcy9zdGF0ZSc7XG5pbXBvcnQgeyBJbmNyZW1lbnRhbFN0YXRlIH0gZnJvbSAnfi9zdGF0ZXMvaW5jci1zdGF0ZSc7XG5pbXBvcnQgeyBSdWxlLCBUYXNrLCBFZGl0RXZlbnQsIEVkaXRRdWV1ZSB9IGZyb20gJ34vbW9kZWxzL2J1aWxkZXItbW9kZWxzJztcblxuY29uc3QgQlVJTERfREVMQVkgPSAyNTA7XG5cbmNvbnN0IENIT0tJREFSX09QVElPTlMgPSB7XG4gIHBlcnNpc3RlbnQ6IHRydWUsXG4gIGlnbm9yZUluaXRpYWw6IHRydWUsXG4gIGZvbGxvd1N5bWxpbmtzOiB0cnVlLFxuICB1c2VQb2xsaW5nOiBmYWxzZSxcbiAgYXRvbWljOiAyNTAsXG4gIGFsd2F5c1N0YXQ6IGZhbHNlLFxuICBhd2FpdFdyaXRlRmluaXNoOiB0cnVlXG59O1xuXG5leHBvcnQgY2xhc3MgSW5jcmVtZW50YWxCdWlsZGVyIGV4dGVuZHMgQnVpbGRlciB7XG4gIHByaXZhdGUgZWRpdFF1ZXVlczogTWFwPHN0cmluZywgRWRpdFF1ZXVlPjtcbiAgcHJpdmF0ZSB3YXRjaGVyOiBhbnk7XG4gIHByaXZhdGUgcnVsZVRvU3RhdGU6IE1hcDxSdWxlLCBTdGF0ZT47XG4gIC8qKlxuICAgKiBDcmVhdGVkIHdoZW4gYnVpbGQgc3RhcnRzLCByZXNvbHZlZCB3aGVuIGJ1aWxkIGVuZHNcbiAgICovXG4gIHByaXZhdGUgYnVpbGRQcm9taXNlOiBQcm9taXNlPHZvaWQ+O1xuICAvKipcbiAgICogUmVzb2x2ZWQgd2hlbiBpbnRlcnJ1cHRpb24gKGkuZS4sIENUUkwrQykgaXMgcmVjZWl2ZWRcbiAgICovXG4gIHByaXZhdGUgZXhpdFByb21pc2VSZXNvbHZlOiBGdW5jdGlvbjtcbiAgLyoqXG4gICAqIHNldFRpbWVvdXQgaGFuZGxlIGZvciBidWlsZCBkZWxheVxuICAgKi9cbiAgcHJpdmF0ZSBidWlsZERlbGF5VGltZW91dDogTm9kZUpTLlRpbWVyO1xuXG4gIGNvbnN0cnVjdG9yKHJvb3REaXIsIHdvcmtEaXIsIHVzZXJGaWxlLCBkZWZhdWx0cykge1xuICAgIHN1cGVyKHJvb3REaXIsIHdvcmtEaXIsIHVzZXJGaWxlLCBkZWZhdWx0cyk7XG5cbiAgICB0aGlzLnN0YXRlQ2xhc3MgPSBJbmNyZW1lbnRhbFN0YXRlO1xuICAgIHRoaXMuYnVpbGRQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgdGhpcy5lZGl0UXVldWVzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMucnVsZVRvU3RhdGUgPSBuZXcgTWFwKCk7XG4gIH1cblxuICBwcml2YXRlIHNob3VsZElnbm9yZShmaWxlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBsZXQgcmVsID0gcGF0aC5yZWxhdGl2ZSh0aGlzLmVudi5zb3VyY2VEaXIsIGZpbGUpO1xuICAgIGxldCBydWxlID0gdGhpcy5tYXRjaFJ1bGUodGhpcy5lbnYuY29uZmlnLCByZWwpO1xuICAgIGxldCBpZ25vcmUgPSAhcnVsZSB8fCAhcnVsZS5wcm9jZXNzb3JzLmxlbmd0aDtcbiAgICBpZ25vcmUgJiYgVXRpbHMuZGJnKCkgJiYgVXRpbHMuZGVidWcoYCR7dGhpcy5uYW1lfTogSWdub3JlYCwgZmlsZSk7XG4gICAgcmV0dXJuIGlnbm9yZTtcbiAgfVxuXG4gIHByaXZhdGUgd2F0Y2hSZWFkeSgpOiB2b2lkIHtcbiAgICBVdGlscy5pbmZvKCdMaXN0ZW5pbmcgdG8gZmlsZSBjaGFuZ2VzLCBwcmVzcyBDVFJMK0MgdG8gZXhpdC4nKTtcbiAgfVxuXG4gIHByaXZhdGUgd2F0Y2hFcnJvcihleDogYW55KTogdm9pZCB7XG4gICAgVXRpbHMud2FybignRXJyb3IgaGFwcGVuZWQgaW4gZmlsZSB3YXRjaGVyLCByZWJ1aWxkIG1heSBmaXggaXQuJywgZXgpO1xuICB9XG5cbiAgcHJpdmF0ZSB0cmlnZ2VyQnVpbGQoKTogdm9pZCB7XG4gICAgLy8gQWxyZWFkeSB0cmlnZ2VyZWRcbiAgICBpZiAodGhpcy5idWlsZERlbGF5VGltZW91dCAhPT0gdW5kZWZpbmVkKSByZXR1cm47XG5cbiAgICB0aGlzLmJ1aWxkRGVsYXlUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PlxuICAgICAgdGhpcy5idWlsZFByb21pc2UudGhlbigoKSA9PiB7XG4gICAgICAgIHRoaXMuaW5jcmVtZW50YWwoKTtcbiAgICAgICAgdGhpcy5idWlsZERlbGF5VGltZW91dCA9IHVuZGVmaW5lZDtcbiAgICAgIH0pLFxuICAgICAgQlVJTERfREVMQVlcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBpbnRha2UoYWN0aW9uOiBFZGl0RXZlbnQsIGZpbGU6IHN0cmluZyk6IHZvaWQge1xuICAgIGxldCByZWxhdGl2ZTogc3RyaW5nID0gcGF0aC5yZWxhdGl2ZSh0aGlzLmVudi5zb3VyY2VEaXIsIGZpbGUpO1xuICAgIGxldCBxdWV1ZTogRWRpdFF1ZXVlID0gdGhpcy5lZGl0UXVldWVzLmdldChyZWxhdGl2ZSkgfHwgbmV3IEVkaXRRdWV1ZSgpO1xuICAgIHF1ZXVlLnB1c2goYWN0aW9uKTtcbiAgICB0aGlzLmVkaXRRdWV1ZXMuc2V0KHJlbGF0aXZlLCBxdWV1ZSk7XG4gICAgVXRpbHMuaW5mbyhhY3Rpb24sIGZpbGUpO1xuICAgIHRoaXMudHJpZ2dlckJ1aWxkKCk7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSBtYXAgZnJvbSB1cGRhdGVzLiBLZXkgb2YgdGhlIG1hcCBpcyBhbiBTdGF0ZSBpbnN0YW5jZSwgdmFsdWVcbiAgICogdGhlIHVwZGF0ZWQgZmlsZXMuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBVcGRhdGVzXG4gICAqIEByZXR1cm5zIHtNYXA8U3RhdGUsIE9iamVjdD59IFRhc2tzXG4gICAqL1xuICBwcml2YXRlIGdlbmVyYXRlVGFza3ModXBkYXRlczogTWFwPHN0cmluZywgRWRpdEV2ZW50Pik6IE1hcDxTdGF0ZSwgVGFzaz4ge1xuICAgIGxldCB0YXNrczogTWFwPFN0YXRlLCBUYXNrPiA9IG5ldyBNYXAoKTtcbiAgICB1cGRhdGVzLmZvckVhY2goKGV2ZW50LCBmaWxlKSA9PiB7XG4gICAgICBsZXQgcnVsZTogUnVsZSA9IHRoaXMuZmlsZVRvUnVsZS5nZXQoZmlsZSk7XG4gICAgICBpZiAoIXJ1bGUpIHtcbiAgICAgICAgcnVsZSA9IHRoaXMubWF0Y2hSdWxlKHRoaXMuZW52LmNvbmZpZywgZmlsZSk7XG4gICAgICAgIC8vIFdoZW4gdGhlIGZpbGUgaXMgZGVsZXRlZCwgaXQncyBub3QgcmVtb3ZlZCBmcm9tIGZpbGVSdWxlTWFwLFxuICAgICAgICAvLyB0aGlzIGlzIGEgZmVhdHVyZSwgYmVjYXVzZSBpZiB0aGUgZmlsZSBpcyBsYXRlciBhZGRlZCBhZ2FpbixcbiAgICAgICAgLy8gZGlzayBvcGVyYXRpb25zIGNhbiBiZSBhdm9pZGVkLlxuICAgICAgICB0aGlzLmZpbGVUb1J1bGUuc2V0KGZpbGUsIHJ1bGUpO1xuICAgICAgICBVdGlscy5pbmZvKGAke2ZpbGV9IG1hdGNoZWQgJHtydWxlLnNvdXJjZXN9YCk7XG4gICAgICB9XG4gICAgICBsZXQgc3RhdGU6IFN0YXRlID0gdGhpcy5ydWxlVG9TdGF0ZS5nZXQocnVsZSk7XG4gICAgICBsZXQgdGFzazogVGFzayA9IHRhc2tzLmdldChzdGF0ZSkgfHwgbmV3IFRhc2soKTtcbiAgICAgIGxldCBmaWxlczogU2V0PHN0cmluZz4gPSB0YXNrLmdldChldmVudCkgfHwgbmV3IFNldCgpO1xuICAgICAgZmlsZXMuYWRkKGZpbGUpO1xuICAgICAgdGFzay5zZXQoZXZlbnQsIGZpbGVzKTtcbiAgICAgIHRhc2tzLnNldChzdGF0ZSwgdGFzayk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRhc2tzO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBpbmNyZW1lbnRhbCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsZXQgcmVzb2x2ZTogRnVuY3Rpb247XG4gICAgdGhpcy5idWlsZFByb21pc2UgPSBuZXcgUHJvbWlzZShyID0+IHJlc29sdmUgPSByKTtcblxuICAgIGxldCB1cGRhdGVzOiBNYXA8c3RyaW5nLCBFZGl0RXZlbnQ+ID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuZWRpdFF1ZXVlcy5mb3JFYWNoKChxdWV1ZSwgZmlsZSkgPT4ge1xuICAgICAgbGV0IGV2ZW50OiBFZGl0RXZlbnQgPSBxdWV1ZS5yZWR1Y2UoKTtcbiAgICAgIGlmIChldmVudCkgdXBkYXRlcy5zZXQoZmlsZSwgZXZlbnQpO1xuICAgIH0pO1xuICAgIHRoaXMuZWRpdFF1ZXVlcyA9IG5ldyBNYXAoKTtcblxuICAgIGxldCB0YXNrcyA9IHRoaXMuZ2VuZXJhdGVUYXNrcyh1cGRhdGVzKTtcbiAgICBpZiAoVXRpbHMuZGJnKCkpIHtcbiAgICAgIHRhc2tzLmZvckVhY2goKHRhc2ssIHN0YXRlKSA9PiBVdGlscy5kZWJ1ZyhgQnVpbGQgdGFza3MgZm9yICR7c3RhdGUuZ2V0UnVsZSgpLnNvdXJjZXN9YCwgdGFzaykpO1xuICAgIH1cblxuICAgIGxldCBzdWNjZXNzID0gdHJ1ZTtcbiAgICBsZXQgZW50cmllcyA9IEFycmF5LmZyb20odGFza3MuZW50cmllcygpKTtcbiAgICBhd2FpdCBQcm9taXNlLmFsbChlbnRyaWVzLm1hcChhc3luYyAoW3N0YXRlLCB0YXNrXSkgPT4ge1xuICAgICAgbGV0IHJ1bGUgPSBzdGF0ZS5nZXRSdWxlKCk7XG4gICAgICBzdGF0ZS5iZWZvcmVCdWlsZCh0YXNrKTtcbiAgICAgIHN1Y2Nlc3MgPSBhd2FpdCB0aGlzLmludm9rZVByb2Nlc3NvcnMocnVsZSwgc3RhdGUpICYmIHN1Y2Nlc3M7XG4gICAgICBzdGF0ZS5hZnRlckJ1aWxkKCk7XG4gICAgfSkpO1xuXG4gICAgYXdhaXQgVXRpbHMuY2xlYW5EaXJlY3RvcnkodGhpcy5lbnYudGFyZ2V0RGlyLCB0aGlzLmdldEFsbFRhcmdldHMoKSlcbiAgICAgIC50aGVuKCgpID0+IFV0aWxzLmluZm8oYEJ1aWxkICR7c3VjY2VzcyA/ICdDT01QTEVURUQnIDogJ0lOQ09NUExFVEUnfWApKVxuICAgICAgLmNhdGNoKGV4ID0+IFV0aWxzLmVycm9yKCdFcnJvciBoYXBwZW5lZCBkdXJpbmcgY2xlYW51cCcsIGV4KSk7XG4gICAgcmVzb2x2ZSgpO1xuICB9XG5cbiAgYXN5bmMgYnVpbGQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgc3VwZXIuYnVpbGQoKTtcbiAgICB0aGlzLnN0YXRlcy5mb3JFYWNoKHMgPT4gdGhpcy5ydWxlVG9TdGF0ZS5zZXQocy5nZXRSdWxlKCksIHMpKTtcblxuICAgIHRoaXMud2F0Y2hlciA9IGNob2tpZGFyLndhdGNoKHRoaXMuZW52LnNvdXJjZURpciwge1xuICAgICAgLi4uQ0hPS0lEQVJfT1BUSU9OUyxcbiAgICAgIGlnbm9yZWQ6IHRoaXMuc2hvdWxkSWdub3JlLmJpbmQodGhpcylcbiAgICB9KTtcblxuICAgIHRoaXMud2F0Y2hlclxuICAgICAgLm9uKCdyZWFkeScsICgpID0+IHRoaXMud2F0Y2hSZWFkeSgpKVxuICAgICAgLm9uKCdlcnJvcicsIGV4ID0+IHRoaXMud2F0Y2hFcnJvcihleCkpXG4gICAgICAub24oJ2FkZCcsIHAgPT4gdGhpcy5pbnRha2UoRWRpdEV2ZW50LkFERCwgcCkpXG4gICAgICAub24oJ3VubGluaycsIHAgPT4gdGhpcy5pbnRha2UoRWRpdEV2ZW50LkRFTCwgcCkpXG4gICAgICAub24oJ2NoYW5nZScsIHAgPT4gdGhpcy5pbnRha2UoRWRpdEV2ZW50LkNIRywgcCkpO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KHJlc29sdmUgPT4gdGhpcy5leGl0UHJvbWlzZVJlc29sdmUgPSByZXNvbHZlKTtcbiAgfVxuXG4gIGV4aXQoKTogdm9pZCB7XG4gICAgdGhpcy53YXRjaGVyICYmIHRoaXMud2F0Y2hlci5jbG9zZSgpO1xuICAgIHRoaXMuYnVpbGRQcm9taXNlLnRoZW4oKCkgPT4gdGhpcy5leGl0UHJvbWlzZVJlc29sdmUoKSk7XG4gIH1cbn07XG4iXX0=