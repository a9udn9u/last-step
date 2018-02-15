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
const rollup = require("rollup");
const babel = require("rollup-plugin-babel");
const resolve = require("rollup-plugin-node-resolve");
const builtins = require("rollup-plugin-node-builtins");
const globals = require("rollup-plugin-node-globals");
const commonjs = require("rollup-plugin-commonjs");
const json = require("rollup-plugin-json");
const replace = require("rollup-plugin-replace");
const utils_1 = require("~/utils");
const processor_1 = require("~/processors/processor");
const processor_models_1 = require("~/models/processor-models");
const DEFAULT_OPTS = {
    // rollup.js
    rollupJS: {
        output: {
            format: 'iife',
            name: 'LastStepDummyName'
        }
    },
    babel: {
        babelrc: false,
        presets: ['env', { modules: false }],
        plugins: ['external-helpers']
    },
    // rollup-plugin-node-resolve
    nodeResolve: {
        browser: true
    },
    // rollup-plugin-commonjs
    commonJS: {},
    // rollup-plugin-json
    json: {},
    // rollup-plugin-replace
    replace: {
        'process.env.NODE_ENV': JSON.stringify('production')
    },
};
class RollupJSProcessor extends processor_1.Processor {
    constructor(options = {}) {
        super();
        options = options || {};
        this.options = utils_1.Utils.shallowMerge(DEFAULT_OPTS.rollupJS, options.rollupJS);
        this.options.plugins = (this.options.plugins || []).concat(replace(utils_1.Utils.shallowMerge(DEFAULT_OPTS.replace, options.replace)), globals(), builtins(), json(utils_1.Utils.shallowMerge(DEFAULT_OPTS.json, options.json)), resolve(utils_1.Utils.shallowMerge(DEFAULT_OPTS.nodeResolve, options.nodeResolve)), babel(utils_1.Utils.shallowMerge(DEFAULT_OPTS.babel, options.babel)), commonjs(utils_1.Utils.shallowMerge(DEFAULT_OPTS.commonJS, options.commonJS)));
        utils_1.Utils.dbg() && utils_1.Utils.debug('Options:', this.options);
    }
    processFile(source, target) {
        return __awaiter(this, void 0, void 0, function* () {
            let options = utils_1.Utils.shallowMerge(this.options, {
                input: source,
                file: target
            });
            let bundle = yield rollup.rollup(options);
            // Local imports by this file
            let deps = bundle.modules.reduce((i, m) => i.concat(m.dependencies), []);
            return bundle.write(options).then(() => new processor_models_1.ProcessResult(deps));
        });
    }
}
exports.RollupJSProcessor = RollupJSProcessor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9sbHVwanMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcHJvY2Vzc29ycy9yb2xsdXBqcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsaUNBQWlDO0FBQ2pDLDZDQUE2QztBQUM3QyxzREFBc0Q7QUFDdEQsd0RBQXdEO0FBQ3hELHNEQUFzRDtBQUN0RCxtREFBbUQ7QUFDbkQsMkNBQTJDO0FBQzNDLGlEQUFpRDtBQUNqRCxtQ0FBZ0M7QUFDaEMsc0RBQW1EO0FBQ25ELGdFQUEwRDtBQUUxRCxNQUFNLFlBQVksR0FBRztJQUNuQixZQUFZO0lBQ1osUUFBUSxFQUFFO1FBQ1IsTUFBTSxFQUFFO1lBQ04sTUFBTSxFQUFFLE1BQU07WUFDZCxJQUFJLEVBQUUsbUJBQW1CO1NBQzFCO0tBQ0Y7SUFFRCxLQUFLLEVBQUU7UUFDTCxPQUFPLEVBQUUsS0FBSztRQUNkLE9BQU8sRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQztRQUNwQyxPQUFPLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQztLQUM5QjtJQUVELDZCQUE2QjtJQUM3QixXQUFXLEVBQUU7UUFDWCxPQUFPLEVBQUUsSUFBSTtLQUNkO0lBRUQseUJBQXlCO0lBQ3pCLFFBQVEsRUFBRSxFQUNUO0lBRUQscUJBQXFCO0lBQ3JCLElBQUksRUFBRSxFQUNMO0lBRUQsd0JBQXdCO0lBQ3hCLE9BQU8sRUFBRTtRQUNQLHNCQUFzQixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDO0tBQ3JEO0NBQ0YsQ0FBQztBQUVGLHVCQUErQixTQUFRLHFCQUFTO0lBRzlDLFlBQVksVUFBZSxFQUFFO1FBQzNCLEtBQUssRUFBRSxDQUFDO1FBQ1IsT0FBTyxHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUM7UUFDeEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxhQUFLLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzNFLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxDQUN4RCxPQUFPLENBQUMsYUFBSyxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUNsRSxPQUFPLEVBQUUsRUFDVCxRQUFRLEVBQUUsRUFDVixJQUFJLENBQUMsYUFBSyxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUN6RCxPQUFPLENBQUMsYUFBSyxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUMxRSxLQUFLLENBQUMsYUFBSyxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUM1RCxRQUFRLENBQUMsYUFBSyxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUN0RSxDQUFDO1FBQ0YsYUFBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLGFBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRUssV0FBVyxDQUFDLE1BQWMsRUFBRSxNQUFjOztZQUM5QyxJQUFJLE9BQU8sR0FBRyxhQUFLLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQzdDLEtBQUssRUFBRSxNQUFNO2dCQUNiLElBQUksRUFBRSxNQUFNO2FBQ2IsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxNQUFNLEdBQUcsTUFBTSxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzFDLDZCQUE2QjtZQUM3QixJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3pFLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLGdDQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNuRSxDQUFDO0tBQUE7Q0FDRjtBQTdCRCw4Q0E2QkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyByb2xsdXAgZnJvbSAncm9sbHVwJztcbmltcG9ydCAqIGFzIGJhYmVsIGZyb20gJ3JvbGx1cC1wbHVnaW4tYmFiZWwnO1xuaW1wb3J0ICogYXMgcmVzb2x2ZSBmcm9tICdyb2xsdXAtcGx1Z2luLW5vZGUtcmVzb2x2ZSc7XG5pbXBvcnQgKiBhcyBidWlsdGlucyBmcm9tICdyb2xsdXAtcGx1Z2luLW5vZGUtYnVpbHRpbnMnO1xuaW1wb3J0ICogYXMgZ2xvYmFscyBmcm9tICdyb2xsdXAtcGx1Z2luLW5vZGUtZ2xvYmFscyc7XG5pbXBvcnQgKiBhcyBjb21tb25qcyBmcm9tICdyb2xsdXAtcGx1Z2luLWNvbW1vbmpzJztcbmltcG9ydCAqIGFzIGpzb24gZnJvbSAncm9sbHVwLXBsdWdpbi1qc29uJztcbmltcG9ydCAqIGFzIHJlcGxhY2UgZnJvbSAncm9sbHVwLXBsdWdpbi1yZXBsYWNlJztcbmltcG9ydCB7IFV0aWxzIH0gZnJvbSAnfi91dGlscyc7XG5pbXBvcnQgeyBQcm9jZXNzb3IgfSBmcm9tICd+L3Byb2Nlc3NvcnMvcHJvY2Vzc29yJztcbmltcG9ydCB7IFByb2Nlc3NSZXN1bHQgfSBmcm9tICd+L21vZGVscy9wcm9jZXNzb3ItbW9kZWxzJztcblxuY29uc3QgREVGQVVMVF9PUFRTID0ge1xuICAvLyByb2xsdXAuanNcbiAgcm9sbHVwSlM6IHtcbiAgICBvdXRwdXQ6IHtcbiAgICAgIGZvcm1hdDogJ2lpZmUnLFxuICAgICAgbmFtZTogJ0xhc3RTdGVwRHVtbXlOYW1lJ1xuICAgIH1cbiAgfSxcblxuICBiYWJlbDoge1xuICAgIGJhYmVscmM6IGZhbHNlLFxuICAgIHByZXNldHM6IFsnZW52JywgeyBtb2R1bGVzOiBmYWxzZSB9XSxcbiAgICBwbHVnaW5zOiBbJ2V4dGVybmFsLWhlbHBlcnMnXVxuICB9LFxuXG4gIC8vIHJvbGx1cC1wbHVnaW4tbm9kZS1yZXNvbHZlXG4gIG5vZGVSZXNvbHZlOiB7XG4gICAgYnJvd3NlcjogdHJ1ZVxuICB9LFxuXG4gIC8vIHJvbGx1cC1wbHVnaW4tY29tbW9uanNcbiAgY29tbW9uSlM6IHtcbiAgfSxcblxuICAvLyByb2xsdXAtcGx1Z2luLWpzb25cbiAganNvbjoge1xuICB9LFxuXG4gIC8vIHJvbGx1cC1wbHVnaW4tcmVwbGFjZVxuICByZXBsYWNlOiB7XG4gICAgJ3Byb2Nlc3MuZW52Lk5PREVfRU5WJzogSlNPTi5zdHJpbmdpZnkoJ3Byb2R1Y3Rpb24nKVxuICB9LFxufTtcblxuZXhwb3J0IGNsYXNzIFJvbGx1cEpTUHJvY2Vzc29yIGV4dGVuZHMgUHJvY2Vzc29yIHtcbiAgcHJpdmF0ZSBvcHRpb25zOiBhbnk7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9uczogYW55ID0ge30pIHtcbiAgICBzdXBlcigpO1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHRoaXMub3B0aW9ucyA9IFV0aWxzLnNoYWxsb3dNZXJnZShERUZBVUxUX09QVFMucm9sbHVwSlMsIG9wdGlvbnMucm9sbHVwSlMpO1xuICAgIHRoaXMub3B0aW9ucy5wbHVnaW5zID0gKHRoaXMub3B0aW9ucy5wbHVnaW5zIHx8IFtdKS5jb25jYXQoXG4gICAgICByZXBsYWNlKFV0aWxzLnNoYWxsb3dNZXJnZShERUZBVUxUX09QVFMucmVwbGFjZSwgb3B0aW9ucy5yZXBsYWNlKSksXG4gICAgICBnbG9iYWxzKCksXG4gICAgICBidWlsdGlucygpLFxuICAgICAganNvbihVdGlscy5zaGFsbG93TWVyZ2UoREVGQVVMVF9PUFRTLmpzb24sIG9wdGlvbnMuanNvbikpLFxuICAgICAgcmVzb2x2ZShVdGlscy5zaGFsbG93TWVyZ2UoREVGQVVMVF9PUFRTLm5vZGVSZXNvbHZlLCBvcHRpb25zLm5vZGVSZXNvbHZlKSksXG4gICAgICBiYWJlbChVdGlscy5zaGFsbG93TWVyZ2UoREVGQVVMVF9PUFRTLmJhYmVsLCBvcHRpb25zLmJhYmVsKSksXG4gICAgICBjb21tb25qcyhVdGlscy5zaGFsbG93TWVyZ2UoREVGQVVMVF9PUFRTLmNvbW1vbkpTLCBvcHRpb25zLmNvbW1vbkpTKSksXG4gICAgKTtcbiAgICBVdGlscy5kYmcoKSAmJiBVdGlscy5kZWJ1ZygnT3B0aW9uczonLCB0aGlzLm9wdGlvbnMpO1xuICB9XG5cbiAgYXN5bmMgcHJvY2Vzc0ZpbGUoc291cmNlOiBzdHJpbmcsIHRhcmdldDogc3RyaW5nKTogUHJvbWlzZTxQcm9jZXNzUmVzdWx0PiB7XG4gICAgbGV0IG9wdGlvbnMgPSBVdGlscy5zaGFsbG93TWVyZ2UodGhpcy5vcHRpb25zLCB7XG4gICAgICBpbnB1dDogc291cmNlLFxuICAgICAgZmlsZTogdGFyZ2V0XG4gICAgfSk7XG4gICAgbGV0IGJ1bmRsZSA9IGF3YWl0IHJvbGx1cC5yb2xsdXAob3B0aW9ucyk7XG4gICAgLy8gTG9jYWwgaW1wb3J0cyBieSB0aGlzIGZpbGVcbiAgICBsZXQgZGVwcyA9IGJ1bmRsZS5tb2R1bGVzLnJlZHVjZSgoaSwgbSkgPT4gaS5jb25jYXQobS5kZXBlbmRlbmNpZXMpLCBbXSk7XG4gICAgcmV0dXJuIGJ1bmRsZS53cml0ZShvcHRpb25zKS50aGVuKCgpID0+IG5ldyBQcm9jZXNzUmVzdWx0KGRlcHMpKTtcbiAgfVxufVxuIl19