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
const less = require("less");
const LessNpmImport = require("less-plugin-npm-import");
const utils_1 = require("~/utils");
const processor_1 = require("~/processors/processor");
const processor_models_1 = require("~/models/processor-models");
const DEFAULT_OPTS = {};
const LESS_EXT = /\.less$/i;
class LESSProcessor extends processor_1.Processor {
    constructor(options = {}) {
        super();
        this.options = utils_1.Utils.shallowMerge(DEFAULT_OPTS, options);
        this.options.plugins = (this.options.plugins || []).concat(new LessNpmImport());
        utils_1.Utils.dbg() && utils_1.Utils.debug('Options:', this.options);
    }
    processFile(source, target) {
        return __awaiter(this, void 0, void 0, function* () {
            let contents = yield utils_1.Utils.readFile(source);
            let options = utils_1.Utils.shallowMerge(this.options, { filename: source });
            let compiled = yield less.render(contents, options);
            // Update target file name
            target = target.replace(LESS_EXT, '.css');
            return utils_1.Utils.writeFile(target, compiled.css).then(() => new processor_models_1.ProcessResult(compiled.imports, target));
        });
    }
}
exports.LESSProcessor = LESSProcessor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGVzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcm9jZXNzb3JzL2xlc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLDZCQUE2QjtBQUM3Qix3REFBd0Q7QUFDeEQsbUNBQWdDO0FBQ2hDLHNEQUFtRDtBQUNuRCxnRUFBMEQ7QUFFMUQsTUFBTSxZQUFZLEdBQUcsRUFBRSxDQUFDO0FBRXhCLE1BQU0sUUFBUSxHQUFHLFVBQVUsQ0FBQztBQUU1QixtQkFBMkIsU0FBUSxxQkFBUztJQUcxQyxZQUFZLFVBQWUsRUFBRTtRQUMzQixLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksQ0FBQyxPQUFPLEdBQUcsYUFBSyxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDekQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQ3hELElBQUksYUFBYSxFQUFFLENBQ3BCLENBQUM7UUFDRixhQUFLLENBQUMsR0FBRyxFQUFFLElBQUksYUFBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFFSyxXQUFXLENBQUMsTUFBYyxFQUFFLE1BQWM7O1lBQzlDLElBQUksUUFBUSxHQUFHLE1BQU0sYUFBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM1QyxJQUFJLE9BQU8sR0FBRyxhQUFLLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUNyRSxJQUFJLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3BELDBCQUEwQjtZQUMxQixNQUFNLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDMUMsTUFBTSxDQUFDLGFBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQ3JELElBQUksZ0NBQWEsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUM1QyxDQUFDO1FBQ0osQ0FBQztLQUFBO0NBQ0Y7QUF0QkQsc0NBc0JDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgbGVzcyBmcm9tICdsZXNzJztcbmltcG9ydCAqIGFzIExlc3NOcG1JbXBvcnQgZnJvbSAnbGVzcy1wbHVnaW4tbnBtLWltcG9ydCc7XG5pbXBvcnQgeyBVdGlscyB9IGZyb20gJ34vdXRpbHMnO1xuaW1wb3J0IHsgUHJvY2Vzc29yIH0gZnJvbSAnfi9wcm9jZXNzb3JzL3Byb2Nlc3Nvcic7XG5pbXBvcnQgeyBQcm9jZXNzUmVzdWx0IH0gZnJvbSAnfi9tb2RlbHMvcHJvY2Vzc29yLW1vZGVscyc7XG5cbmNvbnN0IERFRkFVTFRfT1BUUyA9IHt9O1xuXG5jb25zdCBMRVNTX0VYVCA9IC9cXC5sZXNzJC9pO1xuXG5leHBvcnQgY2xhc3MgTEVTU1Byb2Nlc3NvciBleHRlbmRzIFByb2Nlc3NvciB7XG4gIHByaXZhdGUgb3B0aW9uczogYW55O1xuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6IGFueSA9IHt9KSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLm9wdGlvbnMgPSBVdGlscy5zaGFsbG93TWVyZ2UoREVGQVVMVF9PUFRTLCBvcHRpb25zKTtcbiAgICB0aGlzLm9wdGlvbnMucGx1Z2lucyA9ICh0aGlzLm9wdGlvbnMucGx1Z2lucyB8fCBbXSkuY29uY2F0KFxuICAgICAgbmV3IExlc3NOcG1JbXBvcnQoKVxuICAgICk7XG4gICAgVXRpbHMuZGJnKCkgJiYgVXRpbHMuZGVidWcoJ09wdGlvbnM6JywgdGhpcy5vcHRpb25zKTtcbiAgfVxuXG4gIGFzeW5jIHByb2Nlc3NGaWxlKHNvdXJjZTogc3RyaW5nLCB0YXJnZXQ6IHN0cmluZyk6IFByb21pc2U8UHJvY2Vzc1Jlc3VsdD4ge1xuICAgIGxldCBjb250ZW50cyA9IGF3YWl0IFV0aWxzLnJlYWRGaWxlKHNvdXJjZSk7XG4gICAgbGV0IG9wdGlvbnMgPSBVdGlscy5zaGFsbG93TWVyZ2UodGhpcy5vcHRpb25zLCB7IGZpbGVuYW1lOiBzb3VyY2UgfSk7XG4gICAgbGV0IGNvbXBpbGVkID0gYXdhaXQgbGVzcy5yZW5kZXIoY29udGVudHMsIG9wdGlvbnMpO1xuICAgIC8vIFVwZGF0ZSB0YXJnZXQgZmlsZSBuYW1lXG4gICAgdGFyZ2V0ID0gdGFyZ2V0LnJlcGxhY2UoTEVTU19FWFQsICcuY3NzJyk7XG4gICAgcmV0dXJuIFV0aWxzLndyaXRlRmlsZSh0YXJnZXQsIGNvbXBpbGVkLmNzcykudGhlbigoKSA9PlxuICAgICAgbmV3IFByb2Nlc3NSZXN1bHQoY29tcGlsZWQuaW1wb3J0cywgdGFyZ2V0KVxuICAgICk7XG4gIH1cbn1cbiJdfQ==