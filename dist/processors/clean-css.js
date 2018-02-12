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
const proc = require("process");
const CleanCSS = require("clean-css");
const utils_1 = require("~/utils");
const processor_1 = require("~/processors/processor");
const processor_models_1 = require("~/models/processor-models");
const DEFAULT_OPTS = {
    inline: ['local']
};
class CleanCSSProcessor extends processor_1.Processor {
    constructor(options = {}, onlyProcessInProd = true) {
        super();
        options = utils_1.Utils.shallowMerge(DEFAULT_OPTS, options, {
            returnPromise: true
        });
        this.ccss = new CleanCSS(options);
        this.shouldProcess = !onlyProcessInProd || proc.env.NODE_ENV === 'production';
        utils_1.Utils.dbg() && utils_1.Utils.debug('Options:', options);
    }
    processFile(source, target) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.shouldProcess) {
                let compiled = yield this.ccss.minify([source]);
                let imports = new Set(compiled.inlinedStylesheets);
                imports.delete(source);
                return utils_1.Utils.writeFile(target, compiled.styles).then(() => new processor_models_1.ProcessResult([...imports]));
            }
            else {
                yield fs.ensureSymlink(source, target);
                return undefined;
            }
        });
    }
}
exports.CleanCSSProcessor = CleanCSSProcessor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xlYW4tY3NzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3Byb2Nlc3NvcnMvY2xlYW4tY3NzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSwrQkFBK0I7QUFDL0IsZ0NBQWdDO0FBQ2hDLHNDQUFzQztBQUN0QyxtQ0FBZ0M7QUFDaEMsc0RBQW1EO0FBQ25ELGdFQUEwRDtBQUUxRCxNQUFNLFlBQVksR0FBRztJQUNuQixNQUFNLEVBQUUsQ0FBQyxPQUFPLENBQUM7Q0FDbEIsQ0FBQztBQUVGLHVCQUErQixTQUFRLHFCQUFTO0lBSTlDLFlBQVksVUFBZSxFQUFFLEVBQUUsb0JBQTZCLElBQUk7UUFDOUQsS0FBSyxFQUFFLENBQUM7UUFDUixPQUFPLEdBQUcsYUFBSyxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsT0FBTyxFQUFFO1lBQ2xELGFBQWEsRUFBRSxJQUFJO1NBQ3BCLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLGlCQUFpQixJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxLQUFLLFlBQVksQ0FBQztRQUM5RSxhQUFLLENBQUMsR0FBRyxFQUFFLElBQUksYUFBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVLLFdBQVcsQ0FBQyxNQUFjLEVBQUUsTUFBYzs7WUFDOUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZCLElBQUksUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNoRCxJQUFJLE9BQU8sR0FBZ0IsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLENBQUM7Z0JBQ2hFLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3ZCLE1BQU0sQ0FBQyxhQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUN0RCxJQUFJLGdDQUFhLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQ2xDLENBQUM7WUFDSixDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ04sTUFBTSxFQUFFLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDdkMsTUFBTSxDQUFDLFNBQVMsQ0FBQztZQUNuQixDQUFDO1FBQ0gsQ0FBQztLQUFBO0NBQ0Y7QUEzQkQsOENBMkJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0ICogYXMgcHJvYyBmcm9tICdwcm9jZXNzJztcbmltcG9ydCAqIGFzIENsZWFuQ1NTIGZyb20gJ2NsZWFuLWNzcyc7XG5pbXBvcnQgeyBVdGlscyB9IGZyb20gJ34vdXRpbHMnO1xuaW1wb3J0IHsgUHJvY2Vzc29yIH0gZnJvbSAnfi9wcm9jZXNzb3JzL3Byb2Nlc3Nvcic7XG5pbXBvcnQgeyBQcm9jZXNzUmVzdWx0IH0gZnJvbSAnfi9tb2RlbHMvcHJvY2Vzc29yLW1vZGVscyc7XG5cbmNvbnN0IERFRkFVTFRfT1BUUyA9IHtcbiAgaW5saW5lOiBbJ2xvY2FsJ11cbn07XG5cbmV4cG9ydCBjbGFzcyBDbGVhbkNTU1Byb2Nlc3NvciBleHRlbmRzIFByb2Nlc3NvciB7XG4gIHByaXZhdGUgY2NzczogQ2xlYW5DU1M7XG4gIHByaXZhdGUgc2hvdWxkUHJvY2VzczogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zOiBhbnkgPSB7fSwgb25seVByb2Nlc3NJblByb2Q6IGJvb2xlYW4gPSB0cnVlKSB7XG4gICAgc3VwZXIoKTtcbiAgICBvcHRpb25zID0gVXRpbHMuc2hhbGxvd01lcmdlKERFRkFVTFRfT1BUUywgb3B0aW9ucywge1xuICAgICAgcmV0dXJuUHJvbWlzZTogdHJ1ZVxuICAgIH0pO1xuICAgIHRoaXMuY2NzcyA9IG5ldyBDbGVhbkNTUyhvcHRpb25zKTtcbiAgICB0aGlzLnNob3VsZFByb2Nlc3MgPSAhb25seVByb2Nlc3NJblByb2QgfHwgcHJvYy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJztcbiAgICBVdGlscy5kYmcoKSAmJiBVdGlscy5kZWJ1ZygnT3B0aW9uczonLCBvcHRpb25zKTtcbiAgfVxuXG4gIGFzeW5jIHByb2Nlc3NGaWxlKHNvdXJjZTogc3RyaW5nLCB0YXJnZXQ6IHN0cmluZyk6IFByb21pc2U8UHJvY2Vzc1Jlc3VsdD4ge1xuICAgIGlmICh0aGlzLnNob3VsZFByb2Nlc3MpIHtcbiAgICAgIGxldCBjb21waWxlZCA9IGF3YWl0IHRoaXMuY2Nzcy5taW5pZnkoW3NvdXJjZV0pO1xuICAgICAgbGV0IGltcG9ydHM6IFNldDxzdHJpbmc+ID0gbmV3IFNldChjb21waWxlZC5pbmxpbmVkU3R5bGVzaGVldHMpO1xuICAgICAgaW1wb3J0cy5kZWxldGUoc291cmNlKTtcbiAgICAgIHJldHVybiBVdGlscy53cml0ZUZpbGUodGFyZ2V0LCBjb21waWxlZC5zdHlsZXMpLnRoZW4oKCkgPT5cbiAgICAgICAgICBuZXcgUHJvY2Vzc1Jlc3VsdChbLi4uaW1wb3J0c10pXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICBhd2FpdCBmcy5lbnN1cmVTeW1saW5rKHNvdXJjZSwgdGFyZ2V0KTtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG59XG4iXX0=