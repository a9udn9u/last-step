"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("~/utils");
/**
 * Simple 1-to-M mapping
 */
class OneToMany extends Map {
    constructor() {
        super();
    }
}
/**
 * Target to sources mapping
 */
class TargetToSources extends OneToMany {
    /**
     * Key is the target file, value is a set of sources that contribute
     * to the target
     */
    constructor() {
        super();
    }
    /**
     * For each target, trace sources back to their original sources
     * @param {Object} oldTts Old targetToSourcesMap
     */
    trace(oldTTS) {
        this.forEach((values, key) => {
            let newValues = Array.from(values)
                .map(v => oldTTS.get(v))
                .filter(vals => !!vals)
                .reduce((all, vals) => utils_1.Utils.union(all, vals), new Set());
            this.set(key, newValues);
        });
    }
    /**
     * Create a new map with flipped key/values
     */
    flip() {
        let flipped = new SourceToTargets();
        this.forEach((values, key) => {
            values.forEach(val => {
                let rev = flipped.get(val) || new Set();
                rev.add(key);
                flipped.set(val, rev);
            });
        });
        return flipped;
    }
}
exports.TargetToSources = TargetToSources;
class SourceToTargets extends OneToMany {
}
exports.SourceToTargets = SourceToTargets;
class Context {
    constructor(packed = {}) {
        this.rootDir = packed.rootDir;
        this.sourceDir = packed.sourceDir;
        this.workDir = packed.workDir;
        this.index = packed.index;
        this.input = packed.input;
        this.output = packed.output;
        this.targetToSources = packed.targetToSources;
        this.sourceToTargets = packed.sourceToTargets;
    }
}
exports.Context = Context;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGUtbW9kZWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21vZGVscy9zdGF0ZS1tb2RlbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtQ0FBZ0M7QUFJaEM7O0dBRUc7QUFDSCxlQUFtQixTQUFRLEdBQWM7SUFDdkM7UUFDRSxLQUFLLEVBQUUsQ0FBQztJQUNWLENBQUM7Q0FDRjtBQUVEOztHQUVHO0FBQ0gscUJBQTZCLFNBQVEsU0FBaUI7SUFDcEQ7OztPQUdHO0lBQ0g7UUFDRSxLQUFLLEVBQUUsQ0FBQztJQUNWLENBQUM7SUFFRDs7O09BR0c7SUFDSCxLQUFLLENBQUMsTUFBdUI7UUFDM0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsRUFBRTtZQUMzQixJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztpQkFDN0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDdkIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztpQkFDdEIsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsYUFBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEVBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQzlELElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQzNCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0gsSUFBSTtRQUNGLElBQUksT0FBTyxHQUFvQixJQUFJLGVBQWUsRUFBRSxDQUFDO1FBQ3JELElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEVBQUU7WUFDM0IsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDbkIsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLEdBQUcsRUFBVSxDQUFDO2dCQUNoRCxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNiLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3hCLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLENBQUMsT0FBTyxDQUFDO0lBQ2pCLENBQUM7Q0FDRjtBQXJDRCwwQ0FxQ0M7QUFFRCxxQkFBNkIsU0FBUSxTQUFpQjtDQUNyRDtBQURELDBDQUNDO0FBRUQ7SUFVRSxZQUFZLFNBQWMsRUFBRTtRQUMxQixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7UUFDOUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUM5QixJQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDMUIsSUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQzFCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUM1QixJQUFJLENBQUMsZUFBZSxHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQUM7UUFDOUMsSUFBSSxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUMsZUFBZSxDQUFDO0lBQ2hELENBQUM7Q0FDRjtBQXBCRCwwQkFvQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBVdGlscyB9IGZyb20gJ34vdXRpbHMnO1xuaW1wb3J0IHsgUHJvY2Vzc29ySW5wdXQsIFByb2Nlc3Nvck91dHB1dCB9IGZyb20gJ34vbW9kZWxzL3Byb2Nlc3Nvci1tb2RlbHMnO1xuaW1wb3J0IHsgUHJvY2Vzc29yIH0gZnJvbSAnfi9wcm9jZXNzb3JzL3Byb2Nlc3Nvcic7XG5cbi8qKlxuICogU2ltcGxlIDEtdG8tTSBtYXBwaW5nXG4gKi9cbmNsYXNzIE9uZVRvTWFueTxUPiBleHRlbmRzIE1hcDxULCBTZXQ8VD4+IHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxufVxuXG4vKipcbiAqIFRhcmdldCB0byBzb3VyY2VzIG1hcHBpbmdcbiAqL1xuZXhwb3J0IGNsYXNzIFRhcmdldFRvU291cmNlcyBleHRlbmRzIE9uZVRvTWFueTxzdHJpbmc+IHtcbiAgLyoqXG4gICAqIEtleSBpcyB0aGUgdGFyZ2V0IGZpbGUsIHZhbHVlIGlzIGEgc2V0IG9mIHNvdXJjZXMgdGhhdCBjb250cmlidXRlXG4gICAqIHRvIHRoZSB0YXJnZXRcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICAvKipcbiAgICogRm9yIGVhY2ggdGFyZ2V0LCB0cmFjZSBzb3VyY2VzIGJhY2sgdG8gdGhlaXIgb3JpZ2luYWwgc291cmNlc1xuICAgKiBAcGFyYW0ge09iamVjdH0gb2xkVHRzIE9sZCB0YXJnZXRUb1NvdXJjZXNNYXBcbiAgICovXG4gIHRyYWNlKG9sZFRUUzogVGFyZ2V0VG9Tb3VyY2VzKTogdm9pZCB7XG4gICAgdGhpcy5mb3JFYWNoKCh2YWx1ZXMsIGtleSkgPT4ge1xuICAgICAgbGV0IG5ld1ZhbHVlcyA9IEFycmF5LmZyb20odmFsdWVzKVxuICAgICAgICAgIC5tYXAodiA9PiBvbGRUVFMuZ2V0KHYpKVxuICAgICAgICAgIC5maWx0ZXIodmFscyA9PiAhIXZhbHMpXG4gICAgICAgICAgLnJlZHVjZSgoYWxsLCB2YWxzKSA9PiBVdGlscy51bmlvbihhbGwsIHZhbHMpLCBuZXcgU2V0KCkpO1xuICAgICAgdGhpcy5zZXQoa2V5LCBuZXdWYWx1ZXMpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBtYXAgd2l0aCBmbGlwcGVkIGtleS92YWx1ZXNcbiAgICovXG4gIGZsaXAoKTogU291cmNlVG9UYXJnZXRzIHtcbiAgICBsZXQgZmxpcHBlZDogU291cmNlVG9UYXJnZXRzID0gbmV3IFNvdXJjZVRvVGFyZ2V0cygpO1xuICAgIHRoaXMuZm9yRWFjaCgodmFsdWVzLCBrZXkpID0+IHtcbiAgICAgIHZhbHVlcy5mb3JFYWNoKHZhbCA9PiB7XG4gICAgICAgIGxldCByZXYgPSBmbGlwcGVkLmdldCh2YWwpIHx8IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgICByZXYuYWRkKGtleSk7XG4gICAgICAgIGZsaXBwZWQuc2V0KHZhbCwgcmV2KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBmbGlwcGVkO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTb3VyY2VUb1RhcmdldHMgZXh0ZW5kcyBPbmVUb01hbnk8c3RyaW5nPiB7XG59XG5cbmV4cG9ydCBjbGFzcyBDb250ZXh0IHtcbiAgcm9vdERpcjogc3RyaW5nO1xuICBzb3VyY2VEaXI6IHN0cmluZztcbiAgd29ya0Rpcjogc3RyaW5nO1xuICBpbmRleDogbnVtYmVyO1xuICBpbnB1dDogUHJvY2Vzc29ySW5wdXQ7XG4gIG91dHB1dDogUHJvY2Vzc29yT3V0cHV0O1xuICB0YXJnZXRUb1NvdXJjZXM6IFRhcmdldFRvU291cmNlcztcbiAgc291cmNlVG9UYXJnZXRzOiBTb3VyY2VUb1RhcmdldHM7XG5cbiAgY29uc3RydWN0b3IocGFja2VkOiBhbnkgPSB7fSkge1xuICAgIHRoaXMucm9vdERpciA9IHBhY2tlZC5yb290RGlyO1xuICAgIHRoaXMuc291cmNlRGlyID0gcGFja2VkLnNvdXJjZURpcjtcbiAgICB0aGlzLndvcmtEaXIgPSBwYWNrZWQud29ya0RpcjtcbiAgICB0aGlzLmluZGV4ID0gcGFja2VkLmluZGV4O1xuICAgIHRoaXMuaW5wdXQgPSBwYWNrZWQuaW5wdXQ7XG4gICAgdGhpcy5vdXRwdXQgPSBwYWNrZWQub3V0cHV0O1xuICAgIHRoaXMudGFyZ2V0VG9Tb3VyY2VzID0gcGFja2VkLnRhcmdldFRvU291cmNlcztcbiAgICB0aGlzLnNvdXJjZVRvVGFyZ2V0cyA9IHBhY2tlZC5zb3VyY2VUb1RhcmdldHM7XG4gIH1cbn0iXX0=