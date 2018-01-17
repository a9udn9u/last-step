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
const processor_1 = require("~/processors/processor");
class CopyProcessor extends processor_1.Processor {
    constructor() {
        super();
    }
    processFile(source, target) {
        return __awaiter(this, void 0, void 0, function* () {
            yield fs.ensureSymlink(source, target);
            return undefined;
        });
    }
}
exports.CopyProcessor = CopyProcessor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29weS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcm9jZXNzb3JzL2NvcHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLCtCQUErQjtBQUUvQixzREFBbUQ7QUFHbkQsbUJBQTJCLFNBQVEscUJBQVM7SUFDMUM7UUFDRSxLQUFLLEVBQUUsQ0FBQztJQUNWLENBQUM7SUFFSyxXQUFXLENBQUMsTUFBYyxFQUFFLE1BQWM7O1lBQzlDLE1BQU0sRUFBRSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDdkMsTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUNuQixDQUFDO0tBQUE7Q0FDRjtBQVRELHNDQVNDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IFByb2Nlc3NvciB9IGZyb20gJ34vcHJvY2Vzc29ycy9wcm9jZXNzb3InO1xuaW1wb3J0IHsgUHJvY2Vzc1Jlc3VsdCB9IGZyb20gJ34vbW9kZWxzL3Byb2Nlc3Nvci1tb2RlbHMnO1xuXG5leHBvcnQgY2xhc3MgQ29weVByb2Nlc3NvciBleHRlbmRzIFByb2Nlc3NvciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBhc3luYyBwcm9jZXNzRmlsZShzb3VyY2U6IHN0cmluZywgdGFyZ2V0OiBzdHJpbmcpOiBQcm9taXNlPFByb2Nlc3NSZXN1bHQ+IHtcbiAgICBhd2FpdCBmcy5lbnN1cmVTeW1saW5rKHNvdXJjZSwgdGFyZ2V0KTtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59Il19