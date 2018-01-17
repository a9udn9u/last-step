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
/**
 * Caches file mtime
 */
const MTIME_CACHE = new Map();
class Finalizer {
    constructor(targetDir, targets) {
        this.targets = targets;
        this.targetDir = targetDir;
        this.name = this.constructor.name;
        utils_1.Utils.dbg() && utils_1.Utils.debug(`${this.name} created.`);
    }
    /**
     * Copy/merge files in input to the target directory.
     * Support 3 use cases:
     * 1. No target specified: Source files will be copied to the target
     *    directory 1 to 1, with file name decided by the last processor.
     * 2. One target file specified: All sources will be merged into one file.
     * 3. An array of target files specified: In this case, sources will be
     *    copied to target directory in 1 to 1 fashion first, when there is only
     *    one target left, all remaining sources will be mreged into the last
     *    target.
     * All merged sources will be treated as imports.
     * @param {ProcessorInput} input Input
     * @returns {Promise<void>} A Promise resolve when all copy are done.
     */
    finalize(input) {
        return __awaiter(this, void 0, void 0, function* () {
            if (utils_1.Utils.dbg()) {
                utils_1.Utils.debug(`Calling ${this.name}.process().`);
                utils_1.Utils.debug('Input:', input);
            }
            let sources = input.sources;
            let copySources = [], copyTargets = [];
            let mergeSources, mergeTarget;
            let promises = [];
            let returnTargets = [];
            let targets = this.targets ? [].concat(this.targets) :
                sources.map(s => path.relative(input.sourceDir, s));
            // Discard excessive targets
            targets.splice(sources.length);
            // Needs merge if true
            if (targets.length < sources.length) {
                mergeSources = sources.splice(targets.length - 1);
                mergeTarget = targets.pop();
            }
            // Copy
            yield Promise.all(sources.map((source, i) => __awaiter(this, void 0, void 0, function* () {
                let target = path.resolve(this.targetDir, targets[i]);
                let mtime = (yield fs.stat(source)).mtimeMs;
                if (MTIME_CACHE.get(source) === mtime) {
                    utils_1.Utils.dbg() && utils_1.Utils.debug(`${this.name}: ${source} unchanged, skip.`);
                }
                else {
                    copySources.push(source);
                    copyTargets.push(target);
                    utils_1.Utils.dbg() && utils_1.Utils.debug(`${this.name}: ${source} -> ${target}`);
                    MTIME_CACHE.set(source, mtime);
                }
                returnTargets.push(target);
            })));
            promises.push(utils_1.Utils.copyFiles(copySources, copyTargets, {
                overwrite: true, dereference: true
            }));
            // Merge
            if (mergeSources && mergeTarget) {
                mergeTarget = path.resolve(this.targetDir, mergeTarget);
                let shouldProcess = false;
                yield Promise.all(mergeSources.map((s) => __awaiter(this, void 0, void 0, function* () {
                    let mtime = (yield fs.stat(s)).mtimeMs;
                    if (mtime !== MTIME_CACHE.get(s)) {
                        MTIME_CACHE.set(s, mtime);
                        shouldProcess = true;
                    }
                })));
                if (shouldProcess) {
                    utils_1.Utils.dbg() && utils_1.Utils.debug(`${this.name}: ${mergeSources} -> ${mergeTarget}`);
                    promises.push(utils_1.Utils.concatFiles(mergeTarget, mergeSources));
                }
                else {
                    utils_1.Utils.dbg() && utils_1.Utils.debug(`${this.name}: ${mergeSources} unchanged, skip.`);
                }
                returnTargets.push(mergeTarget);
            }
            return Promise.all(promises).then(() => returnTargets);
        });
    }
}
exports.Finalizer = Finalizer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluYWxpemVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3Byb2Nlc3NvcnMvZmluYWxpemVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSwrQkFBK0I7QUFDL0IsNkJBQTZCO0FBQzdCLG1DQUFnQztBQUdoQzs7R0FFRztBQUNILE1BQU0sV0FBVyxHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO0FBRTlDO0lBS0UsWUFBWSxTQUFpQixFQUFFLE9BQXdCO1FBQ3JELElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUM7UUFFbEMsYUFBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLGFBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxXQUFXLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRUQ7Ozs7Ozs7Ozs7Ozs7T0FhRztJQUNHLFFBQVEsQ0FBQyxLQUFxQjs7WUFDbEMsRUFBRSxDQUFDLENBQUMsYUFBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDaEIsYUFBSyxDQUFDLEtBQUssQ0FBQyxXQUFXLElBQUksQ0FBQyxJQUFJLGFBQWEsQ0FBQyxDQUFDO2dCQUMvQyxhQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUMvQixDQUFDO1lBRUQsSUFBSSxPQUFPLEdBQWEsS0FBSyxDQUFDLE9BQU8sQ0FBQztZQUN0QyxJQUFJLFdBQVcsR0FBYSxFQUFFLEVBQUUsV0FBVyxHQUFhLEVBQUUsQ0FBQztZQUMzRCxJQUFJLFlBQXNCLEVBQUUsV0FBbUIsQ0FBQztZQUNoRCxJQUFJLFFBQVEsR0FBb0IsRUFBRSxDQUFDO1lBQ25DLElBQUksYUFBYSxHQUFhLEVBQUUsQ0FBQztZQUNqQyxJQUFJLE9BQU8sR0FBYSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUM5RCxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFdEQsNEJBQTRCO1lBQzVCLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRS9CLHNCQUFzQjtZQUN0QixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNwQyxZQUFZLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNsRCxXQUFXLEdBQUcsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQzlCLENBQUM7WUFFRCxPQUFPO1lBQ1AsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBTyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ2hELElBQUksTUFBTSxHQUFXLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDOUQsSUFBSSxLQUFLLEdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7Z0JBQ3BELEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFDdEMsYUFBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLGFBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxLQUFLLE1BQU0sbUJBQW1CLENBQUMsQ0FBQztnQkFDekUsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDTixXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUN6QixXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUN6QixhQUFLLENBQUMsR0FBRyxFQUFFLElBQUksYUFBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEtBQUssTUFBTSxPQUFPLE1BQU0sRUFBRSxDQUFDLENBQUM7b0JBQ25FLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNqQyxDQUFDO2dCQUNELGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDN0IsQ0FBQyxDQUFBLENBQUMsQ0FBQyxDQUFDO1lBQ0osUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFLLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUU7Z0JBQ3RELFNBQVMsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUk7YUFDbkMsQ0FBQyxDQUFDLENBQUM7WUFFSixRQUFRO1lBQ1IsRUFBRSxDQUFDLENBQUMsWUFBWSxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hDLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUM7Z0JBQ3hELElBQUksYUFBYSxHQUFZLEtBQUssQ0FBQztnQkFDbkMsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBTSxDQUFDLEVBQUMsRUFBRTtvQkFDM0MsSUFBSSxLQUFLLEdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7b0JBQy9DLEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDakMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7d0JBQzFCLGFBQWEsR0FBRyxJQUFJLENBQUM7b0JBQ3ZCLENBQUM7Z0JBQ0gsQ0FBQyxDQUFBLENBQUMsQ0FBQyxDQUFDO2dCQUNKLEVBQUUsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7b0JBQ2xCLGFBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxhQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksS0FBSyxZQUFZLE9BQU8sV0FBVyxFQUFFLENBQUMsQ0FBQztvQkFDOUUsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFLLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDO2dCQUM5RCxDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNOLGFBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxhQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksS0FBSyxZQUFZLG1CQUFtQixDQUFDLENBQUM7Z0JBQy9FLENBQUM7Z0JBQ0QsYUFBYSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNsQyxDQUFDO1lBRUQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3pELENBQUM7S0FBQTtDQUNGO0FBMUZELDhCQTBGQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBVdGlscyB9IGZyb20gJ34vdXRpbHMnO1xuaW1wb3J0IHsgRmluYWxpemVySW5wdXQgfSBmcm9tICd+L21vZGVscy9wcm9jZXNzb3ItbW9kZWxzJztcblxuLyoqXG4gKiBDYWNoZXMgZmlsZSBtdGltZVxuICovXG5jb25zdCBNVElNRV9DQUNIRSA9IG5ldyBNYXA8c3RyaW5nLCBudW1iZXI+KCk7XG5cbmV4cG9ydCBjbGFzcyBGaW5hbGl6ZXIge1xuICBwcml2YXRlIG5hbWU6IHN0cmluZztcbiAgcHJpdmF0ZSB0YXJnZXRzOiBzdHJpbmd8c3RyaW5nW107XG4gIHByaXZhdGUgdGFyZ2V0RGlyOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IodGFyZ2V0RGlyOiBzdHJpbmcsIHRhcmdldHM6IHN0cmluZ3xzdHJpbmdbXSkge1xuICAgIHRoaXMudGFyZ2V0cyA9IHRhcmdldHM7XG4gICAgdGhpcy50YXJnZXREaXIgPSB0YXJnZXREaXI7XG4gICAgdGhpcy5uYW1lID0gdGhpcy5jb25zdHJ1Y3Rvci5uYW1lO1xuXG4gICAgVXRpbHMuZGJnKCkgJiYgVXRpbHMuZGVidWcoYCR7dGhpcy5uYW1lfSBjcmVhdGVkLmApO1xuICB9XG5cbiAgLyoqXG4gICAqIENvcHkvbWVyZ2UgZmlsZXMgaW4gaW5wdXQgdG8gdGhlIHRhcmdldCBkaXJlY3RvcnkuXG4gICAqIFN1cHBvcnQgMyB1c2UgY2FzZXM6XG4gICAqIDEuIE5vIHRhcmdldCBzcGVjaWZpZWQ6IFNvdXJjZSBmaWxlcyB3aWxsIGJlIGNvcGllZCB0byB0aGUgdGFyZ2V0XG4gICAqICAgIGRpcmVjdG9yeSAxIHRvIDEsIHdpdGggZmlsZSBuYW1lIGRlY2lkZWQgYnkgdGhlIGxhc3QgcHJvY2Vzc29yLlxuICAgKiAyLiBPbmUgdGFyZ2V0IGZpbGUgc3BlY2lmaWVkOiBBbGwgc291cmNlcyB3aWxsIGJlIG1lcmdlZCBpbnRvIG9uZSBmaWxlLlxuICAgKiAzLiBBbiBhcnJheSBvZiB0YXJnZXQgZmlsZXMgc3BlY2lmaWVkOiBJbiB0aGlzIGNhc2UsIHNvdXJjZXMgd2lsbCBiZVxuICAgKiAgICBjb3BpZWQgdG8gdGFyZ2V0IGRpcmVjdG9yeSBpbiAxIHRvIDEgZmFzaGlvbiBmaXJzdCwgd2hlbiB0aGVyZSBpcyBvbmx5XG4gICAqICAgIG9uZSB0YXJnZXQgbGVmdCwgYWxsIHJlbWFpbmluZyBzb3VyY2VzIHdpbGwgYmUgbXJlZ2VkIGludG8gdGhlIGxhc3RcbiAgICogICAgdGFyZ2V0LlxuICAgKiBBbGwgbWVyZ2VkIHNvdXJjZXMgd2lsbCBiZSB0cmVhdGVkIGFzIGltcG9ydHMuXG4gICAqIEBwYXJhbSB7UHJvY2Vzc29ySW5wdXR9IGlucHV0IElucHV0XG4gICAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+fSBBIFByb21pc2UgcmVzb2x2ZSB3aGVuIGFsbCBjb3B5IGFyZSBkb25lLlxuICAgKi9cbiAgYXN5bmMgZmluYWxpemUoaW5wdXQ6IEZpbmFsaXplcklucHV0KTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICAgIGlmIChVdGlscy5kYmcoKSkge1xuICAgICAgVXRpbHMuZGVidWcoYENhbGxpbmcgJHt0aGlzLm5hbWV9LnByb2Nlc3MoKS5gKTtcbiAgICAgIFV0aWxzLmRlYnVnKCdJbnB1dDonLCBpbnB1dCk7XG4gICAgfVxuXG4gICAgbGV0IHNvdXJjZXM6IHN0cmluZ1tdID0gaW5wdXQuc291cmNlcztcbiAgICBsZXQgY29weVNvdXJjZXM6IHN0cmluZ1tdID0gW10sIGNvcHlUYXJnZXRzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGxldCBtZXJnZVNvdXJjZXM6IHN0cmluZ1tdLCBtZXJnZVRhcmdldDogc3RyaW5nO1xuICAgIGxldCBwcm9taXNlczogUHJvbWlzZTx2b2lkPltdID0gW107XG4gICAgbGV0IHJldHVyblRhcmdldHM6IHN0cmluZ1tdID0gW107XG4gICAgbGV0IHRhcmdldHM6IHN0cmluZ1tdID0gdGhpcy50YXJnZXRzID8gW10uY29uY2F0KHRoaXMudGFyZ2V0cykgOlxuICAgICAgc291cmNlcy5tYXAocyA9PiBwYXRoLnJlbGF0aXZlKGlucHV0LnNvdXJjZURpciwgcykpO1xuXG4gICAgLy8gRGlzY2FyZCBleGNlc3NpdmUgdGFyZ2V0c1xuICAgIHRhcmdldHMuc3BsaWNlKHNvdXJjZXMubGVuZ3RoKTtcblxuICAgIC8vIE5lZWRzIG1lcmdlIGlmIHRydWVcbiAgICBpZiAodGFyZ2V0cy5sZW5ndGggPCBzb3VyY2VzLmxlbmd0aCkge1xuICAgICAgbWVyZ2VTb3VyY2VzID0gc291cmNlcy5zcGxpY2UodGFyZ2V0cy5sZW5ndGggLSAxKTtcbiAgICAgIG1lcmdlVGFyZ2V0ID0gdGFyZ2V0cy5wb3AoKTtcbiAgICB9XG5cbiAgICAvLyBDb3B5XG4gICAgYXdhaXQgUHJvbWlzZS5hbGwoc291cmNlcy5tYXAoYXN5bmMgKHNvdXJjZSwgaSkgPT4ge1xuICAgICAgbGV0IHRhcmdldDogc3RyaW5nID0gcGF0aC5yZXNvbHZlKHRoaXMudGFyZ2V0RGlyLCB0YXJnZXRzW2ldKTtcbiAgICAgIGxldCBtdGltZTogbnVtYmVyID0gKGF3YWl0IGZzLnN0YXQoc291cmNlKSkubXRpbWVNcztcbiAgICAgIGlmIChNVElNRV9DQUNIRS5nZXQoc291cmNlKSA9PT0gbXRpbWUpIHtcbiAgICAgICAgVXRpbHMuZGJnKCkgJiYgVXRpbHMuZGVidWcoYCR7dGhpcy5uYW1lfTogJHtzb3VyY2V9IHVuY2hhbmdlZCwgc2tpcC5gKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvcHlTb3VyY2VzLnB1c2goc291cmNlKTtcbiAgICAgICAgY29weVRhcmdldHMucHVzaCh0YXJnZXQpO1xuICAgICAgICBVdGlscy5kYmcoKSAmJiBVdGlscy5kZWJ1ZyhgJHt0aGlzLm5hbWV9OiAke3NvdXJjZX0gLT4gJHt0YXJnZXR9YCk7XG4gICAgICAgIE1USU1FX0NBQ0hFLnNldChzb3VyY2UsIG10aW1lKTtcbiAgICAgIH1cbiAgICAgIHJldHVyblRhcmdldHMucHVzaCh0YXJnZXQpO1xuICAgIH0pKTtcbiAgICBwcm9taXNlcy5wdXNoKFV0aWxzLmNvcHlGaWxlcyhjb3B5U291cmNlcywgY29weVRhcmdldHMsIHtcbiAgICAgIG92ZXJ3cml0ZTogdHJ1ZSwgZGVyZWZlcmVuY2U6IHRydWVcbiAgICB9KSk7XG5cbiAgICAvLyBNZXJnZVxuICAgIGlmIChtZXJnZVNvdXJjZXMgJiYgbWVyZ2VUYXJnZXQpIHtcbiAgICAgIG1lcmdlVGFyZ2V0ID0gcGF0aC5yZXNvbHZlKHRoaXMudGFyZ2V0RGlyLCBtZXJnZVRhcmdldCk7XG4gICAgICBsZXQgc2hvdWxkUHJvY2VzczogYm9vbGVhbiA9IGZhbHNlO1xuICAgICAgYXdhaXQgUHJvbWlzZS5hbGwobWVyZ2VTb3VyY2VzLm1hcChhc3luYyBzID0+IHtcbiAgICAgICAgbGV0IG10aW1lOiBudW1iZXIgPSAoYXdhaXQgZnMuc3RhdChzKSkubXRpbWVNcztcbiAgICAgICAgaWYgKG10aW1lICE9PSBNVElNRV9DQUNIRS5nZXQocykpIHtcbiAgICAgICAgICBNVElNRV9DQUNIRS5zZXQocywgbXRpbWUpO1xuICAgICAgICAgIHNob3VsZFByb2Nlc3MgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9KSk7XG4gICAgICBpZiAoc2hvdWxkUHJvY2Vzcykge1xuICAgICAgICBVdGlscy5kYmcoKSAmJiBVdGlscy5kZWJ1ZyhgJHt0aGlzLm5hbWV9OiAke21lcmdlU291cmNlc30gLT4gJHttZXJnZVRhcmdldH1gKTtcbiAgICAgICAgcHJvbWlzZXMucHVzaChVdGlscy5jb25jYXRGaWxlcyhtZXJnZVRhcmdldCwgbWVyZ2VTb3VyY2VzKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBVdGlscy5kYmcoKSAmJiBVdGlscy5kZWJ1ZyhgJHt0aGlzLm5hbWV9OiAke21lcmdlU291cmNlc30gdW5jaGFuZ2VkLCBza2lwLmApO1xuICAgICAgfVxuICAgICAgcmV0dXJuVGFyZ2V0cy5wdXNoKG1lcmdlVGFyZ2V0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4oKCkgPT4gcmV0dXJuVGFyZ2V0cyk7XG4gIH1cbn1cbiJdfQ==