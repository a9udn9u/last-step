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
    // Turn off plugins
    plugins: {
        babel: true,
        nodeResolve: true,
        nodeBuiltins: true,
        nodeGlobals: true,
        commonJS: true,
        json: true,
        replace: true,
    },
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
        let pluginToggles = utils_1.Utils.shallowMerge(DEFAULT_OPTS.plugins || options.plugins);
        let plugins = [];
        if (pluginToggles.replace)
            plugins = plugins.concat(replace(utils_1.Utils.shallowMerge(DEFAULT_OPTS.replace, options.replace)));
        if (pluginToggles.nodeGlobals)
            plugins = plugins.concat(globals());
        if (pluginToggles.nodeBuiltins)
            plugins = plugins.concat(builtins());
        if (pluginToggles.json)
            plugins = plugins.concat(json(utils_1.Utils.shallowMerge(DEFAULT_OPTS.json, options.json)));
        if (pluginToggles.nodeResolve)
            plugins = plugins.concat(resolve(utils_1.Utils.shallowMerge(DEFAULT_OPTS.nodeResolve, options.nodeResolve)));
        if (pluginToggles.babel)
            plugins = plugins.concat(babel(utils_1.Utils.shallowMerge(DEFAULT_OPTS.babel, options.babel)));
        if (pluginToggles.commonJS)
            plugins = plugins.concat(commonjs(utils_1.Utils.shallowMerge(DEFAULT_OPTS.commonJS, options.commonJS)));
        this.options = utils_1.Utils.shallowMerge(DEFAULT_OPTS.rollupJS, options.rollupJS);
        this.options.plugins = plugins.concat(this.options.plugins || []);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9sbHVwanMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcHJvY2Vzc29ycy9yb2xsdXBqcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsaUNBQWlDO0FBQ2pDLDZDQUE2QztBQUM3QyxzREFBc0Q7QUFDdEQsd0RBQXdEO0FBQ3hELHNEQUFzRDtBQUN0RCxtREFBbUQ7QUFDbkQsMkNBQTJDO0FBQzNDLGlEQUFpRDtBQUNqRCxtQ0FBZ0M7QUFDaEMsc0RBQW1EO0FBQ25ELGdFQUEwRDtBQUUxRCxNQUFNLFlBQVksR0FBRztJQUNuQixtQkFBbUI7SUFDbkIsT0FBTyxFQUFFO1FBQ1AsS0FBSyxFQUFFLElBQUk7UUFDWCxXQUFXLEVBQUUsSUFBSTtRQUNqQixZQUFZLEVBQUUsSUFBSTtRQUNsQixXQUFXLEVBQUUsSUFBSTtRQUNqQixRQUFRLEVBQUUsSUFBSTtRQUNkLElBQUksRUFBRSxJQUFJO1FBQ1YsT0FBTyxFQUFFLElBQUk7S0FDZDtJQUVELFlBQVk7SUFDWixRQUFRLEVBQUU7UUFDUixNQUFNLEVBQUU7WUFDTixNQUFNLEVBQUUsTUFBTTtZQUNkLElBQUksRUFBRSxtQkFBbUI7U0FDMUI7S0FDRjtJQUVELEtBQUssRUFBRTtRQUNMLE9BQU8sRUFBRSxLQUFLO1FBQ2QsT0FBTyxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUN0QyxPQUFPLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQztLQUM5QjtJQUVELDZCQUE2QjtJQUM3QixXQUFXLEVBQUU7UUFDWCxPQUFPLEVBQUUsSUFBSTtLQUNkO0lBRUQseUJBQXlCO0lBQ3pCLFFBQVEsRUFBRSxFQUNUO0lBRUQscUJBQXFCO0lBQ3JCLElBQUksRUFBRSxFQUNMO0lBRUQsd0JBQXdCO0lBQ3hCLE9BQU8sRUFBRTtRQUNQLHNCQUFzQixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFD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LENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDekUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksZ0NBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ25FLENBQUM7S0FBQTtDQUNGO0FBeENELDhDQXdDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHJvbGx1cCBmcm9tICdyb2xsdXAnO1xuaW1wb3J0ICogYXMgYmFiZWwgZnJvbSAncm9sbHVwLXBsdWdpbi1iYWJlbCc7XG5pbXBvcnQgKiBhcyByZXNvbHZlIGZyb20gJ3JvbGx1cC1wbHVnaW4tbm9kZS1yZXNvbHZlJztcbmltcG9ydCAqIGFzIGJ1aWx0aW5zIGZyb20gJ3JvbGx1cC1wbHVnaW4tbm9kZS1idWlsdGlucyc7XG5pbXBvcnQgKiBhcyBnbG9iYWxzIGZyb20gJ3JvbGx1cC1wbHVnaW4tbm9kZS1nbG9iYWxzJztcbmltcG9ydCAqIGFzIGNvbW1vbmpzIGZyb20gJ3JvbGx1cC1wbHVnaW4tY29tbW9uanMnO1xuaW1wb3J0ICogYXMganNvbiBmcm9tICdyb2xsdXAtcGx1Z2luLWpzb24nO1xuaW1wb3J0ICogYXMgcmVwbGFjZSBmcm9tICdyb2xsdXAtcGx1Z2luLXJlcGxhY2UnO1xuaW1wb3J0IHsgVXRpbHMgfSBmcm9tICd+L3V0aWxzJztcbmltcG9ydCB7IFByb2Nlc3NvciB9IGZyb20gJ34vcHJvY2Vzc29ycy9wcm9jZXNzb3InO1xuaW1wb3J0IHsgUHJvY2Vzc1Jlc3VsdCB9IGZyb20gJ34vbW9kZWxzL3Byb2Nlc3Nvci1tb2RlbHMnO1xuXG5jb25zdCBERUZBVUxUX09QVFMgPSB7XG4gIC8vIFR1cm4gb2ZmIHBsdWdpbnNcbiAgcGx1Z2luczoge1xuICAgIGJhYmVsOiB0cnVlLFxuICAgIG5vZGVSZXNvbHZlOiB0cnVlLFxuICAgIG5vZGVCdWlsdGluczogdHJ1ZSxcbiAgICBub2RlR2xvYmFsczogdHJ1ZSxcbiAgICBjb21tb25KUzogdHJ1ZSxcbiAgICBqc29uOiB0cnVlLFxuICAgIHJlcGxhY2U6IHRydWUsXG4gIH0sXG5cbiAgLy8gcm9sbHVwLmpzXG4gIHJvbGx1cEpTOiB7XG4gICAgb3V0cHV0OiB7XG4gICAgICBmb3JtYXQ6ICdpaWZlJyxcbiAgICAgIG5hbWU6ICdMYXN0U3RlcER1bW15TmFtZSdcbiAgICB9XG4gIH0sXG5cbiAgYmFiZWw6IHtcbiAgICBiYWJlbHJjOiBmYWxzZSxcbiAgICBwcmVzZXRzOiBbWydlbnYnLCB7IG1vZHVsZXM6IGZhbHNlIH1dXSxcbiAgICBwbHVnaW5zOiBbJ2V4dGVybmFsLWhlbHBlcnMnXVxuICB9LFxuXG4gIC8vIHJvbGx1cC1wbHVnaW4tbm9kZS1yZXNvbHZlXG4gIG5vZGVSZXNvbHZlOiB7XG4gICAgYnJvd3NlcjogdHJ1ZVxuICB9LFxuXG4gIC8vIHJvbGx1cC1wbHVnaW4tY29tbW9uanNcbiAgY29tbW9uSlM6IHtcbiAgfSxcblxuICAvLyByb2xsdXAtcGx1Z2luLWpzb25cbiAganNvbjoge1xuICB9LFxuXG4gIC8vIHJvbGx1cC1wbHVnaW4tcmVwbGFjZVxuICByZXBsYWNlOiB7XG4gICAgJ3Byb2Nlc3MuZW52Lk5PREVfRU5WJzogSlNPTi5zdHJpbmdpZnkoJ3Byb2R1Y3Rpb24nKVxuICB9LFxufTtcblxuZXhwb3J0IGNsYXNzIFJvbGx1cEpTUHJvY2Vzc29yIGV4dGVuZHMgUHJvY2Vzc29yIHtcbiAgcHJpdmF0ZSBvcHRpb25zOiBhbnk7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9uczogYW55ID0ge30pIHtcbiAgICBzdXBlcigpO1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIGxldCBwbHVnaW5Ub2dnbGVzID0gVXRpbHMuc2hhbGxvd01lcmdlKERFRkFVTFRfT1BUUy5wbHVnaW5zIHx8IG9wdGlvbnMucGx1Z2lucyk7XG4gICAgbGV0IHBsdWdpbnMgPSBbXTtcblxuICAgIGlmIChwbHVnaW5Ub2dnbGVzLnJlcGxhY2UpXG4gICAgICBwbHVnaW5zID0gcGx1Z2lucy5jb25jYXQocmVwbGFjZShVdGlscy5zaGFsbG93TWVyZ2UoREVGQVVMVF9PUFRTLnJlcGxhY2UsIG9wdGlvbnMucmVwbGFjZSkpKTtcbiAgICBpZiAocGx1Z2luVG9nZ2xlcy5ub2RlR2xvYmFscylcbiAgICAgIHBsdWdpbnMgPSBwbHVnaW5zLmNvbmNhdChnbG9iYWxzKCkpO1xuICAgIGlmIChwbHVnaW5Ub2dnbGVzLm5vZGVCdWlsdGlucylcbiAgICAgIHBsdWdpbnMgPSBwbHVnaW5zLmNvbmNhdChidWlsdGlucygpKTtcbiAgICBpZiAocGx1Z2luVG9nZ2xlcy5qc29uKVxuICAgICAgcGx1Z2lucyA9IHBsdWdpbnMuY29uY2F0KGpzb24oVXRpbHMuc2hhbGxvd01lcmdlKERFRkFVTFRfT1BUUy5qc29uLCBvcHRpb25zLmpzb24pKSk7XG4gICAgaWYgKHBsdWdpblRvZ2dsZXMubm9kZVJlc29sdmUpXG4gICAgICBwbHVnaW5zID0gcGx1Z2lucy5jb25jYXQocmVzb2x2ZShVdGlscy5zaGFsbG93TWVyZ2UoREVGQVVMVF9PUFRTLm5vZGVSZXNvbHZlLCBvcHRpb25zLm5vZGVSZXNvbHZlKSkpO1xuICAgIGlmIChwbHVnaW5Ub2dnbGVzLmJhYmVsKVxuICAgICAgcGx1Z2lucyA9IHBsdWdpbnMuY29uY2F0KGJhYmVsKFV0aWxzLnNoYWxsb3dNZXJnZShERUZBVUxUX09QVFMuYmFiZWwsIG9wdGlvbnMuYmFiZWwpKSk7XG4gICAgaWYgKHBsdWdpblRvZ2dsZXMuY29tbW9uSlMpXG4gICAgICBwbHVnaW5zID0gcGx1Z2lucy5jb25jYXQoY29tbW9uanMoVXRpbHMuc2hhbGxvd01lcmdlKERFRkFVTFRfT1BUUy5jb21tb25KUywgb3B0aW9ucy5jb21tb25KUykpKTtcblxuICAgIHRoaXMub3B0aW9ucyA9IFV0aWxzLnNoYWxsb3dNZXJnZShERUZBVUxUX09QVFMucm9sbHVwSlMsIG9wdGlvbnMucm9sbHVwSlMpO1xuICAgIHRoaXMub3B0aW9ucy5wbHVnaW5zID0gcGx1Z2lucy5jb25jYXQodGhpcy5vcHRpb25zLnBsdWdpbnMgfHwgW10pO1xuXG4gICAgVXRpbHMuZGJnKCkgJiYgVXRpbHMuZGVidWcoJ09wdGlvbnM6JywgdGhpcy5vcHRpb25zKTtcbiAgfVxuXG4gIGFzeW5jIHByb2Nlc3NGaWxlKHNvdXJjZTogc3RyaW5nLCB0YXJnZXQ6IHN0cmluZyk6IFByb21pc2U8UHJvY2Vzc1Jlc3VsdD4ge1xuICAgIGxldCBvcHRpb25zID0gVXRpbHMuc2hhbGxvd01lcmdlKHRoaXMub3B0aW9ucywge1xuICAgICAgaW5wdXQ6IHNvdXJjZSxcbiAgICAgIGZpbGU6IHRhcmdldFxuICAgIH0pO1xuICAgIGxldCBidW5kbGUgPSBhd2FpdCByb2xsdXAucm9sbHVwKG9wdGlvbnMpO1xuICAgIC8vIExvY2FsIGltcG9ydHMgYnkgdGhpcyBmaWxlXG4gICAgbGV0IGRlcHMgPSBidW5kbGUubW9kdWxlcy5yZWR1Y2UoKGksIG0pID0+IGkuY29uY2F0KG0uZGVwZW5kZW5jaWVzKSwgW10pO1xuICAgIHJldHVybiBidW5kbGUud3JpdGUob3B0aW9ucykudGhlbigoKSA9PiBuZXcgUHJvY2Vzc1Jlc3VsdChkZXBzKSk7XG4gIH1cbn1cbiJdfQ==