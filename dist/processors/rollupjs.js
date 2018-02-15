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
        presets: [['env', { modules: false }]],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9sbHVwanMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcHJvY2Vzc29ycy9yb2xsdXBqcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsaUNBQWlDO0FBQ2pDLDZDQUE2QztBQUM3QyxzREFBc0Q7QUFDdEQsd0RBQXdEO0FBQ3hELHNEQUFzRDtBQUN0RCxtREFBbUQ7QUFDbkQsMkNBQTJDO0FBQzNDLGlEQUFpRDtBQUNqRCxtQ0FBZ0M7QUFDaEMsc0RBQW1EO0FBQ25ELGdFQUEwRDtBQUUxRCxNQUFNLFlBQVksR0FBRztJQUNuQixZQUFZO0lBQ1osUUFBUSxFQUFFO1FBQ1IsTUFBTSxFQUFFO1lBQ04sTUFBTSxFQUFFLE1BQU07WUFDZCxJQUFJLEVBQUUsbUJBQW1CO1NBQzFCO0tBQ0Y7SUFFRCxLQUFLLEVBQUU7UUFDTCxPQUFPLEVBQUUsS0FBSztRQUNkLE9BQU8sRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDdEMsT0FBTyxFQUFFLENBQUMsa0JBQWtCLENBQUM7S0FDOUI7SUFFRCw2QkFBNkI7SUFDN0IsV0FBVyxFQUFFO1FBQ1gsT0FBTyxFQUFFLElBQUk7S0FDZDtJQUVELHlCQUF5QjtJQUN6QixRQUFRLEVBQUUsRUFDVDtJQUVELHFCQUFxQjtJQUNyQixJQUFJLEVBQUUsRUFDTDtJQUVELHdCQUF3QjtJQUN4QixPQUFPLEVBQUU7UUFDUCxzQkFBc0IsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQztLQUNyRDtDQUNGLENBQUM7QUFFRix1QkFBK0IsU0FBUSxxQkFBUztJQUc5QyxZQUFZLFVBQWUsRUFBRTtRQUMzQixLQUFLLEVBQUUsQ0FBQztRQUNSLE9BQU8sR0FBRyxPQUFPLElBQUksRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxPQUFPLEdBQUcsYUFBSyxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMzRSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FDeEQsT0FBTyxDQUFDLGFBQUssQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsRUFDbEUsT0FBTyxFQUFFLEVBQ1QsUUFBUSxFQUFFLEVBQ1YsSUFBSSxDQUFDLGFBQUssQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsRUFDekQsT0FBTyxDQUFDLGFBQUssQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsRUFDMUUsS0FBSyxDQUFDLGFBQUssQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFDNUQsUUFBUSxDQUFDLGFBQUssQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FDdEUsQ0FBQztRQUNGLGFBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxhQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVLLFdBQVcsQ0FBQyxNQUFjLEVBQUUsTUFBYzs7WUFDOUMsSUFBSSxPQUFPLEdBQUcsYUFBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUM3QyxLQUFLLEVBQUUsTUFBTTtnQkFDYixJQUFJLEVBQUUsTUFBTTthQUNiLENBQUMsQ0FBQztZQUNILElBQUksTUFBTSxHQUFHLE1BQU0sTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMxQyw2QkFBNkI7WUFDN0IsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN6RSxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxnQ0FBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbkUsQ0FBQztLQUFBO0NBQ0Y7QUE3QkQsOENBNkJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgcm9sbHVwIGZyb20gJ3JvbGx1cCc7XG5pbXBvcnQgKiBhcyBiYWJlbCBmcm9tICdyb2xsdXAtcGx1Z2luLWJhYmVsJztcbmltcG9ydCAqIGFzIHJlc29sdmUgZnJvbSAncm9sbHVwLXBsdWdpbi1ub2RlLXJlc29sdmUnO1xuaW1wb3J0ICogYXMgYnVpbHRpbnMgZnJvbSAncm9sbHVwLXBsdWdpbi1ub2RlLWJ1aWx0aW5zJztcbmltcG9ydCAqIGFzIGdsb2JhbHMgZnJvbSAncm9sbHVwLXBsdWdpbi1ub2RlLWdsb2JhbHMnO1xuaW1wb3J0ICogYXMgY29tbW9uanMgZnJvbSAncm9sbHVwLXBsdWdpbi1jb21tb25qcyc7XG5pbXBvcnQgKiBhcyBqc29uIGZyb20gJ3JvbGx1cC1wbHVnaW4tanNvbic7XG5pbXBvcnQgKiBhcyByZXBsYWNlIGZyb20gJ3JvbGx1cC1wbHVnaW4tcmVwbGFjZSc7XG5pbXBvcnQgeyBVdGlscyB9IGZyb20gJ34vdXRpbHMnO1xuaW1wb3J0IHsgUHJvY2Vzc29yIH0gZnJvbSAnfi9wcm9jZXNzb3JzL3Byb2Nlc3Nvcic7XG5pbXBvcnQgeyBQcm9jZXNzUmVzdWx0IH0gZnJvbSAnfi9tb2RlbHMvcHJvY2Vzc29yLW1vZGVscyc7XG5cbmNvbnN0IERFRkFVTFRfT1BUUyA9IHtcbiAgLy8gcm9sbHVwLmpzXG4gIHJvbGx1cEpTOiB7XG4gICAgb3V0cHV0OiB7XG4gICAgICBmb3JtYXQ6ICdpaWZlJyxcbiAgICAgIG5hbWU6ICdMYXN0U3RlcER1bW15TmFtZSdcbiAgICB9XG4gIH0sXG5cbiAgYmFiZWw6IHtcbiAgICBiYWJlbHJjOiBmYWxzZSxcbiAgICBwcmVzZXRzOiBbWydlbnYnLCB7IG1vZHVsZXM6IGZhbHNlIH1dXSxcbiAgICBwbHVnaW5zOiBbJ2V4dGVybmFsLWhlbHBlcnMnXVxuICB9LFxuXG4gIC8vIHJvbGx1cC1wbHVnaW4tbm9kZS1yZXNvbHZlXG4gIG5vZGVSZXNvbHZlOiB7XG4gICAgYnJvd3NlcjogdHJ1ZVxuICB9LFxuXG4gIC8vIHJvbGx1cC1wbHVnaW4tY29tbW9uanNcbiAgY29tbW9uSlM6IHtcbiAgfSxcblxuICAvLyByb2xsdXAtcGx1Z2luLWpzb25cbiAganNvbjoge1xuICB9LFxuXG4gIC8vIHJvbGx1cC1wbHVnaW4tcmVwbGFjZVxuICByZXBsYWNlOiB7XG4gICAgJ3Byb2Nlc3MuZW52Lk5PREVfRU5WJzogSlNPTi5zdHJpbmdpZnkoJ3Byb2R1Y3Rpb24nKVxuICB9LFxufTtcblxuZXhwb3J0IGNsYXNzIFJvbGx1cEpTUHJvY2Vzc29yIGV4dGVuZHMgUHJvY2Vzc29yIHtcbiAgcHJpdmF0ZSBvcHRpb25zOiBhbnk7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9uczogYW55ID0ge30pIHtcbiAgICBzdXBlcigpO1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHRoaXMub3B0aW9ucyA9IFV0aWxzLnNoYWxsb3dNZXJnZShERUZBVUxUX09QVFMucm9sbHVwSlMsIG9wdGlvbnMucm9sbHVwSlMpO1xuICAgIHRoaXMub3B0aW9ucy5wbHVnaW5zID0gKHRoaXMub3B0aW9ucy5wbHVnaW5zIHx8IFtdKS5jb25jYXQoXG4gICAgICByZXBsYWNlKFV0aWxzLnNoYWxsb3dNZXJnZShERUZBVUxUX09QVFMucmVwbGFjZSwgb3B0aW9ucy5yZXBsYWNlKSksXG4gICAgICBnbG9iYWxzKCksXG4gICAgICBidWlsdGlucygpLFxuICAgICAganNvbihVdGlscy5zaGFsbG93TWVyZ2UoREVGQVVMVF9PUFRTLmpzb24sIG9wdGlvbnMuanNvbikpLFxuICAgICAgcmVzb2x2ZShVdGlscy5zaGFsbG93TWVyZ2UoREVGQVVMVF9PUFRTLm5vZGVSZXNvbHZlLCBvcHRpb25zLm5vZGVSZXNvbHZlKSksXG4gICAgICBiYWJlbChVdGlscy5zaGFsbG93TWVyZ2UoREVGQVVMVF9PUFRTLmJhYmVsLCBvcHRpb25zLmJhYmVsKSksXG4gICAgICBjb21tb25qcyhVdGlscy5zaGFsbG93TWVyZ2UoREVGQVVMVF9PUFRTLmNvbW1vbkpTLCBvcHRpb25zLmNvbW1vbkpTKSksXG4gICAgKTtcbiAgICBVdGlscy5kYmcoKSAmJiBVdGlscy5kZWJ1ZygnT3B0aW9uczonLCB0aGlzLm9wdGlvbnMpO1xuICB9XG5cbiAgYXN5bmMgcHJvY2Vzc0ZpbGUoc291cmNlOiBzdHJpbmcsIHRhcmdldDogc3RyaW5nKTogUHJvbWlzZTxQcm9jZXNzUmVzdWx0PiB7XG4gICAgbGV0IG9wdGlvbnMgPSBVdGlscy5zaGFsbG93TWVyZ2UodGhpcy5vcHRpb25zLCB7XG4gICAgICBpbnB1dDogc291cmNlLFxuICAgICAgZmlsZTogdGFyZ2V0XG4gICAgfSk7XG4gICAgbGV0IGJ1bmRsZSA9IGF3YWl0IHJvbGx1cC5yb2xsdXAob3B0aW9ucyk7XG4gICAgLy8gTG9jYWwgaW1wb3J0cyBieSB0aGlzIGZpbGVcbiAgICBsZXQgZGVwcyA9IGJ1bmRsZS5tb2R1bGVzLnJlZHVjZSgoaSwgbSkgPT4gaS5jb25jYXQobS5kZXBlbmRlbmNpZXMpLCBbXSk7XG4gICAgcmV0dXJuIGJ1bmRsZS53cml0ZShvcHRpb25zKS50aGVuKCgpID0+IG5ldyBQcm9jZXNzUmVzdWx0KGRlcHMpKTtcbiAgfVxufVxuIl19