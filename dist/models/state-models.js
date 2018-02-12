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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGUtbW9kZWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21vZGVscy9zdGF0ZS1tb2RlbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtQ0FBZ0M7QUFJaEM7O0dBRUc7QUFDSCxlQUFtQixTQUFRLEdBQWM7SUFDdkM7UUFDRSxLQUFLLEVBQUUsQ0FBQztJQUNWLENBQUM7Q0FDRjtBQUVEOztHQUVHO0FBQ0gscUJBQTZCLFNBQVEsU0FBaUI7SUFDcEQ7OztPQUdHO0lBQ0g7UUFDRSxLQUFLLEVBQUUsQ0FBQztJQUNWLENBQUM7SUFFRDs7O09BR0c7SUFDSCxLQUFLLENBQUMsTUFBdUI7UUFDM0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsRUFBRTtZQUMzQixJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztpQkFDN0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDdkIsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsYUFBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEVBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQzlELElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQzNCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0gsSUFBSTtRQUNGLElBQUksT0FBTyxHQUFvQixJQUFJLGVBQWUsRUFBRSxDQUFDO1FBQ3JELElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEVBQUU7WUFDM0IsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDbkIsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLEdBQUcsRUFBVSxDQUFDO2dCQUNoRCxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNiLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3hCLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLENBQUMsT0FBTyxDQUFDO0lBQ2pCLENBQUM7Q0FDRjtBQXBDRCwwQ0FvQ0M7QUFFRCxxQkFBNkIsU0FBUSxTQUFpQjtDQUNyRDtBQURELDBDQUNDO0FBRUQ7SUFVRSxZQUFZLFNBQWMsRUFBRTtRQUMxQixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7UUFDOUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUM5QixJQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDMUIsSUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQzFCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUM1QixJQUFJLENBQUMsZUFBZSxHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQUM7UUFDOUMsSUFBSSxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUMsZUFBZSxDQUFDO0lBQ2hELENBQUM7Q0FDRjtBQXBCRCwwQkFvQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBVdGlscyB9IGZyb20gJ34vdXRpbHMnO1xuaW1wb3J0IHsgUHJvY2Vzc29ySW5wdXQsIFByb2Nlc3Nvck91dHB1dCB9IGZyb20gJ34vbW9kZWxzL3Byb2Nlc3Nvci1tb2RlbHMnO1xuaW1wb3J0IHsgUHJvY2Vzc29yIH0gZnJvbSAnfi9wcm9jZXNzb3JzL3Byb2Nlc3Nvcic7XG5cbi8qKlxuICogU2ltcGxlIDEtdG8tTSBtYXBwaW5nXG4gKi9cbmNsYXNzIE9uZVRvTWFueTxUPiBleHRlbmRzIE1hcDxULCBTZXQ8VD4+IHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxufVxuXG4vKipcbiAqIFRhcmdldCB0byBzb3VyY2VzIG1hcHBpbmdcbiAqL1xuZXhwb3J0IGNsYXNzIFRhcmdldFRvU291cmNlcyBleHRlbmRzIE9uZVRvTWFueTxzdHJpbmc+IHtcbiAgLyoqXG4gICAqIEtleSBpcyB0aGUgdGFyZ2V0IGZpbGUsIHZhbHVlIGlzIGEgc2V0IG9mIHNvdXJjZXMgdGhhdCBjb250cmlidXRlXG4gICAqIHRvIHRoZSB0YXJnZXRcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICAvKipcbiAgICogRm9yIGVhY2ggdGFyZ2V0LCB0cmFjZSBzb3VyY2VzIGJhY2sgdG8gdGhlaXIgb3JpZ2luYWwgc291cmNlc1xuICAgKiBAcGFyYW0ge09iamVjdH0gb2xkVHRzIE9sZCB0YXJnZXRUb1NvdXJjZXNNYXBcbiAgICovXG4gIHRyYWNlKG9sZFRUUzogVGFyZ2V0VG9Tb3VyY2VzKTogdm9pZCB7XG4gICAgdGhpcy5mb3JFYWNoKCh2YWx1ZXMsIGtleSkgPT4ge1xuICAgICAgbGV0IG5ld1ZhbHVlcyA9IEFycmF5LmZyb20odmFsdWVzKVxuICAgICAgICAgIC5tYXAodiA9PiBvbGRUVFMuZ2V0KHYpKVxuICAgICAgICAgIC5yZWR1Y2UoKGFsbCwgdmFscykgPT4gVXRpbHMudW5pb24oYWxsLCB2YWxzKSwgbmV3IFNldCgpKTtcbiAgICAgIHRoaXMuc2V0KGtleSwgbmV3VmFsdWVzKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgbWFwIHdpdGggZmxpcHBlZCBrZXkvdmFsdWVzXG4gICAqL1xuICBmbGlwKCk6IFNvdXJjZVRvVGFyZ2V0cyB7XG4gICAgbGV0IGZsaXBwZWQ6IFNvdXJjZVRvVGFyZ2V0cyA9IG5ldyBTb3VyY2VUb1RhcmdldHMoKTtcbiAgICB0aGlzLmZvckVhY2goKHZhbHVlcywga2V5KSA9PiB7XG4gICAgICB2YWx1ZXMuZm9yRWFjaCh2YWwgPT4ge1xuICAgICAgICBsZXQgcmV2ID0gZmxpcHBlZC5nZXQodmFsKSB8fCBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgICAgcmV2LmFkZChrZXkpO1xuICAgICAgICBmbGlwcGVkLnNldCh2YWwsIHJldik7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gZmxpcHBlZDtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU291cmNlVG9UYXJnZXRzIGV4dGVuZHMgT25lVG9NYW55PHN0cmluZz4ge1xufVxuXG5leHBvcnQgY2xhc3MgQ29udGV4dCB7XG4gIHJvb3REaXI6IHN0cmluZztcbiAgc291cmNlRGlyOiBzdHJpbmc7XG4gIHdvcmtEaXI6IHN0cmluZztcbiAgaW5kZXg6IG51bWJlcjtcbiAgaW5wdXQ6IFByb2Nlc3NvcklucHV0O1xuICBvdXRwdXQ6IFByb2Nlc3Nvck91dHB1dDtcbiAgdGFyZ2V0VG9Tb3VyY2VzOiBUYXJnZXRUb1NvdXJjZXM7XG4gIHNvdXJjZVRvVGFyZ2V0czogU291cmNlVG9UYXJnZXRzO1xuXG4gIGNvbnN0cnVjdG9yKHBhY2tlZDogYW55ID0ge30pIHtcbiAgICB0aGlzLnJvb3REaXIgPSBwYWNrZWQucm9vdERpcjtcbiAgICB0aGlzLnNvdXJjZURpciA9IHBhY2tlZC5zb3VyY2VEaXI7XG4gICAgdGhpcy53b3JrRGlyID0gcGFja2VkLndvcmtEaXI7XG4gICAgdGhpcy5pbmRleCA9IHBhY2tlZC5pbmRleDtcbiAgICB0aGlzLmlucHV0ID0gcGFja2VkLmlucHV0O1xuICAgIHRoaXMub3V0cHV0ID0gcGFja2VkLm91dHB1dDtcbiAgICB0aGlzLnRhcmdldFRvU291cmNlcyA9IHBhY2tlZC50YXJnZXRUb1NvdXJjZXM7XG4gICAgdGhpcy5zb3VyY2VUb1RhcmdldHMgPSBwYWNrZWQuc291cmNlVG9UYXJnZXRzO1xuICB9XG59Il19