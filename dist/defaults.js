"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const copy_1 = require("~/processors/copy");
const html_minifier_1 = require("~/processors/html-minifier");
const less_1 = require("~/processors/less");
const clean_css_1 = require("~/processors/clean-css");
const babel_1 = require("~/processors//babel");
const rollupjs_1 = require("~/processors/rollupjs");
const uglifyjs_1 = require("~/processors/uglifyjs");
exports.defaultConfig = {
    // Directory where source files resides
    sourceDir: 'src',
    // Directory where processed files will be save to
    targetDir: 'public',
    // We are going to define two sets of rules, it consists of 'fallbackRules'
    // and 'rules' (defined by user), during build, they will be merged into
    // one array with fallbackRules in front. Each file will be tested using
    // source patterns in each rule, the first match will be applied to the
    // file. Search in the rule array is done in reverse order so later defined
    // rules have higher priority.
    // Fallback rules
    fallbackRules: [
        // This rule simply copies file from source to target directory
        {
            // Regex pattern or string path of the source entry.
            // Regex is tested against file's relative path in sourceDir.
            // String, if not absolute, should be relative path in sourceDir.
            sources: [/^.*$/],
            // Optional path of the target file.
            // If omitted, sources will be copied to target directory individually,
            // their relative paths in targetDir will be retained.
            // If targets is a string, all input files will be merged into one file.
            // If targets is an array of strings, sources will be copied
            // individually, but if there are more sources than targets, all extra
            // sources will be merged into the last target file.
            // All other types will cause undefined behaviors.
            targets: undefined,
            // A chain of processors can be defined for each rule.
            // Output of previous processor will be the input of next processor.
            processors: [
                // Built-in copy processor, simply copies files
                new copy_1.CopyProcessor()
            ]
        },
        // This rule prevents certain files from been copied over to targetDir
        {
            sources: [/(^|\/)(\.DS_Store|Thumbs\.db|\.git.*|\.cvs|.*~|.*\.swp)$/],
        },
        // This rule processes HTML files using default options
        {
            sources: [/.*\.html?$/i],
            processors: [
                new html_minifier_1.HTMLMinifierProcessor()
            ]
        },
        // This rule processes CSS and LESS files using default options
        {
            sources: [/.*\.(css|less|sass)$/i],
            processors: [
                // new SASSProcessor(),
                new less_1.LESSProcessor(),
                new clean_css_1.CleanCSSProcessor()
            ]
        },
        // This rule processes JavaScript files using default options
        {
            sources: [/.*\.(js|es6)$/i],
            processors: [
                new rollupjs_1.RollupJSProcessor(),
                new babel_1.BabelProcessor(),
                new uglifyjs_1.UglifyJSProcessor()
            ]
        }
    ],
    // User should add rules here
    rules: [],
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZGVmYXVsdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw0Q0FBa0Q7QUFDbEQsOERBQW1FO0FBRW5FLDRDQUFrRDtBQUNsRCxzREFBMkQ7QUFDM0QsK0NBQXFEO0FBQ3JELG9EQUEwRDtBQUMxRCxvREFBMEQ7QUFFN0MsUUFBQSxhQUFhLEdBQUc7SUFDM0IsdUNBQXVDO0lBQ3ZDLFNBQVMsRUFBRSxLQUFLO0lBQ2hCLGtEQUFrRDtJQUNsRCxTQUFTLEVBQUUsUUFBUTtJQUVuQiwyRUFBMkU7SUFDM0Usd0VBQXdFO0lBQ3hFLHdFQUF3RTtJQUN4RSx1RUFBdUU7SUFDdkUsMkVBQTJFO0lBQzNFLDhCQUE4QjtJQUU5QixpQkFBaUI7SUFDakIsYUFBYSxFQUFFO1FBQ2IsK0RBQStEO1FBQy9EO1lBQ0Usb0RBQW9EO1lBQ3BELDZEQUE2RDtZQUM3RCxpRUFBaUU7WUFDakUsT0FBTyxFQUFFLENBQUMsTUFBTSxDQUFDO1lBQ2pCLG9DQUFvQztZQUNwQyx1RUFBdUU7WUFDdkUsc0RBQXNEO1lBQ3RELHdFQUF3RTtZQUN4RSw0REFBNEQ7WUFDNUQsc0VBQXNFO1lBQ3RFLG9EQUFvRDtZQUNwRCxrREFBa0Q7WUFDbEQsT0FBTyxFQUFFLFNBQVM7WUFDbEIsc0RBQXNEO1lBQ3RELG9FQUFvRTtZQUNwRSxVQUFVLEVBQUU7Z0JBQ1YsK0NBQStDO2dCQUMvQyxJQUFJLG9CQUFhLEVBQUU7YUFDcEI7U0FDRjtRQUNELHNFQUFzRTtRQUN0RTtZQUNFLE9BQU8sRUFBRSxDQUFDLDBEQUEwRCxDQUFDO1NBRXRFO1FBQ0QsdURBQXVEO1FBQ3ZEO1lBQ0UsT0FBTyxFQUFFLENBQUMsYUFBYSxDQUFDO1lBQ3hCLFVBQVUsRUFBRTtnQkFDVixJQUFJLHFDQUFxQixFQUFFO2FBQzVCO1NBQ0Y7UUFDRCwrREFBK0Q7UUFDL0Q7WUFDRSxPQUFPLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQztZQUNsQyxVQUFVLEVBQUU7Z0JBQ1YsdUJBQXVCO2dCQUN2QixJQUFJLG9CQUFhLEVBQUU7Z0JBQ25CLElBQUksNkJBQWlCLEVBQUU7YUFDeEI7U0FDRjtRQUNELDZEQUE2RDtRQUM3RDtZQUNFLE9BQU8sRUFBRSxDQUFDLGdCQUFnQixDQUFDO1lBQzNCLFVBQVUsRUFBRTtnQkFDVixJQUFJLDRCQUFpQixFQUFFO2dCQUN2QixJQUFJLHNCQUFjLEVBQUU7Z0JBQ3BCLElBQUksNEJBQWlCLEVBQUU7YUFDeEI7U0FDRjtLQUNGO0lBRUQsNkJBQTZCO0lBQzdCLEtBQUssRUFBRSxFQUFFO0NBQ1YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvcHlQcm9jZXNzb3IgfSBmcm9tICd+L3Byb2Nlc3NvcnMvY29weSc7XG5pbXBvcnQgeyBIVE1MTWluaWZpZXJQcm9jZXNzb3IgfSBmcm9tICd+L3Byb2Nlc3NvcnMvaHRtbC1taW5pZmllcic7XG5pbXBvcnQgeyBTQVNTUHJvY2Vzc29yIH0gZnJvbSAnfi9wcm9jZXNzb3JzL3Nhc3MnO1xuaW1wb3J0IHsgTEVTU1Byb2Nlc3NvciB9IGZyb20gJ34vcHJvY2Vzc29ycy9sZXNzJztcbmltcG9ydCB7IENsZWFuQ1NTUHJvY2Vzc29yIH0gZnJvbSAnfi9wcm9jZXNzb3JzL2NsZWFuLWNzcyc7XG5pbXBvcnQgeyBCYWJlbFByb2Nlc3NvciB9IGZyb20gJ34vcHJvY2Vzc29ycy8vYmFiZWwnO1xuaW1wb3J0IHsgUm9sbHVwSlNQcm9jZXNzb3IgfSBmcm9tICd+L3Byb2Nlc3NvcnMvcm9sbHVwanMnO1xuaW1wb3J0IHsgVWdsaWZ5SlNQcm9jZXNzb3IgfSBmcm9tICd+L3Byb2Nlc3NvcnMvdWdsaWZ5anMnO1xuXG5leHBvcnQgY29uc3QgZGVmYXVsdENvbmZpZyA9IHtcbiAgLy8gRGlyZWN0b3J5IHdoZXJlIHNvdXJjZSBmaWxlcyByZXNpZGVzXG4gIHNvdXJjZURpcjogJ3NyYycsXG4gIC8vIERpcmVjdG9yeSB3aGVyZSBwcm9jZXNzZWQgZmlsZXMgd2lsbCBiZSBzYXZlIHRvXG4gIHRhcmdldERpcjogJ3B1YmxpYycsXG5cbiAgLy8gV2UgYXJlIGdvaW5nIHRvIGRlZmluZSB0d28gc2V0cyBvZiBydWxlcywgaXQgY29uc2lzdHMgb2YgJ2ZhbGxiYWNrUnVsZXMnXG4gIC8vIGFuZCAncnVsZXMnIChkZWZpbmVkIGJ5IHVzZXIpLCBkdXJpbmcgYnVpbGQsIHRoZXkgd2lsbCBiZSBtZXJnZWQgaW50b1xuICAvLyBvbmUgYXJyYXkgd2l0aCBmYWxsYmFja1J1bGVzIGluIGZyb250LiBFYWNoIGZpbGUgd2lsbCBiZSB0ZXN0ZWQgdXNpbmdcbiAgLy8gc291cmNlIHBhdHRlcm5zIGluIGVhY2ggcnVsZSwgdGhlIGZpcnN0IG1hdGNoIHdpbGwgYmUgYXBwbGllZCB0byB0aGVcbiAgLy8gZmlsZS4gU2VhcmNoIGluIHRoZSBydWxlIGFycmF5IGlzIGRvbmUgaW4gcmV2ZXJzZSBvcmRlciBzbyBsYXRlciBkZWZpbmVkXG4gIC8vIHJ1bGVzIGhhdmUgaGlnaGVyIHByaW9yaXR5LlxuXG4gIC8vIEZhbGxiYWNrIHJ1bGVzXG4gIGZhbGxiYWNrUnVsZXM6IFtcbiAgICAvLyBUaGlzIHJ1bGUgc2ltcGx5IGNvcGllcyBmaWxlIGZyb20gc291cmNlIHRvIHRhcmdldCBkaXJlY3RvcnlcbiAgICB7XG4gICAgICAvLyBSZWdleCBwYXR0ZXJuIG9yIHN0cmluZyBwYXRoIG9mIHRoZSBzb3VyY2UgZW50cnkuXG4gICAgICAvLyBSZWdleCBpcyB0ZXN0ZWQgYWdhaW5zdCBmaWxlJ3MgcmVsYXRpdmUgcGF0aCBpbiBzb3VyY2VEaXIuXG4gICAgICAvLyBTdHJpbmcsIGlmIG5vdCBhYnNvbHV0ZSwgc2hvdWxkIGJlIHJlbGF0aXZlIHBhdGggaW4gc291cmNlRGlyLlxuICAgICAgc291cmNlczogWy9eLiokL10sXG4gICAgICAvLyBPcHRpb25hbCBwYXRoIG9mIHRoZSB0YXJnZXQgZmlsZS5cbiAgICAgIC8vIElmIG9taXR0ZWQsIHNvdXJjZXMgd2lsbCBiZSBjb3BpZWQgdG8gdGFyZ2V0IGRpcmVjdG9yeSBpbmRpdmlkdWFsbHksXG4gICAgICAvLyB0aGVpciByZWxhdGl2ZSBwYXRocyBpbiB0YXJnZXREaXIgd2lsbCBiZSByZXRhaW5lZC5cbiAgICAgIC8vIElmIHRhcmdldHMgaXMgYSBzdHJpbmcsIGFsbCBpbnB1dCBmaWxlcyB3aWxsIGJlIG1lcmdlZCBpbnRvIG9uZSBmaWxlLlxuICAgICAgLy8gSWYgdGFyZ2V0cyBpcyBhbiBhcnJheSBvZiBzdHJpbmdzLCBzb3VyY2VzIHdpbGwgYmUgY29waWVkXG4gICAgICAvLyBpbmRpdmlkdWFsbHksIGJ1dCBpZiB0aGVyZSBhcmUgbW9yZSBzb3VyY2VzIHRoYW4gdGFyZ2V0cywgYWxsIGV4dHJhXG4gICAgICAvLyBzb3VyY2VzIHdpbGwgYmUgbWVyZ2VkIGludG8gdGhlIGxhc3QgdGFyZ2V0IGZpbGUuXG4gICAgICAvLyBBbGwgb3RoZXIgdHlwZXMgd2lsbCBjYXVzZSB1bmRlZmluZWQgYmVoYXZpb3JzLlxuICAgICAgdGFyZ2V0czogdW5kZWZpbmVkLFxuICAgICAgLy8gQSBjaGFpbiBvZiBwcm9jZXNzb3JzIGNhbiBiZSBkZWZpbmVkIGZvciBlYWNoIHJ1bGUuXG4gICAgICAvLyBPdXRwdXQgb2YgcHJldmlvdXMgcHJvY2Vzc29yIHdpbGwgYmUgdGhlIGlucHV0IG9mIG5leHQgcHJvY2Vzc29yLlxuICAgICAgcHJvY2Vzc29yczogW1xuICAgICAgICAvLyBCdWlsdC1pbiBjb3B5IHByb2Nlc3Nvciwgc2ltcGx5IGNvcGllcyBmaWxlc1xuICAgICAgICBuZXcgQ29weVByb2Nlc3NvcigpXG4gICAgICBdXG4gICAgfSxcbiAgICAvLyBUaGlzIHJ1bGUgcHJldmVudHMgY2VydGFpbiBmaWxlcyBmcm9tIGJlZW4gY29waWVkIG92ZXIgdG8gdGFyZ2V0RGlyXG4gICAge1xuICAgICAgc291cmNlczogWy8oXnxcXC8pKFxcLkRTX1N0b3JlfFRodW1ic1xcLmRifFxcLmdpdC4qfFxcLmN2c3wuKn58LipcXC5zd3ApJC9dLFxuICAgICAgLy8gTm8gcHJvY2Vzc29ycyBtZWFucyBtYXRjaGVkIGZpbGVzIHdpbGwgbm90IGJlIHByb2Nlc3NlZFxuICAgIH0sXG4gICAgLy8gVGhpcyBydWxlIHByb2Nlc3NlcyBIVE1MIGZpbGVzIHVzaW5nIGRlZmF1bHQgb3B0aW9uc1xuICAgIHtcbiAgICAgIHNvdXJjZXM6IFsvLipcXC5odG1sPyQvaV0sXG4gICAgICBwcm9jZXNzb3JzOiBbXG4gICAgICAgIG5ldyBIVE1MTWluaWZpZXJQcm9jZXNzb3IoKVxuICAgICAgXVxuICAgIH0sXG4gICAgLy8gVGhpcyBydWxlIHByb2Nlc3NlcyBDU1MgYW5kIExFU1MgZmlsZXMgdXNpbmcgZGVmYXVsdCBvcHRpb25zXG4gICAge1xuICAgICAgc291cmNlczogWy8uKlxcLihjc3N8bGVzc3xzYXNzKSQvaV0sXG4gICAgICBwcm9jZXNzb3JzOiBbXG4gICAgICAgIC8vIG5ldyBTQVNTUHJvY2Vzc29yKCksXG4gICAgICAgIG5ldyBMRVNTUHJvY2Vzc29yKCksXG4gICAgICAgIG5ldyBDbGVhbkNTU1Byb2Nlc3NvcigpXG4gICAgICBdXG4gICAgfSxcbiAgICAvLyBUaGlzIHJ1bGUgcHJvY2Vzc2VzIEphdmFTY3JpcHQgZmlsZXMgdXNpbmcgZGVmYXVsdCBvcHRpb25zXG4gICAge1xuICAgICAgc291cmNlczogWy8uKlxcLihqc3xlczYpJC9pXSxcbiAgICAgIHByb2Nlc3NvcnM6IFtcbiAgICAgICAgbmV3IFJvbGx1cEpTUHJvY2Vzc29yKCksXG4gICAgICAgIG5ldyBCYWJlbFByb2Nlc3NvcigpLFxuICAgICAgICBuZXcgVWdsaWZ5SlNQcm9jZXNzb3IoKVxuICAgICAgXVxuICAgIH1cbiAgXSxcblxuICAvLyBVc2VyIHNob3VsZCBhZGQgcnVsZXMgaGVyZVxuICBydWxlczogW10sXG59O1xuIl19