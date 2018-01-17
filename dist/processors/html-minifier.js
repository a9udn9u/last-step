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
const html_minifier_1 = require("html-minifier");
const utils_1 = require("~/utils");
const processor_1 = require("~/processors/processor");
const DEFAULT_OPTS = {
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    decodeEntities: true,
    html5: true,
    minifyCSS: true,
    minifyJS: true,
    processConditionalComments: true,
    removeAttributeQuotes: true,
    removeComments: true,
    removeEmptyAttributes: true,
    removeOptionalTags: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    removeTagWhitespace: true,
    sortAttributes: true,
    sortClassName: true,
    trimCustomFragments: true,
    useShortDoctype: true
};
class HTMLMinifierProcessor extends processor_1.Processor {
    constructor(options = {}) {
        super();
        this.options = utils_1.Utils.shallowMerge(DEFAULT_OPTS, options);
        utils_1.Utils.dbg() && utils_1.Utils.debug('Options:', this.options);
    }
    processFile(source, target) {
        return __awaiter(this, void 0, void 0, function* () {
            let contents = yield utils_1.Utils.readFile(source);
            let minified = html_minifier_1.minify(contents, this.options);
            return utils_1.Utils.writeFile(target, minified).then(() => undefined);
        });
    }
}
exports.HTMLMinifierProcessor = HTMLMinifierProcessor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHRtbC1taW5pZmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcm9jZXNzb3JzL2h0bWwtbWluaWZpZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLGlEQUF1QztBQUN2QyxtQ0FBZ0M7QUFDaEMsc0RBQW1EO0FBR25ELE1BQU0sWUFBWSxHQUFHO0lBQ25CLHlCQUF5QixFQUFFLElBQUk7SUFDL0Isa0JBQWtCLEVBQUUsSUFBSTtJQUN4QixjQUFjLEVBQUUsSUFBSTtJQUNwQixLQUFLLEVBQUUsSUFBSTtJQUNYLFNBQVMsRUFBRSxJQUFJO0lBQ2YsUUFBUSxFQUFFLElBQUk7SUFDZCwwQkFBMEIsRUFBRSxJQUFJO0lBQ2hDLHFCQUFxQixFQUFFLElBQUk7SUFDM0IsY0FBYyxFQUFFLElBQUk7SUFDcEIscUJBQXFCLEVBQUUsSUFBSTtJQUMzQixrQkFBa0IsRUFBRSxJQUFJO0lBQ3hCLHlCQUF5QixFQUFFLElBQUk7SUFDL0IsMEJBQTBCLEVBQUUsSUFBSTtJQUNoQyw2QkFBNkIsRUFBRSxJQUFJO0lBQ25DLG1CQUFtQixFQUFFLElBQUk7SUFDekIsY0FBYyxFQUFFLElBQUk7SUFDcEIsYUFBYSxFQUFFLElBQUk7SUFDbkIsbUJBQW1CLEVBQUUsSUFBSTtJQUN6QixlQUFlLEVBQUUsSUFBSTtDQUN0QixDQUFDO0FBRUYsMkJBQW1DLFNBQVEscUJBQVM7SUFHbEQsWUFBWSxVQUFlLEVBQUU7UUFDM0IsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsT0FBTyxHQUFHLGFBQUssQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3pELGFBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxhQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVLLFdBQVcsQ0FBQyxNQUFjLEVBQUUsTUFBYzs7WUFDOUMsSUFBSSxRQUFRLEdBQUcsTUFBTSxhQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzVDLElBQUksUUFBUSxHQUFHLHNCQUFNLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM5QyxNQUFNLENBQUMsYUFBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2pFLENBQUM7S0FBQTtDQUNGO0FBZEQsc0RBY0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBtaW5pZnkgfSBmcm9tICdodG1sLW1pbmlmaWVyJztcbmltcG9ydCB7IFV0aWxzIH0gZnJvbSAnfi91dGlscyc7XG5pbXBvcnQgeyBQcm9jZXNzb3IgfSBmcm9tICd+L3Byb2Nlc3NvcnMvcHJvY2Vzc29yJztcbmltcG9ydCB7IFByb2Nlc3NSZXN1bHQgfSBmcm9tICd+L21vZGVscy9wcm9jZXNzb3ItbW9kZWxzJztcblxuY29uc3QgREVGQVVMVF9PUFRTID0ge1xuICBjb2xsYXBzZUJvb2xlYW5BdHRyaWJ1dGVzOiB0cnVlLFxuICBjb2xsYXBzZVdoaXRlc3BhY2U6IHRydWUsXG4gIGRlY29kZUVudGl0aWVzOiB0cnVlLFxuICBodG1sNTogdHJ1ZSxcbiAgbWluaWZ5Q1NTOiB0cnVlLFxuICBtaW5pZnlKUzogdHJ1ZSxcbiAgcHJvY2Vzc0NvbmRpdGlvbmFsQ29tbWVudHM6IHRydWUsXG4gIHJlbW92ZUF0dHJpYnV0ZVF1b3RlczogdHJ1ZSxcbiAgcmVtb3ZlQ29tbWVudHM6IHRydWUsXG4gIHJlbW92ZUVtcHR5QXR0cmlidXRlczogdHJ1ZSxcbiAgcmVtb3ZlT3B0aW9uYWxUYWdzOiB0cnVlLFxuICByZW1vdmVSZWR1bmRhbnRBdHRyaWJ1dGVzOiB0cnVlLFxuICByZW1vdmVTY3JpcHRUeXBlQXR0cmlidXRlczogdHJ1ZSxcbiAgcmVtb3ZlU3R5bGVMaW5rVHlwZUF0dHJpYnV0ZXM6IHRydWUsXG4gIHJlbW92ZVRhZ1doaXRlc3BhY2U6IHRydWUsXG4gIHNvcnRBdHRyaWJ1dGVzOiB0cnVlLFxuICBzb3J0Q2xhc3NOYW1lOiB0cnVlLFxuICB0cmltQ3VzdG9tRnJhZ21lbnRzOiB0cnVlLFxuICB1c2VTaG9ydERvY3R5cGU6IHRydWVcbn07XG5cbmV4cG9ydCBjbGFzcyBIVE1MTWluaWZpZXJQcm9jZXNzb3IgZXh0ZW5kcyBQcm9jZXNzb3Ige1xuICBwcml2YXRlIG9wdGlvbnM6IGFueTtcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zOiBhbnkgPSB7fSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5vcHRpb25zID0gVXRpbHMuc2hhbGxvd01lcmdlKERFRkFVTFRfT1BUUywgb3B0aW9ucyk7XG4gICAgVXRpbHMuZGJnKCkgJiYgVXRpbHMuZGVidWcoJ09wdGlvbnM6JywgdGhpcy5vcHRpb25zKTtcbiAgfVxuXG4gIGFzeW5jIHByb2Nlc3NGaWxlKHNvdXJjZTogc3RyaW5nLCB0YXJnZXQ6IHN0cmluZyk6IFByb21pc2U8UHJvY2Vzc1Jlc3VsdD4ge1xuICAgIGxldCBjb250ZW50cyA9IGF3YWl0IFV0aWxzLnJlYWRGaWxlKHNvdXJjZSk7XG4gICAgbGV0IG1pbmlmaWVkID0gbWluaWZ5KGNvbnRlbnRzLCB0aGlzLm9wdGlvbnMpO1xuICAgIHJldHVybiBVdGlscy53cml0ZUZpbGUodGFyZ2V0LCBtaW5pZmllZCkudGhlbigoKSA9PiB1bmRlZmluZWQpO1xuICB9XG59XG4iXX0=