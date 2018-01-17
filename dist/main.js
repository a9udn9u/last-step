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
const utils_1 = require("~/utils");
const incr_builder_1 = require("~/builders/incr-builder");
const builder_1 = require("~/builders/builder");
class LastStep {
    constructor(options) {
        this.watch = options.watch;
        this.userFile = options.userFile;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            let rootDir = yield fs.realpath(yield utils_1.Utils.getPackageRoot());
            let workDir = yield fs.realpath(utils_1.Utils.tmpPath(undefined, 'last-step-'));
            let defaultConfig = require('~/defaults').defaultConfig;
            let builderClass = this.watch ? incr_builder_1.IncrementalBuilder : builder_1.Builder;
            this.builder = new builderClass(rootDir, workDir, this.userFile, defaultConfig);
            try {
                yield this.builder.build();
            }
            catch (ex) {
                console.error(ex);
            }
            return fs.remove(workDir);
        });
    }
    interrupt() {
        this.builder && this.builder.exit();
    }
}
exports.LastStep = LastStep;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSwrQkFBK0I7QUFDL0IsbUNBQStCO0FBQy9CLDBEQUE2RDtBQUM3RCxnREFBNkM7QUFFN0M7SUFLRSxZQUFZLE9BQVk7UUFDdEIsSUFBSSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO1FBQzNCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQztJQUNuQyxDQUFDO0lBRUssR0FBRzs7WUFDUCxJQUFJLE9BQU8sR0FBVyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsTUFBTSxhQUFLLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQztZQUN0RSxJQUFJLE9BQU8sR0FBRyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsYUFBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUN4RSxJQUFJLGFBQWEsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsYUFBYSxDQUFDO1lBQ3hELElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLGlDQUFrQixDQUFDLENBQUMsQ0FBQyxpQkFBTyxDQUFDO1lBRTdELElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxZQUFZLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBRWhGLElBQUksQ0FBQztnQkFDSCxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDN0IsQ0FBQztZQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ1osT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNwQixDQUFDO1lBQ0QsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDNUIsQ0FBQztLQUFBO0lBRUQsU0FBUztRQUNQLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN0QyxDQUFDO0NBQ0Y7QUE3QkQsNEJBNkJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0IHsgVXRpbHMgfSBmcm9tJ34vdXRpbHMnO1xuaW1wb3J0IHsgSW5jcmVtZW50YWxCdWlsZGVyIH0gZnJvbSAnfi9idWlsZGVycy9pbmNyLWJ1aWxkZXInO1xuaW1wb3J0IHsgQnVpbGRlciB9IGZyb20gJ34vYnVpbGRlcnMvYnVpbGRlcic7XG5cbmV4cG9ydCBjbGFzcyBMYXN0U3RlcCB7XG4gIHByaXZhdGUgYnVpbGRlcjogQnVpbGRlcjtcbiAgcHJpdmF0ZSB3YXRjaDogc3RyaW5nO1xuICBwcml2YXRlIHVzZXJGaWxlOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9uczogYW55KSB7XG4gICAgdGhpcy53YXRjaCA9IG9wdGlvbnMud2F0Y2g7XG4gICAgdGhpcy51c2VyRmlsZSA9IG9wdGlvbnMudXNlckZpbGU7XG4gIH1cblxuICBhc3luYyBydW4oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IHJvb3REaXI6IHN0cmluZyA9IGF3YWl0IGZzLnJlYWxwYXRoKGF3YWl0IFV0aWxzLmdldFBhY2thZ2VSb290KCkpO1xuICAgIGxldCB3b3JrRGlyID0gYXdhaXQgZnMucmVhbHBhdGgoVXRpbHMudG1wUGF0aCh1bmRlZmluZWQsICdsYXN0LXN0ZXAtJykpO1xuICAgIGxldCBkZWZhdWx0Q29uZmlnID0gcmVxdWlyZSgnfi9kZWZhdWx0cycpLmRlZmF1bHRDb25maWc7XG4gICAgbGV0IGJ1aWxkZXJDbGFzcyA9IHRoaXMud2F0Y2ggPyBJbmNyZW1lbnRhbEJ1aWxkZXIgOiBCdWlsZGVyO1xuXG4gICAgdGhpcy5idWlsZGVyID0gbmV3IGJ1aWxkZXJDbGFzcyhyb290RGlyLCB3b3JrRGlyLCB0aGlzLnVzZXJGaWxlLCBkZWZhdWx0Q29uZmlnKTtcblxuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLmJ1aWxkZXIuYnVpbGQoKTtcbiAgICB9IGNhdGNoIChleCkge1xuICAgICAgY29uc29sZS5lcnJvcihleCk7XG4gICAgfVxuICAgIHJldHVybiBmcy5yZW1vdmUod29ya0Rpcik7XG4gIH1cblxuICBpbnRlcnJ1cHQoKTogdm9pZCB7XG4gICAgdGhpcy5idWlsZGVyICYmIHRoaXMuYnVpbGRlci5leGl0KCk7XG4gIH1cbn1cbiJdfQ==