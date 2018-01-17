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
const uglify = require("uglify-js");
const proc = require("process");
const utils_1 = require("~/utils");
const processor_1 = require("~/processors/processor");
const DEFAULT_OPTS = {};
class UglifyJSProcessor extends processor_1.Processor {
    constructor(options = {}, onlyProcessInProd = true) {
        super();
        this.options = utils_1.Utils.shallowMerge(DEFAULT_OPTS, options);
        this.shouldProcess = !onlyProcessInProd || proc.env.NODE_ENV === 'production';
        utils_1.Utils.dbg() && utils_1.Utils.debug('Options:', this.options);
    }
    processFile(source, target) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.shouldProcess) {
                let contents = yield utils_1.Utils.readFile(source);
                let minified = yield uglify.minify(contents, utils_1.Utils.shallowMerge(this.options, {
                    sourceMap: { filename: path.basename(source) }
                }));
                if (minified.error) {
                    throw minified.error;
                }
                return utils_1.Utils.writeFile(target, minified.code).then(() => undefined);
            }
            else {
                yield fs.ensureSymlink(source, target);
                return undefined;
            }
        });
    }
}
exports.UglifyJSProcessor = UglifyJSProcessor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidWdsaWZ5anMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcHJvY2Vzc29ycy91Z2xpZnlqcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsK0JBQStCO0FBQy9CLDZCQUE2QjtBQUM3QixvQ0FBb0M7QUFDcEMsZ0NBQWdDO0FBQ2hDLG1DQUFnQztBQUNoQyxzREFBbUQ7QUFHbkQsTUFBTSxZQUFZLEdBQUcsRUFFcEIsQ0FBQztBQUVGLHVCQUErQixTQUFRLHFCQUFTO0lBSTlDLFlBQVksVUFBZSxFQUFFLEVBQUUsb0JBQTZCLElBQUk7UUFDOUQsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsT0FBTyxHQUFHLGFBQUssQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3pELElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxpQkFBaUIsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsS0FBSyxZQUFZLENBQUM7UUFDOUUsYUFBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLGFBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRUssV0FBVyxDQUFDLE1BQWMsRUFBRSxNQUFjOztZQUM5QyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztnQkFDdkIsSUFBSSxRQUFRLEdBQUcsTUFBTSxhQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM1QyxJQUFJLFFBQVEsR0FBRyxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLGFBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtvQkFDNUUsU0FBUyxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7aUJBQy9DLENBQUMsQ0FBQyxDQUFDO2dCQUNKLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUNuQixNQUFNLFFBQVEsQ0FBQyxLQUFLLENBQUM7Z0JBQ3ZCLENBQUM7Z0JBQ0QsTUFBTSxDQUFDLGFBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDdEUsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLE1BQU0sRUFBRSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ3ZDLE1BQU0sQ0FBQyxTQUFTLENBQUM7WUFDbkIsQ0FBQztRQUNILENBQUM7S0FBQTtDQUNGO0FBMUJELDhDQTBCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB1Z2xpZnkgZnJvbSAndWdsaWZ5LWpzJztcbmltcG9ydCAqIGFzIHByb2MgZnJvbSAncHJvY2Vzcyc7XG5pbXBvcnQgeyBVdGlscyB9IGZyb20gJ34vdXRpbHMnO1xuaW1wb3J0IHsgUHJvY2Vzc29yIH0gZnJvbSAnfi9wcm9jZXNzb3JzL3Byb2Nlc3Nvcic7XG5pbXBvcnQgeyBQcm9jZXNzUmVzdWx0IH0gZnJvbSAnfi9tb2RlbHMvcHJvY2Vzc29yLW1vZGVscyc7XG5cbmNvbnN0IERFRkFVTFRfT1BUUyA9IHtcblxufTtcblxuZXhwb3J0IGNsYXNzIFVnbGlmeUpTUHJvY2Vzc29yIGV4dGVuZHMgUHJvY2Vzc29yIHtcbiAgcHJpdmF0ZSBvcHRpb25zOiBhbnk7XG4gIHByaXZhdGUgc2hvdWxkUHJvY2VzczogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zOiBhbnkgPSB7fSwgb25seVByb2Nlc3NJblByb2Q6IGJvb2xlYW4gPSB0cnVlKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLm9wdGlvbnMgPSBVdGlscy5zaGFsbG93TWVyZ2UoREVGQVVMVF9PUFRTLCBvcHRpb25zKTtcbiAgICB0aGlzLnNob3VsZFByb2Nlc3MgPSAhb25seVByb2Nlc3NJblByb2QgfHwgcHJvYy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJztcbiAgICBVdGlscy5kYmcoKSAmJiBVdGlscy5kZWJ1ZygnT3B0aW9uczonLCB0aGlzLm9wdGlvbnMpO1xuICB9XG5cbiAgYXN5bmMgcHJvY2Vzc0ZpbGUoc291cmNlOiBzdHJpbmcsIHRhcmdldDogc3RyaW5nKTogUHJvbWlzZTxQcm9jZXNzUmVzdWx0PiB7XG4gICAgaWYgKHRoaXMuc2hvdWxkUHJvY2Vzcykge1xuICAgICAgbGV0IGNvbnRlbnRzID0gYXdhaXQgVXRpbHMucmVhZEZpbGUoc291cmNlKTtcbiAgICAgIGxldCBtaW5pZmllZCA9IGF3YWl0IHVnbGlmeS5taW5pZnkoY29udGVudHMsIFV0aWxzLnNoYWxsb3dNZXJnZSh0aGlzLm9wdGlvbnMsIHtcbiAgICAgICAgc291cmNlTWFwOiB7IGZpbGVuYW1lOiBwYXRoLmJhc2VuYW1lKHNvdXJjZSkgfVxuICAgICAgfSkpO1xuICAgICAgaWYgKG1pbmlmaWVkLmVycm9yKSB7XG4gICAgICAgIHRocm93IG1pbmlmaWVkLmVycm9yO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFV0aWxzLndyaXRlRmlsZSh0YXJnZXQsIG1pbmlmaWVkLmNvZGUpLnRoZW4oKCkgPT4gdW5kZWZpbmVkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXdhaXQgZnMuZW5zdXJlU3ltbGluayhzb3VyY2UsIHRhcmdldCk7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxufVxuXG4iXX0=