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
const sass = require("node-sass");
const util = require("util");
const utils_1 = require("~/utils");
const processor_1 = require("~/processors/processor");
const processor_models_1 = require("~/models/processor-models");
const DEFAULT_OPTS = {};
const SASS_EXT = /\.sass$/i;
const sassAsync = util.promisify(sass.render).bind(sass);
class SASSProcessor extends processor_1.Processor {
    constructor(options = {}) {
        super();
        this.options = utils_1.Utils.shallowMerge(DEFAULT_OPTS, options);
        utils_1.Utils.dbg() && utils_1.Utils.debug('Options:', this.options);
    }
    processFile(source, target) {
        return __awaiter(this, void 0, void 0, function* () {
            target = target.replace(SASS_EXT, '.css');
            let contents = yield utils_1.Utils.readFile(source);
            let options = utils_1.Utils.shallowMerge(this.options, { file: source, outFile: target });
            let result = yield sassAsync(options);
            return utils_1.Utils.writeFile(target, result.css).then(() => new processor_models_1.ProcessResult(result.stats.includedFiles, target));
        });
    }
}
exports.SASSProcessor = SASSProcessor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Fzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcm9jZXNzb3JzL3Nhc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLGtDQUFrQztBQUNsQyw2QkFBNkI7QUFDN0IsbUNBQWdDO0FBQ2hDLHNEQUFtRDtBQUNuRCxnRUFBMEQ7QUFFMUQsTUFBTSxZQUFZLEdBQUcsRUFBRSxDQUFDO0FBRXhCLE1BQU0sUUFBUSxHQUFHLFVBQVUsQ0FBQztBQUU1QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFFekQsbUJBQTJCLFNBQVEscUJBQVM7SUFHMUMsWUFBWSxVQUFlLEVBQUU7UUFDM0IsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsT0FBTyxHQUFHLGFBQUssQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3pELGFBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxhQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVLLFdBQVcsQ0FBQyxNQUFjLEVBQUUsTUFBYzs7WUFDOUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzFDLElBQUksUUFBUSxHQUFHLE1BQU0sYUFBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM1QyxJQUFJLE9BQU8sR0FBRyxhQUFLLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQ2xGLElBQUksTUFBTSxHQUFHLE1BQU0sU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxhQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUNuRCxJQUFJLGdDQUFhLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQ3RELENBQUM7UUFDSixDQUFDO0tBQUE7Q0FDRjtBQWxCRCxzQ0FrQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBzYXNzIGZyb20gJ25vZGUtc2Fzcyc7XG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJ3V0aWwnO1xuaW1wb3J0IHsgVXRpbHMgfSBmcm9tICd+L3V0aWxzJztcbmltcG9ydCB7IFByb2Nlc3NvciB9IGZyb20gJ34vcHJvY2Vzc29ycy9wcm9jZXNzb3InO1xuaW1wb3J0IHsgUHJvY2Vzc1Jlc3VsdCB9IGZyb20gJ34vbW9kZWxzL3Byb2Nlc3Nvci1tb2RlbHMnO1xuXG5jb25zdCBERUZBVUxUX09QVFMgPSB7fTtcblxuY29uc3QgU0FTU19FWFQgPSAvXFwuc2FzcyQvaTtcblxuY29uc3Qgc2Fzc0FzeW5jID0gdXRpbC5wcm9taXNpZnkoc2Fzcy5yZW5kZXIpLmJpbmQoc2Fzcyk7XG5cbmV4cG9ydCBjbGFzcyBTQVNTUHJvY2Vzc29yIGV4dGVuZHMgUHJvY2Vzc29yIHtcbiAgcHJpdmF0ZSBvcHRpb25zOiBhbnk7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9uczogYW55ID0ge30pIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMub3B0aW9ucyA9IFV0aWxzLnNoYWxsb3dNZXJnZShERUZBVUxUX09QVFMsIG9wdGlvbnMpO1xuICAgIFV0aWxzLmRiZygpICYmIFV0aWxzLmRlYnVnKCdPcHRpb25zOicsIHRoaXMub3B0aW9ucyk7XG4gIH1cblxuICBhc3luYyBwcm9jZXNzRmlsZShzb3VyY2U6IHN0cmluZywgdGFyZ2V0OiBzdHJpbmcpOiBQcm9taXNlPFByb2Nlc3NSZXN1bHQ+IHtcbiAgICB0YXJnZXQgPSB0YXJnZXQucmVwbGFjZShTQVNTX0VYVCwgJy5jc3MnKTtcbiAgICBsZXQgY29udGVudHMgPSBhd2FpdCBVdGlscy5yZWFkRmlsZShzb3VyY2UpO1xuICAgIGxldCBvcHRpb25zID0gVXRpbHMuc2hhbGxvd01lcmdlKHRoaXMub3B0aW9ucywgeyBmaWxlOiBzb3VyY2UsIG91dEZpbGU6IHRhcmdldCB9KTtcbiAgICBsZXQgcmVzdWx0ID0gYXdhaXQgc2Fzc0FzeW5jKG9wdGlvbnMpO1xuICAgIHJldHVybiBVdGlscy53cml0ZUZpbGUodGFyZ2V0LCByZXN1bHQuY3NzKS50aGVuKCgpID0+XG4gICAgICBuZXcgUHJvY2Vzc1Jlc3VsdChyZXN1bHQuc3RhdHMuaW5jbHVkZWRGaWxlcywgdGFyZ2V0KVxuICAgICk7XG4gIH1cbn1cbiJdfQ==