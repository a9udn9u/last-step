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
const CleanCSS = require("clean-css");
const utils_1 = require("~/utils");
const processor_1 = require("~/processors/processor");
const processor_models_1 = require("~/models/processor-models");
const DEFAULT_OPTS = {
    inline: ['local']
};
class CleanCSSProcessor extends processor_1.Processor {
    constructor(options = {}) {
        super();
        options = utils_1.Utils.shallowMerge(DEFAULT_OPTS, options, {
            returnPromise: true
        });
        this.ccss = new CleanCSS(options);
        utils_1.Utils.dbg() && utils_1.Utils.debug('Options:', options);
    }
    processFile(source, target) {
        return __awaiter(this, void 0, void 0, function* () {
            let compiled = yield this.ccss.minify([source]);
            let imports = new Set(compiled.inlinedStylesheets);
            imports.delete(source);
            return utils_1.Utils.writeFile(target, compiled.styles).then(() => new processor_models_1.ProcessResult([...imports]));
        });
    }
}
exports.CleanCSSProcessor = CleanCSSProcessor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xlYW4tY3NzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3Byb2Nlc3NvcnMvY2xlYW4tY3NzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxzQ0FBc0M7QUFDdEMsbUNBQWdDO0FBQ2hDLHNEQUFtRDtBQUNuRCxnRUFBMEQ7QUFFMUQsTUFBTSxZQUFZLEdBQUc7SUFDbkIsTUFBTSxFQUFFLENBQUMsT0FBTyxDQUFDO0NBQ2xCLENBQUM7QUFFRix1QkFBK0IsU0FBUSxxQkFBUztJQUc5QyxZQUFZLFVBQWUsRUFBRTtRQUMzQixLQUFLLEVBQUUsQ0FBQztRQUNSLE9BQU8sR0FBRyxhQUFLLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxPQUFPLEVBQUU7WUFDbEQsYUFBYSxFQUFFLElBQUk7U0FDcEIsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsQyxhQUFLLENBQUMsR0FBRyxFQUFFLElBQUksYUFBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVLLFdBQVcsQ0FBQyxNQUFjLEVBQUUsTUFBYzs7WUFDOUMsSUFBSSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDaEQsSUFBSSxPQUFPLEdBQWdCLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQ2hFLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDdkIsTUFBTSxDQUFDLGFBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQ3RELElBQUksZ0NBQWEsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FDbEMsQ0FBQztRQUNKLENBQUM7S0FBQTtDQUNGO0FBcEJELDhDQW9CQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIENsZWFuQ1NTIGZyb20gJ2NsZWFuLWNzcyc7XG5pbXBvcnQgeyBVdGlscyB9IGZyb20gJ34vdXRpbHMnO1xuaW1wb3J0IHsgUHJvY2Vzc29yIH0gZnJvbSAnfi9wcm9jZXNzb3JzL3Byb2Nlc3Nvcic7XG5pbXBvcnQgeyBQcm9jZXNzUmVzdWx0IH0gZnJvbSAnfi9tb2RlbHMvcHJvY2Vzc29yLW1vZGVscyc7XG5cbmNvbnN0IERFRkFVTFRfT1BUUyA9IHtcbiAgaW5saW5lOiBbJ2xvY2FsJ11cbn07XG5cbmV4cG9ydCBjbGFzcyBDbGVhbkNTU1Byb2Nlc3NvciBleHRlbmRzIFByb2Nlc3NvciB7XG4gIHByaXZhdGUgY2NzczogQ2xlYW5DU1M7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9uczogYW55ID0ge30pIHtcbiAgICBzdXBlcigpO1xuICAgIG9wdGlvbnMgPSBVdGlscy5zaGFsbG93TWVyZ2UoREVGQVVMVF9PUFRTLCBvcHRpb25zLCB7XG4gICAgICByZXR1cm5Qcm9taXNlOiB0cnVlXG4gICAgfSk7XG4gICAgdGhpcy5jY3NzID0gbmV3IENsZWFuQ1NTKG9wdGlvbnMpO1xuICAgIFV0aWxzLmRiZygpICYmIFV0aWxzLmRlYnVnKCdPcHRpb25zOicsIG9wdGlvbnMpO1xuICB9XG5cbiAgYXN5bmMgcHJvY2Vzc0ZpbGUoc291cmNlOiBzdHJpbmcsIHRhcmdldDogc3RyaW5nKTogUHJvbWlzZTxQcm9jZXNzUmVzdWx0PiB7XG4gICAgbGV0IGNvbXBpbGVkID0gYXdhaXQgdGhpcy5jY3NzLm1pbmlmeShbc291cmNlXSk7XG4gICAgbGV0IGltcG9ydHM6IFNldDxzdHJpbmc+ID0gbmV3IFNldChjb21waWxlZC5pbmxpbmVkU3R5bGVzaGVldHMpO1xuICAgIGltcG9ydHMuZGVsZXRlKHNvdXJjZSk7XG4gICAgcmV0dXJuIFV0aWxzLndyaXRlRmlsZSh0YXJnZXQsIGNvbXBpbGVkLnN0eWxlcykudGhlbigoKSA9PlxuICAgICAgICBuZXcgUHJvY2Vzc1Jlc3VsdChbLi4uaW1wb3J0c10pXG4gICAgKTtcbiAgfVxufVxuIl19