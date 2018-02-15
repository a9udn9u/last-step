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
            let bundle = yield babelAsync(source, utils_1.Utils.shallowMerge(this.options));
            return utils_1.Utils.writeFile(target, bundle.code).then(() => undefined);
        });
    }
}
exports.BabelProcessor = BabelProcessor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFiZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcHJvY2Vzc29ycy9iYWJlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsb0NBQW9DO0FBQ3BDLDZCQUE2QjtBQUM3QixtQ0FBZ0M7QUFDaEMsc0RBQW1EO0FBR25ELE1BQU0sWUFBWSxHQUFHO0lBQ25CLE9BQU8sRUFBRSxLQUFLO0lBQ2QsT0FBTyxFQUFFLENBQUMsS0FBSyxDQUFDO0NBQ2pCLENBQUM7QUFFRixNQUFNLFVBQVUsR0FBYSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFFN0Usb0JBQTRCLFNBQVEscUJBQVM7SUFHM0MsWUFBWSxVQUFlLEVBQUU7UUFDM0IsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsT0FBTyxHQUFHLGFBQUssQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3pELGFBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxhQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVLLFdBQVcsQ0FBQyxNQUFjLEVBQUUsTUFBYzs7WUFDOUMsSUFBSSxNQUFNLEdBQUcsTUFBTSxVQUFVLENBQUMsTUFBTSxFQUFFLGFBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDeEUsTUFBTSxDQUFDLGFBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDcEUsQ0FBQztLQUFBO0NBQ0Y7QUFiRCx3Q0FhQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGJhYmVsIGZyb20gJ2JhYmVsLWNvcmUnO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICd1dGlsJztcbmltcG9ydCB7IFV0aWxzIH0gZnJvbSAnfi91dGlscyc7XG5pbXBvcnQgeyBQcm9jZXNzb3IgfSBmcm9tICd+L3Byb2Nlc3NvcnMvcHJvY2Vzc29yJztcbmltcG9ydCB7IFByb2Nlc3NSZXN1bHQgfSBmcm9tICd+L21vZGVscy9wcm9jZXNzb3ItbW9kZWxzJztcblxuY29uc3QgREVGQVVMVF9PUFRTID0ge1xuICBiYWJlbHJjOiBmYWxzZSxcbiAgcHJlc2V0czogW1wiZW52XCJdXG59O1xuXG5jb25zdCBiYWJlbEFzeW5jOiBGdW5jdGlvbiA9IHV0aWwucHJvbWlzaWZ5KGJhYmVsLnRyYW5zZm9ybUZpbGUpLmJpbmQoYmFiZWwpO1xuXG5leHBvcnQgY2xhc3MgQmFiZWxQcm9jZXNzb3IgZXh0ZW5kcyBQcm9jZXNzb3Ige1xuICBwcml2YXRlIG9wdGlvbnM6IGFueTtcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zOiBhbnkgPSB7fSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5vcHRpb25zID0gVXRpbHMuc2hhbGxvd01lcmdlKERFRkFVTFRfT1BUUywgb3B0aW9ucyk7XG4gICAgVXRpbHMuZGJnKCkgJiYgVXRpbHMuZGVidWcoJ09wdGlvbnM6JywgdGhpcy5vcHRpb25zKTtcbiAgfVxuXG4gIGFzeW5jIHByb2Nlc3NGaWxlKHNvdXJjZTogc3RyaW5nLCB0YXJnZXQ6IHN0cmluZyk6IFByb21pc2U8UHJvY2Vzc1Jlc3VsdD4ge1xuICAgIGxldCBidW5kbGUgPSBhd2FpdCBiYWJlbEFzeW5jKHNvdXJjZSwgVXRpbHMuc2hhbGxvd01lcmdlKHRoaXMub3B0aW9ucykpO1xuICAgIHJldHVybiBVdGlscy53cml0ZUZpbGUodGFyZ2V0LCBidW5kbGUuY29kZSkudGhlbigoKSA9PiB1bmRlZmluZWQpO1xuICB9XG59XG4iXX0=