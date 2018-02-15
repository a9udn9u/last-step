"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const copy_1 = require("~/processors/copy");
const html_minifier_1 = require("~/processors/html-minifier");
const clean_css_1 = require("~/processors/clean-css");
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
                new clean_css_1.CleanCSSProcessor()
            ]
        },
        // This rule processes JavaScript files using default options
        {
            sources: [/.*\.(js|es6)$/i],
            processors: [
                new rollupjs_1.RollupJSProcessor(),
                new uglifyjs_1.UglifyJSProcessor()
            ]
        }
    ],
    // User should add rules here
    rules: [],
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZGVmYXVsdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw0Q0FBa0Q7QUFDbEQsOERBQW1FO0FBQ25FLHNEQUEyRDtBQUMzRCxvREFBMEQ7QUFDMUQsb0RBQTBEO0FBRTdDLFFBQUEsYUFBYSxHQUFHO0lBQzNCLHVDQUF1QztJQUN2QyxTQUFTLEVBQUUsS0FBSztJQUNoQixrREFBa0Q7SUFDbEQsU0FBUyxFQUFFLFFBQVE7SUFFbkIsMkVBQTJFO0lBQzNFLHdFQUF3RTtJQUN4RSx3RUFBd0U7SUFDeEUsdUVBQXVFO0lBQ3ZFLDJFQUEyRTtJQUMzRSw4QkFBOEI7SUFFOUIsaUJBQWlCO0lBQ2pCLGFBQWEsRUFBRTtRQUNiLCtEQUErRDtRQUMvRDtZQUNFLG9EQUFvRDtZQUNwRCw2REFBNkQ7WUFDN0QsaUVBQWlFO1lBQ2pFLE9BQU8sRUFBRSxDQUFDLE1BQU0sQ0FBQztZQUNqQixvQ0FBb0M7WUFDcEMsdUVBQXVFO1lBQ3ZFLHNEQUFzRDtZQUN0RCx3RUFBd0U7WUFDeEUsNERBQTREO1lBQzVELHNFQUFzRTtZQUN0RSxvREFBb0Q7WUFDcEQsa0RBQWtEO1lBQ2xELE9BQU8sRUFBRSxTQUFTO1lBQ2xCLHNEQUFzRDtZQUN0RCxvRUFBb0U7WUFDcEUsVUFBVSxFQUFFO2dCQUNWLCtDQUErQztnQkFDL0MsSUFBSSxvQkFBYSxFQUFFO2FBQ3BCO1NBQ0Y7UUFDRCxzRUFBc0U7UUFDdEU7WUFDRSxPQUFPLEVBQUUsQ0FBQywwREFBMEQsQ0FBQztTQUV0RTtRQUNELHVEQUF1RDtRQUN2RDtZQUNFLE9BQU8sRUFBRSxDQUFDLGFBQWEsQ0FBQztZQUN4QixVQUFVLEVBQUU7Z0JBQ1YsSUFBSSxxQ0FBcUIsRUFBRTthQUM1QjtTQUNGO1FBQ0QsK0RBQStEO1FBQy9EO1lBQ0UsT0FBTyxFQUFFLENBQUMsdUJBQXVCLENBQUM7WUFDbEMsVUFBVSxFQUFFO2dCQUNWLElBQUksNkJBQWlCLEVBQUU7YUFDeEI7U0FDRjtRQUNELDZEQUE2RDtRQUM3RDtZQUNFLE9BQU8sRUFBRSxDQUFDLGdCQUFnQixDQUFDO1lBQzNCLFVBQVUsRUFBRTtnQkFDVixJQUFJLDRCQUFpQixFQUFFO2dCQUN2QixJQUFJLDRCQUFpQixFQUFFO2FBQ3hCO1NBQ0Y7S0FDRjtJQUVELDZCQUE2QjtJQUM3QixLQUFLLEVBQUUsRUFBRTtDQUNWLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb3B5UHJvY2Vzc29yIH0gZnJvbSAnfi9wcm9jZXNzb3JzL2NvcHknO1xuaW1wb3J0IHsgSFRNTE1pbmlmaWVyUHJvY2Vzc29yIH0gZnJvbSAnfi9wcm9jZXNzb3JzL2h0bWwtbWluaWZpZXInO1xuaW1wb3J0IHsgQ2xlYW5DU1NQcm9jZXNzb3IgfSBmcm9tICd+L3Byb2Nlc3NvcnMvY2xlYW4tY3NzJztcbmltcG9ydCB7IFJvbGx1cEpTUHJvY2Vzc29yIH0gZnJvbSAnfi9wcm9jZXNzb3JzL3JvbGx1cGpzJztcbmltcG9ydCB7IFVnbGlmeUpTUHJvY2Vzc29yIH0gZnJvbSAnfi9wcm9jZXNzb3JzL3VnbGlmeWpzJztcblxuZXhwb3J0IGNvbnN0IGRlZmF1bHRDb25maWcgPSB7XG4gIC8vIERpcmVjdG9yeSB3aGVyZSBzb3VyY2UgZmlsZXMgcmVzaWRlc1xuICBzb3VyY2VEaXI6ICdzcmMnLFxuICAvLyBEaXJlY3Rvcnkgd2hlcmUgcHJvY2Vzc2VkIGZpbGVzIHdpbGwgYmUgc2F2ZSB0b1xuICB0YXJnZXREaXI6ICdwdWJsaWMnLFxuXG4gIC8vIFdlIGFyZSBnb2luZyB0byBkZWZpbmUgdHdvIHNldHMgb2YgcnVsZXMsIGl0IGNvbnNpc3RzIG9mICdmYWxsYmFja1J1bGVzJ1xuICAvLyBhbmQgJ3J1bGVzJyAoZGVmaW5lZCBieSB1c2VyKSwgZHVyaW5nIGJ1aWxkLCB0aGV5IHdpbGwgYmUgbWVyZ2VkIGludG9cbiAgLy8gb25lIGFycmF5IHdpdGggZmFsbGJhY2tSdWxlcyBpbiBmcm9udC4gRWFjaCBmaWxlIHdpbGwgYmUgdGVzdGVkIHVzaW5nXG4gIC8vIHNvdXJjZSBwYXR0ZXJucyBpbiBlYWNoIHJ1bGUsIHRoZSBmaXJzdCBtYXRjaCB3aWxsIGJlIGFwcGxpZWQgdG8gdGhlXG4gIC8vIGZpbGUuIFNlYXJjaCBpbiB0aGUgcnVsZSBhcnJheSBpcyBkb25lIGluIHJldmVyc2Ugb3JkZXIgc28gbGF0ZXIgZGVmaW5lZFxuICAvLyBydWxlcyBoYXZlIGhpZ2hlciBwcmlvcml0eS5cblxuICAvLyBGYWxsYmFjayBydWxlc1xuICBmYWxsYmFja1J1bGVzOiBbXG4gICAgLy8gVGhpcyBydWxlIHNpbXBseSBjb3BpZXMgZmlsZSBmcm9tIHNvdXJjZSB0byB0YXJnZXQgZGlyZWN0b3J5XG4gICAge1xuICAgICAgLy8gUmVnZXggcGF0dGVybiBvciBzdHJpbmcgcGF0aCBvZiB0aGUgc291cmNlIGVudHJ5LlxuICAgICAgLy8gUmVnZXggaXMgdGVzdGVkIGFnYWluc3QgZmlsZSdzIHJlbGF0aXZlIHBhdGggaW4gc291cmNlRGlyLlxuICAgICAgLy8gU3RyaW5nLCBpZiBub3QgYWJzb2x1dGUsIHNob3VsZCBiZSByZWxhdGl2ZSBwYXRoIGluIHNvdXJjZURpci5cbiAgICAgIHNvdXJjZXM6IFsvXi4qJC9dLFxuICAgICAgLy8gT3B0aW9uYWwgcGF0aCBvZiB0aGUgdGFyZ2V0IGZpbGUuXG4gICAgICAvLyBJZiBvbWl0dGVkLCBzb3VyY2VzIHdpbGwgYmUgY29waWVkIHRvIHRhcmdldCBkaXJlY3RvcnkgaW5kaXZpZHVhbGx5LFxuICAgICAgLy8gdGhlaXIgcmVsYXRpdmUgcGF0aHMgaW4gdGFyZ2V0RGlyIHdpbGwgYmUgcmV0YWluZWQuXG4gICAgICAvLyBJZiB0YXJnZXRzIGlzIGEgc3RyaW5nLCBhbGwgaW5wdXQgZmlsZXMgd2lsbCBiZSBtZXJnZWQgaW50byBvbmUgZmlsZS5cbiAgICAgIC8vIElmIHRhcmdldHMgaXMgYW4gYXJyYXkgb2Ygc3RyaW5ncywgc291cmNlcyB3aWxsIGJlIGNvcGllZFxuICAgICAgLy8gaW5kaXZpZHVhbGx5LCBidXQgaWYgdGhlcmUgYXJlIG1vcmUgc291cmNlcyB0aGFuIHRhcmdldHMsIGFsbCBleHRyYVxuICAgICAgLy8gc291cmNlcyB3aWxsIGJlIG1lcmdlZCBpbnRvIHRoZSBsYXN0IHRhcmdldCBmaWxlLlxuICAgICAgLy8gQWxsIG90aGVyIHR5cGVzIHdpbGwgY2F1c2UgdW5kZWZpbmVkIGJlaGF2aW9ycy5cbiAgICAgIHRhcmdldHM6IHVuZGVmaW5lZCxcbiAgICAgIC8vIEEgY2hhaW4gb2YgcHJvY2Vzc29ycyBjYW4gYmUgZGVmaW5lZCBmb3IgZWFjaCBydWxlLlxuICAgICAgLy8gT3V0cHV0IG9mIHByZXZpb3VzIHByb2Nlc3NvciB3aWxsIGJlIHRoZSBpbnB1dCBvZiBuZXh0IHByb2Nlc3Nvci5cbiAgICAgIHByb2Nlc3NvcnM6IFtcbiAgICAgICAgLy8gQnVpbHQtaW4gY29weSBwcm9jZXNzb3IsIHNpbXBseSBjb3BpZXMgZmlsZXNcbiAgICAgICAgbmV3IENvcHlQcm9jZXNzb3IoKVxuICAgICAgXVxuICAgIH0sXG4gICAgLy8gVGhpcyBydWxlIHByZXZlbnRzIGNlcnRhaW4gZmlsZXMgZnJvbSBiZWVuIGNvcGllZCBvdmVyIHRvIHRhcmdldERpclxuICAgIHtcbiAgICAgIHNvdXJjZXM6IFsvKF58XFwvKShcXC5EU19TdG9yZXxUaHVtYnNcXC5kYnxcXC5naXQuKnxcXC5jdnN8Lip+fC4qXFwuc3dwKSQvXSxcbiAgICAgIC8vIE5vIHByb2Nlc3NvcnMgbWVhbnMgbWF0Y2hlZCBmaWxlcyB3aWxsIG5vdCBiZSBwcm9jZXNzZWRcbiAgICB9LFxuICAgIC8vIFRoaXMgcnVsZSBwcm9jZXNzZXMgSFRNTCBmaWxlcyB1c2luZyBkZWZhdWx0IG9wdGlvbnNcbiAgICB7XG4gICAgICBzb3VyY2VzOiBbLy4qXFwuaHRtbD8kL2ldLFxuICAgICAgcHJvY2Vzc29yczogW1xuICAgICAgICBuZXcgSFRNTE1pbmlmaWVyUHJvY2Vzc29yKClcbiAgICAgIF1cbiAgICB9LFxuICAgIC8vIFRoaXMgcnVsZSBwcm9jZXNzZXMgQ1NTIGFuZCBMRVNTIGZpbGVzIHVzaW5nIGRlZmF1bHQgb3B0aW9uc1xuICAgIHtcbiAgICAgIHNvdXJjZXM6IFsvLipcXC4oY3NzfGxlc3N8c2FzcykkL2ldLFxuICAgICAgcHJvY2Vzc29yczogW1xuICAgICAgICBuZXcgQ2xlYW5DU1NQcm9jZXNzb3IoKVxuICAgICAgXVxuICAgIH0sXG4gICAgLy8gVGhpcyBydWxlIHByb2Nlc3NlcyBKYXZhU2NyaXB0IGZpbGVzIHVzaW5nIGRlZmF1bHQgb3B0aW9uc1xuICAgIHtcbiAgICAgIHNvdXJjZXM6IFsvLipcXC4oanN8ZXM2KSQvaV0sXG4gICAgICBwcm9jZXNzb3JzOiBbXG4gICAgICAgIG5ldyBSb2xsdXBKU1Byb2Nlc3NvcigpLFxuICAgICAgICBuZXcgVWdsaWZ5SlNQcm9jZXNzb3IoKVxuICAgICAgXVxuICAgIH1cbiAgXSxcblxuICAvLyBVc2VyIHNob3VsZCBhZGQgcnVsZXMgaGVyZVxuICBydWxlczogW10sXG59O1xuIl19