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
const babel = require("babel-core");
const util = require("util");
const utils_1 = require("~/utils");
const processor_1 = require("~/processors/processor");
const DEFAULT_OPTS = {
    babelrc: false,
    presets: ["env"]
};
const babelAsync = util.promisify(babel.transformFile).bind(babel);
class BabelProcessor extends processor_1.Processor {
    constructor(options = {}) {
        super();
        this.options = utils_1.Utils.shallowMerge(DEFAULT_OPTS, options);
        utils_1.Utils.dbg() && utils_1.Utils.debug('Options:', this.options);
    }
    processFile(source, target) {
        return __awaiter(this, void 0, void 0, function* () {
            let bundle = yield babelAsync(source, utils_1.Utils.shallowMerge(this.options, {
                sourceRoot: '/Users/quangan/Dropbox/Projects/LastStepDebug'
            }));
            return utils_1.Utils.writeFile(target, bundle.code).then(() => undefined);
        });
    }
}
exports.BabelProcessor = BabelProcessor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFiZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcHJvY2Vzc29ycy9iYWJlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsb0NBQW9DO0FBQ3BDLDZCQUE2QjtBQUM3QixtQ0FBZ0M7QUFDaEMsc0RBQW1EO0FBR25ELE1BQU0sWUFBWSxHQUFHO0lBQ25CLE9BQU8sRUFBRSxLQUFLO0lBQ2QsT0FBTyxFQUFFLENBQUMsS0FBSyxDQUFDO0NBQ2pCLENBQUM7QUFFRixNQUFNLFVBQVUsR0FBYSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFFN0Usb0JBQTRCLFNBQVEscUJBQVM7SUFHM0MsWUFBWSxVQUFlLEVBQUU7UUFDM0IsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsT0FBTyxHQUFHLGFBQUssQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3pELGFBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxhQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVLLFdBQVcsQ0FBQyxNQUFjLEVBQUUsTUFBYzs7WUFDOUMsSUFBSSxNQUFNLEdBQUcsTUFBTSxVQUFVLENBQUMsTUFBTSxFQUFFLGFBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDckUsVUFBVSxFQUFFLCtDQUErQzthQUM1RCxDQUFDLENBQUMsQ0FBQztZQUNKLE1BQU0sQ0FBQyxhQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3BFLENBQUM7S0FBQTtDQUNGO0FBZkQsd0NBZUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBiYWJlbCBmcm9tICdiYWJlbC1jb3JlJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAndXRpbCc7XG5pbXBvcnQgeyBVdGlscyB9IGZyb20gJ34vdXRpbHMnO1xuaW1wb3J0IHsgUHJvY2Vzc29yIH0gZnJvbSAnfi9wcm9jZXNzb3JzL3Byb2Nlc3Nvcic7XG5pbXBvcnQgeyBQcm9jZXNzUmVzdWx0IH0gZnJvbSAnfi9tb2RlbHMvcHJvY2Vzc29yLW1vZGVscyc7XG5cbmNvbnN0IERFRkFVTFRfT1BUUyA9IHtcbiAgYmFiZWxyYzogZmFsc2UsXG4gIHByZXNldHM6IFtcImVudlwiXVxufTtcblxuY29uc3QgYmFiZWxBc3luYzogRnVuY3Rpb24gPSB1dGlsLnByb21pc2lmeShiYWJlbC50cmFuc2Zvcm1GaWxlKS5iaW5kKGJhYmVsKTtcblxuZXhwb3J0IGNsYXNzIEJhYmVsUHJvY2Vzc29yIGV4dGVuZHMgUHJvY2Vzc29yIHtcbiAgcHJpdmF0ZSBvcHRpb25zOiBhbnk7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9uczogYW55ID0ge30pIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMub3B0aW9ucyA9IFV0aWxzLnNoYWxsb3dNZXJnZShERUZBVUxUX09QVFMsIG9wdGlvbnMpO1xuICAgIFV0aWxzLmRiZygpICYmIFV0aWxzLmRlYnVnKCdPcHRpb25zOicsIHRoaXMub3B0aW9ucyk7XG4gIH1cblxuICBhc3luYyBwcm9jZXNzRmlsZShzb3VyY2U6IHN0cmluZywgdGFyZ2V0OiBzdHJpbmcpOiBQcm9taXNlPFByb2Nlc3NSZXN1bHQ+IHtcbiAgICBsZXQgYnVuZGxlID0gYXdhaXQgYmFiZWxBc3luYyhzb3VyY2UsIFV0aWxzLnNoYWxsb3dNZXJnZSh0aGlzLm9wdGlvbnMsIHtcbiAgICAgIHNvdXJjZVJvb3Q6ICcvVXNlcnMvcXVhbmdhbi9Ecm9wYm94L1Byb2plY3RzL0xhc3RTdGVwRGVidWcnXG4gICAgfSkpO1xuICAgIHJldHVybiBVdGlscy53cml0ZUZpbGUodGFyZ2V0LCBidW5kbGUuY29kZSkudGhlbigoKSA9PiB1bmRlZmluZWQpO1xuICB9XG59XG4iXX0=