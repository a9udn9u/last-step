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
        this.options.plugins = (this.options.plugins || []).concat(replace(utils_1.Utils.shallowMerge(DEFAULT_OPTS.replace, options.replace)), globals(), builtins(), json(utils_1.Utils.shallowMerge(DEFAULT_OPTS.json, options.json)), resolve(utils_1.Utils.shallowMerge(DEFAULT_OPTS.nodeResolve, options.nodeResolve)), commonjs(utils_1.Utils.shallowMerge(DEFAULT_OPTS.commonJS, options.commonJS)));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9sbHVwanMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcHJvY2Vzc29ycy9yb2xsdXBqcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsaUNBQWlDO0FBQ2pDLHNEQUFzRDtBQUN0RCx3REFBd0Q7QUFDeEQsc0RBQXNEO0FBQ3RELG1EQUFtRDtBQUNuRCwyQ0FBMkM7QUFDM0MsaURBQWlEO0FBQ2pELG1DQUFnQztBQUNoQyxzREFBbUQ7QUFDbkQsZ0VBQTBEO0FBRTFELE1BQU0sWUFBWSxHQUFHO0lBQ25CLFlBQVk7SUFDWixRQUFRLEVBQUU7UUFDUixNQUFNLEVBQUU7WUFDTixNQUFNLEVBQUUsTUFBTTtZQUNkLElBQUksRUFBRSxtQkFBbUI7U0FDMUI7S0FDRjtJQUVELDZCQUE2QjtJQUM3QixXQUFXLEVBQUU7UUFDWCxPQUFPLEVBQUUsSUFBSTtLQUNkO0lBRUQseUJBQXlCO0lBQ3pCLFFBQVEsRUFBRSxFQUNUO0lBRUQscUJBQXFCO0lBQ3JCLElBQUksRUFBRSxFQUNMO0lBRUQsd0JBQXdCO0lBQ3hCLE9BQU8sRUFBRTtRQUNQLHNCQUFzQixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDO0tBQ3JEO0NBQ0YsQ0FBQztBQUVGLHVCQUErQixTQUFRLHFCQUFTO0lBRzlDLFlBQVksVUFBZSxFQUFFO1FBQzNCLEtBQUssRUFBRSxDQUFDO1FBQ1IsT0FBTyxHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUM7UUFDeEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxhQUFLLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzNFLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxDQUN4RCxPQUFPLENBQUMsYUFBSyxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUNsRSxPQUFPLEVBQUUsRUFDVCxRQUFRLEVBQUUsRUFDVixJQUFJLENBQUMsYUFBSyxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUN6RCxPQUFPLENBQUMsYUFBSyxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUMxRSxRQUFRLENBQUMsYUFBSyxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUN0RSxDQUFDO1FBQ0YsYUFBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLGFBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRUssV0FBVyxDQUFDLE1BQWMsRUFBRSxNQUFjOztZQUM5QyxJQUFJLE9BQU8sR0FBRyxhQUFLLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQzdDLEtBQUssRUFBRSxNQUFNO2dCQUNiLElBQUksRUFBRSxNQUFNO2FBQ2IsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxNQUFNLEdBQUcsTUFBTSxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzFDLDZCQUE2QjtZQUM3QixJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3pFLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLGdDQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNuRSxDQUFDO0tBQUE7Q0FDRjtBQTVCRCw4Q0E0QkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyByb2xsdXAgZnJvbSAncm9sbHVwJztcbmltcG9ydCAqIGFzIHJlc29sdmUgZnJvbSAncm9sbHVwLXBsdWdpbi1ub2RlLXJlc29sdmUnO1xuaW1wb3J0ICogYXMgYnVpbHRpbnMgZnJvbSAncm9sbHVwLXBsdWdpbi1ub2RlLWJ1aWx0aW5zJztcbmltcG9ydCAqIGFzIGdsb2JhbHMgZnJvbSAncm9sbHVwLXBsdWdpbi1ub2RlLWdsb2JhbHMnO1xuaW1wb3J0ICogYXMgY29tbW9uanMgZnJvbSAncm9sbHVwLXBsdWdpbi1jb21tb25qcyc7XG5pbXBvcnQgKiBhcyBqc29uIGZyb20gJ3JvbGx1cC1wbHVnaW4tanNvbic7XG5pbXBvcnQgKiBhcyByZXBsYWNlIGZyb20gJ3JvbGx1cC1wbHVnaW4tcmVwbGFjZSc7XG5pbXBvcnQgeyBVdGlscyB9IGZyb20gJ34vdXRpbHMnO1xuaW1wb3J0IHsgUHJvY2Vzc29yIH0gZnJvbSAnfi9wcm9jZXNzb3JzL3Byb2Nlc3Nvcic7XG5pbXBvcnQgeyBQcm9jZXNzUmVzdWx0IH0gZnJvbSAnfi9tb2RlbHMvcHJvY2Vzc29yLW1vZGVscyc7XG5cbmNvbnN0IERFRkFVTFRfT1BUUyA9IHtcbiAgLy8gcm9sbHVwLmpzXG4gIHJvbGx1cEpTOiB7XG4gICAgb3V0cHV0OiB7XG4gICAgICBmb3JtYXQ6ICdpaWZlJyxcbiAgICAgIG5hbWU6ICdMYXN0U3RlcER1bW15TmFtZSdcbiAgICB9XG4gIH0sXG5cbiAgLy8gcm9sbHVwLXBsdWdpbi1ub2RlLXJlc29sdmVcbiAgbm9kZVJlc29sdmU6IHtcbiAgICBicm93c2VyOiB0cnVlXG4gIH0sXG5cbiAgLy8gcm9sbHVwLXBsdWdpbi1jb21tb25qc1xuICBjb21tb25KUzoge1xuICB9LFxuXG4gIC8vIHJvbGx1cC1wbHVnaW4tanNvblxuICBqc29uOiB7XG4gIH0sXG5cbiAgLy8gcm9sbHVwLXBsdWdpbi1yZXBsYWNlXG4gIHJlcGxhY2U6IHtcbiAgICAncHJvY2Vzcy5lbnYuTk9ERV9FTlYnOiBKU09OLnN0cmluZ2lmeSgncHJvZHVjdGlvbicpXG4gIH0sXG59O1xuXG5leHBvcnQgY2xhc3MgUm9sbHVwSlNQcm9jZXNzb3IgZXh0ZW5kcyBQcm9jZXNzb3Ige1xuICBwcml2YXRlIG9wdGlvbnM6IGFueTtcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zOiBhbnkgPSB7fSkge1xuICAgIHN1cGVyKCk7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdGhpcy5vcHRpb25zID0gVXRpbHMuc2hhbGxvd01lcmdlKERFRkFVTFRfT1BUUy5yb2xsdXBKUywgb3B0aW9ucy5yb2xsdXBKUyk7XG4gICAgdGhpcy5vcHRpb25zLnBsdWdpbnMgPSAodGhpcy5vcHRpb25zLnBsdWdpbnMgfHwgW10pLmNvbmNhdChcbiAgICAgIHJlcGxhY2UoVXRpbHMuc2hhbGxvd01lcmdlKERFRkFVTFRfT1BUUy5yZXBsYWNlLCBvcHRpb25zLnJlcGxhY2UpKSxcbiAgICAgIGdsb2JhbHMoKSxcbiAgICAgIGJ1aWx0aW5zKCksXG4gICAgICBqc29uKFV0aWxzLnNoYWxsb3dNZXJnZShERUZBVUxUX09QVFMuanNvbiwgb3B0aW9ucy5qc29uKSksXG4gICAgICByZXNvbHZlKFV0aWxzLnNoYWxsb3dNZXJnZShERUZBVUxUX09QVFMubm9kZVJlc29sdmUsIG9wdGlvbnMubm9kZVJlc29sdmUpKSxcbiAgICAgIGNvbW1vbmpzKFV0aWxzLnNoYWxsb3dNZXJnZShERUZBVUxUX09QVFMuY29tbW9uSlMsIG9wdGlvbnMuY29tbW9uSlMpKSxcbiAgICApO1xuICAgIFV0aWxzLmRiZygpICYmIFV0aWxzLmRlYnVnKCdPcHRpb25zOicsIHRoaXMub3B0aW9ucyk7XG4gIH1cblxuICBhc3luYyBwcm9jZXNzRmlsZShzb3VyY2U6IHN0cmluZywgdGFyZ2V0OiBzdHJpbmcpOiBQcm9taXNlPFByb2Nlc3NSZXN1bHQ+IHtcbiAgICBsZXQgb3B0aW9ucyA9IFV0aWxzLnNoYWxsb3dNZXJnZSh0aGlzLm9wdGlvbnMsIHtcbiAgICAgIGlucHV0OiBzb3VyY2UsXG4gICAgICBmaWxlOiB0YXJnZXRcbiAgICB9KTtcbiAgICBsZXQgYnVuZGxlID0gYXdhaXQgcm9sbHVwLnJvbGx1cChvcHRpb25zKTtcbiAgICAvLyBMb2NhbCBpbXBvcnRzIGJ5IHRoaXMgZmlsZVxuICAgIGxldCBkZXBzID0gYnVuZGxlLm1vZHVsZXMucmVkdWNlKChpLCBtKSA9PiBpLmNvbmNhdChtLmRlcGVuZGVuY2llcyksIFtdKTtcbiAgICByZXR1cm4gYnVuZGxlLndyaXRlKG9wdGlvbnMpLnRoZW4oKCkgPT4gbmV3IFByb2Nlc3NSZXN1bHQoZGVwcykpO1xuICB9XG59XG4iXX0=