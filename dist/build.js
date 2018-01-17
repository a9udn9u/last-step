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
const minimist = require("minimist");
const utils_1 = require("~/utils");
const incr_builder_1 = require("~/builders/incr-builder");
const builder_1 = require("~/builders/builder");
/**
 * Parse command line arguments
 * @returns {Object} Map of command line arguments
 */
const parseArgv = () => {
    let argv = minimist(process.argv.slice(2), {
        alias: {
            // .last-step.js config file
            'c': 'config',
            'm': 'mode'
        },
        default: {
            'c': '.last-step.js',
            'm': 'full'
        },
        string: ['c', 'm']
    });
    utils_1.Utils.dbg() && utils_1.Utils.debug('Command line arguments:', argv);
    return argv;
};
const run = (workDir) => __awaiter(this, void 0, void 0, function* () {
    let { m: mode, c: userFile } = parseArgv();
    if (mode !== 'full' && mode !== 'watch') {
        throw `Unknown mode: ${mode}`;
    }
    let rootDir = yield utils_1.Utils.getPackageRoot();
    let builder = mode === 'watch' ?
        new incr_builder_1.IncrementalBuilder(rootDir, workDir, userFile) :
        new builder_1.Builder(rootDir, workDir, userFile);
    return builder.build();
});
(() => __awaiter(this, void 0, void 0, function* () {
    let workDir = utils_1.Utils.tmpPath(undefined, 'last-step-');
    try {
        yield run(workDir);
    }
    catch (ex) {
        console.error(ex);
    }
    yield fs.remove(workDir);
}))();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYnVpbGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLCtCQUErQjtBQUMvQixxQ0FBcUM7QUFDckMsbUNBQStCO0FBQy9CLDBEQUE2RDtBQUM3RCxnREFBNkM7QUFFN0M7OztHQUdHO0FBQ0gsTUFBTSxTQUFTLEdBQUcsR0FBUSxFQUFFO0lBQzFCLElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUN6QyxLQUFLLEVBQUU7WUFDTCw0QkFBNEI7WUFDNUIsR0FBRyxFQUFFLFFBQVE7WUFDYixHQUFHLEVBQUUsTUFBTTtTQUNaO1FBQ0QsT0FBTyxFQUFFO1lBQ1AsR0FBRyxFQUFFLGVBQWU7WUFDcEIsR0FBRyxFQUFFLE1BQU07U0FDWjtRQUNELE1BQU0sRUFBRSxDQUFFLEdBQUcsRUFBRSxHQUFHLENBQUU7S0FDckIsQ0FBQyxDQUFDO0lBQ0gsYUFBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLGFBQUssQ0FBQyxLQUFLLENBQUMseUJBQXlCLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDNUQsTUFBTSxDQUFDLElBQUksQ0FBQztBQUNkLENBQUMsQ0FBQTtBQUVELE1BQU0sR0FBRyxHQUFHLENBQU8sT0FBZSxFQUFpQixFQUFFO0lBQ25ELElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsR0FBRyxTQUFTLEVBQUUsQ0FBQztJQUMzQyxFQUFFLENBQUMsQ0FBQyxJQUFJLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ3hDLE1BQU0saUJBQWlCLElBQUksRUFBRSxDQUFDO0lBQ2hDLENBQUM7SUFFRCxJQUFJLE9BQU8sR0FBVyxNQUFNLGFBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUNuRCxJQUFJLE9BQU8sR0FBWSxJQUFJLEtBQUssT0FBTyxDQUFDLENBQUM7UUFDdkMsSUFBSSxpQ0FBa0IsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDcEQsSUFBSSxpQkFBTyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFFMUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUN6QixDQUFDLENBQUEsQ0FBQTtBQUVELENBQUMsR0FBUyxFQUFFO0lBQ1YsSUFBSSxPQUFPLEdBQUcsYUFBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDckQsSUFBSSxDQUFDO1FBQ0gsTUFBTSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDckIsQ0FBQztJQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDWixPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3BCLENBQUM7SUFDRCxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDM0IsQ0FBQyxDQUFBLENBQUMsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0ICogYXMgbWluaW1pc3QgZnJvbSAnbWluaW1pc3QnO1xuaW1wb3J0IHsgVXRpbHMgfSBmcm9tJ34vdXRpbHMnO1xuaW1wb3J0IHsgSW5jcmVtZW50YWxCdWlsZGVyIH0gZnJvbSAnfi9idWlsZGVycy9pbmNyLWJ1aWxkZXInO1xuaW1wb3J0IHsgQnVpbGRlciB9IGZyb20gJ34vYnVpbGRlcnMvYnVpbGRlcic7XG5cbi8qKlxuICogUGFyc2UgY29tbWFuZCBsaW5lIGFyZ3VtZW50c1xuICogQHJldHVybnMge09iamVjdH0gTWFwIG9mIGNvbW1hbmQgbGluZSBhcmd1bWVudHNcbiAqL1xuY29uc3QgcGFyc2VBcmd2ID0gKCk6IGFueSA9PiB7XG4gIGxldCBhcmd2ID0gbWluaW1pc3QocHJvY2Vzcy5hcmd2LnNsaWNlKDIpLCB7XG4gICAgYWxpYXM6IHtcbiAgICAgIC8vIC5sYXN0LXN0ZXAuanMgY29uZmlnIGZpbGVcbiAgICAgICdjJzogJ2NvbmZpZycsXG4gICAgICAnbSc6ICdtb2RlJ1xuICAgIH0sXG4gICAgZGVmYXVsdDoge1xuICAgICAgJ2MnOiAnLmxhc3Qtc3RlcC5qcycsXG4gICAgICAnbSc6ICdmdWxsJ1xuICAgIH0sXG4gICAgc3RyaW5nOiBbICdjJywgJ20nIF1cbiAgfSk7XG4gIFV0aWxzLmRiZygpICYmIFV0aWxzLmRlYnVnKCdDb21tYW5kIGxpbmUgYXJndW1lbnRzOicsIGFyZ3YpO1xuICByZXR1cm4gYXJndjtcbn1cblxuY29uc3QgcnVuID0gYXN5bmMgKHdvcmtEaXI6IHN0cmluZyk6IFByb21pc2U8dm9pZD4gPT4ge1xuICBsZXQgeyBtOiBtb2RlLCBjOiB1c2VyRmlsZSB9ID0gcGFyc2VBcmd2KCk7XG4gIGlmIChtb2RlICE9PSAnZnVsbCcgJiYgbW9kZSAhPT0gJ3dhdGNoJykge1xuICAgIHRocm93IGBVbmtub3duIG1vZGU6ICR7bW9kZX1gO1xuICB9XG5cbiAgbGV0IHJvb3REaXI6IHN0cmluZyA9IGF3YWl0IFV0aWxzLmdldFBhY2thZ2VSb290KCk7XG4gIGxldCBidWlsZGVyOiBCdWlsZGVyID0gbW9kZSA9PT0gJ3dhdGNoJyA/XG4gICAgbmV3IEluY3JlbWVudGFsQnVpbGRlcihyb290RGlyLCB3b3JrRGlyLCB1c2VyRmlsZSkgOlxuICAgIG5ldyBCdWlsZGVyKHJvb3REaXIsIHdvcmtEaXIsIHVzZXJGaWxlKTtcblxuICByZXR1cm4gYnVpbGRlci5idWlsZCgpO1xufVxuXG4oYXN5bmMgKCkgPT4ge1xuICBsZXQgd29ya0RpciA9IFV0aWxzLnRtcFBhdGgodW5kZWZpbmVkLCAnbGFzdC1zdGVwLScpO1xuICB0cnkge1xuICAgIGF3YWl0IHJ1bih3b3JrRGlyKTtcbiAgfSBjYXRjaCAoZXgpIHtcbiAgICBjb25zb2xlLmVycm9yKGV4KTtcbiAgfVxuICBhd2FpdCBmcy5yZW1vdmUod29ya0Rpcik7XG59KSgpO1xuIl19