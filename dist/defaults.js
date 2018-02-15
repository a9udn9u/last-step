"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const copy_1 = require("~/processors/copy");
const html_minifier_1 = require("~/processors/html-minifier");
const less_1 = require("~/processors/less");
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
                new uglifyjs_1.UglifyJSProcessor()
            ]
        }
    ],
    // User should add rules here
    rules: [],
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZGVmYXVsdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw0Q0FBa0Q7QUFDbEQsOERBQW1FO0FBRW5FLDRDQUFrRDtBQUNsRCxzREFBMkQ7QUFDM0Qsb0RBQTBEO0FBQzFELG9EQUEwRDtBQUU3QyxRQUFBLGFBQWEsR0FBRztJQUMzQix1Q0FBdUM7SUFDdkMsU0FBUyxFQUFFLEtBQUs7SUFDaEIsa0RBQWtEO0lBQ2xELFNBQVMsRUFBRSxRQUFRO0lBRW5CLDJFQUEyRTtJQUMzRSx3RUFBd0U7SUFDeEUsd0VBQXdFO0lBQ3hFLHVFQUF1RTtJQUN2RSwyRUFBMkU7SUFDM0UsOEJBQThCO0lBRTlCLGlCQUFpQjtJQUNqQixhQUFhLEVBQUU7UUFDYiwrREFBK0Q7UUFDL0Q7WUFDRSxvREFBb0Q7WUFDcEQsNkRBQTZEO1lBQzdELGlFQUFpRTtZQUNqRSxPQUFPLEVBQUUsQ0FBQyxNQUFNLENBQUM7WUFDakIsb0NBQW9DO1lBQ3BDLHVFQUF1RTtZQUN2RSxzREFBc0Q7WUFDdEQsd0VBQXdFO1lBQ3hFLDREQUE0RDtZQUM1RCxzRUFBc0U7WUFDdEUsb0RBQW9EO1lBQ3BELGtEQUFrRDtZQUNsRCxPQUFPLEVBQUUsU0FBUztZQUNsQixzREFBc0Q7WUFDdEQsb0VBQW9FO1lBQ3BFLFVBQVUsRUFBRTtnQkFDViwrQ0FBK0M7Z0JBQy9DLElBQUksb0JBQWEsRUFBRTthQUNwQjtTQUNGO1FBQ0Qsc0VBQXNFO1FBQ3RFO1lBQ0UsT0FBTyxFQUFFLENBQUMsMERBQTBELENBQUM7U0FFdEU7UUFDRCx1REFBdUQ7UUFDdkQ7WUFDRSxPQUFPLEVBQUUsQ0FBQyxhQUFhLENBQUM7WUFDeEIsVUFBVSxFQUFFO2dCQUNWLElBQUkscUNBQXFCLEVBQUU7YUFDNUI7U0FDRjtRQUNELCtEQUErRDtRQUMvRDtZQUNFLE9BQU8sRUFBRSxDQUFDLHVCQUF1QixDQUFDO1lBQ2xDLFVBQVUsRUFBRTtnQkFDVix1QkFBdUI7Z0JBQ3ZCLElBQUksb0JBQWEsRUFBRTtnQkFDbkIsSUFBSSw2QkFBaUIsRUFBRTthQUN4QjtTQUNGO1FBQ0QsNkRBQTZEO1FBQzdEO1lBQ0UsT0FBTyxFQUFFLENBQUMsZ0JBQWdCLENBQUM7WUFDM0IsVUFBVSxFQUFFO2dCQUNWLElBQUksNEJBQWlCLEVBQUU7Z0JBQ3ZCLElBQUksNEJBQWlCLEVBQUU7YUFDeEI7U0FDRjtLQUNGO0lBRUQsNkJBQTZCO0lBQzdCLEtBQUssRUFBRSxFQUFFO0NBQ1YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvcHlQcm9jZXNzb3IgfSBmcm9tICd+L3Byb2Nlc3NvcnMvY29weSc7XG5pbXBvcnQgeyBIVE1MTWluaWZpZXJQcm9jZXNzb3IgfSBmcm9tICd+L3Byb2Nlc3NvcnMvaHRtbC1taW5pZmllcic7XG5pbXBvcnQgeyBTQVNTUHJvY2Vzc29yIH0gZnJvbSAnfi9wcm9jZXNzb3JzL3Nhc3MnO1xuaW1wb3J0IHsgTEVTU1Byb2Nlc3NvciB9IGZyb20gJ34vcHJvY2Vzc29ycy9sZXNzJztcbmltcG9ydCB7IENsZWFuQ1NTUHJvY2Vzc29yIH0gZnJvbSAnfi9wcm9jZXNzb3JzL2NsZWFuLWNzcyc7XG5pbXBvcnQgeyBSb2xsdXBKU1Byb2Nlc3NvciB9IGZyb20gJ34vcHJvY2Vzc29ycy9yb2xsdXBqcyc7XG5pbXBvcnQgeyBVZ2xpZnlKU1Byb2Nlc3NvciB9IGZyb20gJ34vcHJvY2Vzc29ycy91Z2xpZnlqcyc7XG5cbmV4cG9ydCBjb25zdCBkZWZhdWx0Q29uZmlnID0ge1xuICAvLyBEaXJlY3Rvcnkgd2hlcmUgc291cmNlIGZpbGVzIHJlc2lkZXNcbiAgc291cmNlRGlyOiAnc3JjJyxcbiAgLy8gRGlyZWN0b3J5IHdoZXJlIHByb2Nlc3NlZCBmaWxlcyB3aWxsIGJlIHNhdmUgdG9cbiAgdGFyZ2V0RGlyOiAncHVibGljJyxcblxuICAvLyBXZSBhcmUgZ29pbmcgdG8gZGVmaW5lIHR3byBzZXRzIG9mIHJ1bGVzLCBpdCBjb25zaXN0cyBvZiAnZmFsbGJhY2tSdWxlcydcbiAgLy8gYW5kICdydWxlcycgKGRlZmluZWQgYnkgdXNlciksIGR1cmluZyBidWlsZCwgdGhleSB3aWxsIGJlIG1lcmdlZCBpbnRvXG4gIC8vIG9uZSBhcnJheSB3aXRoIGZhbGxiYWNrUnVsZXMgaW4gZnJvbnQuIEVhY2ggZmlsZSB3aWxsIGJlIHRlc3RlZCB1c2luZ1xuICAvLyBzb3VyY2UgcGF0dGVybnMgaW4gZWFjaCBydWxlLCB0aGUgZmlyc3QgbWF0Y2ggd2lsbCBiZSBhcHBsaWVkIHRvIHRoZVxuICAvLyBmaWxlLiBTZWFyY2ggaW4gdGhlIHJ1bGUgYXJyYXkgaXMgZG9uZSBpbiByZXZlcnNlIG9yZGVyIHNvIGxhdGVyIGRlZmluZWRcbiAgLy8gcnVsZXMgaGF2ZSBoaWdoZXIgcHJpb3JpdHkuXG5cbiAgLy8gRmFsbGJhY2sgcnVsZXNcbiAgZmFsbGJhY2tSdWxlczogW1xuICAgIC8vIFRoaXMgcnVsZSBzaW1wbHkgY29waWVzIGZpbGUgZnJvbSBzb3VyY2UgdG8gdGFyZ2V0IGRpcmVjdG9yeVxuICAgIHtcbiAgICAgIC8vIFJlZ2V4IHBhdHRlcm4gb3Igc3RyaW5nIHBhdGggb2YgdGhlIHNvdXJjZSBlbnRyeS5cbiAgICAgIC8vIFJlZ2V4IGlzIHRlc3RlZCBhZ2FpbnN0IGZpbGUncyByZWxhdGl2ZSBwYXRoIGluIHNvdXJjZURpci5cbiAgICAgIC8vIFN0cmluZywgaWYgbm90IGFic29sdXRlLCBzaG91bGQgYmUgcmVsYXRpdmUgcGF0aCBpbiBzb3VyY2VEaXIuXG4gICAgICBzb3VyY2VzOiBbL14uKiQvXSxcbiAgICAgIC8vIE9wdGlvbmFsIHBhdGggb2YgdGhlIHRhcmdldCBmaWxlLlxuICAgICAgLy8gSWYgb21pdHRlZCwgc291cmNlcyB3aWxsIGJlIGNvcGllZCB0byB0YXJnZXQgZGlyZWN0b3J5IGluZGl2aWR1YWxseSxcbiAgICAgIC8vIHRoZWlyIHJlbGF0aXZlIHBhdGhzIGluIHRhcmdldERpciB3aWxsIGJlIHJldGFpbmVkLlxuICAgICAgLy8gSWYgdGFyZ2V0cyBpcyBhIHN0cmluZywgYWxsIGlucHV0IGZpbGVzIHdpbGwgYmUgbWVyZ2VkIGludG8gb25lIGZpbGUuXG4gICAgICAvLyBJZiB0YXJnZXRzIGlzIGFuIGFycmF5IG9mIHN0cmluZ3MsIHNvdXJjZXMgd2lsbCBiZSBjb3BpZWRcbiAgICAgIC8vIGluZGl2aWR1YWxseSwgYnV0IGlmIHRoZXJlIGFyZSBtb3JlIHNvdXJjZXMgdGhhbiB0YXJnZXRzLCBhbGwgZXh0cmFcbiAgICAgIC8vIHNvdXJjZXMgd2lsbCBiZSBtZXJnZWQgaW50byB0aGUgbGFzdCB0YXJnZXQgZmlsZS5cbiAgICAgIC8vIEFsbCBvdGhlciB0eXBlcyB3aWxsIGNhdXNlIHVuZGVmaW5lZCBiZWhhdmlvcnMuXG4gICAgICB0YXJnZXRzOiB1bmRlZmluZWQsXG4gICAgICAvLyBBIGNoYWluIG9mIHByb2Nlc3NvcnMgY2FuIGJlIGRlZmluZWQgZm9yIGVhY2ggcnVsZS5cbiAgICAgIC8vIE91dHB1dCBvZiBwcmV2aW91cyBwcm9jZXNzb3Igd2lsbCBiZSB0aGUgaW5wdXQgb2YgbmV4dCBwcm9jZXNzb3IuXG4gICAgICBwcm9jZXNzb3JzOiBbXG4gICAgICAgIC8vIEJ1aWx0LWluIGNvcHkgcHJvY2Vzc29yLCBzaW1wbHkgY29waWVzIGZpbGVzXG4gICAgICAgIG5ldyBDb3B5UHJvY2Vzc29yKClcbiAgICAgIF1cbiAgICB9LFxuICAgIC8vIFRoaXMgcnVsZSBwcmV2ZW50cyBjZXJ0YWluIGZpbGVzIGZyb20gYmVlbiBjb3BpZWQgb3ZlciB0byB0YXJnZXREaXJcbiAgICB7XG4gICAgICBzb3VyY2VzOiBbLyhefFxcLykoXFwuRFNfU3RvcmV8VGh1bWJzXFwuZGJ8XFwuZ2l0Lip8XFwuY3ZzfC4qfnwuKlxcLnN3cCkkL10sXG4gICAgICAvLyBObyBwcm9jZXNzb3JzIG1lYW5zIG1hdGNoZWQgZmlsZXMgd2lsbCBub3QgYmUgcHJvY2Vzc2VkXG4gICAgfSxcbiAgICAvLyBUaGlzIHJ1bGUgcHJvY2Vzc2VzIEhUTUwgZmlsZXMgdXNpbmcgZGVmYXVsdCBvcHRpb25zXG4gICAge1xuICAgICAgc291cmNlczogWy8uKlxcLmh0bWw/JC9pXSxcbiAgICAgIHByb2Nlc3NvcnM6IFtcbiAgICAgICAgbmV3IEhUTUxNaW5pZmllclByb2Nlc3NvcigpXG4gICAgICBdXG4gICAgfSxcbiAgICAvLyBUaGlzIHJ1bGUgcHJvY2Vzc2VzIENTUyBhbmQgTEVTUyBmaWxlcyB1c2luZyBkZWZhdWx0IG9wdGlvbnNcbiAgICB7XG4gICAgICBzb3VyY2VzOiBbLy4qXFwuKGNzc3xsZXNzfHNhc3MpJC9pXSxcbiAgICAgIHByb2Nlc3NvcnM6IFtcbiAgICAgICAgLy8gbmV3IFNBU1NQcm9jZXNzb3IoKSxcbiAgICAgICAgbmV3IExFU1NQcm9jZXNzb3IoKSxcbiAgICAgICAgbmV3IENsZWFuQ1NTUHJvY2Vzc29yKClcbiAgICAgIF1cbiAgICB9LFxuICAgIC8vIFRoaXMgcnVsZSBwcm9jZXNzZXMgSmF2YVNjcmlwdCBmaWxlcyB1c2luZyBkZWZhdWx0IG9wdGlvbnNcbiAgICB7XG4gICAgICBzb3VyY2VzOiBbLy4qXFwuKGpzfGVzNikkL2ldLFxuICAgICAgcHJvY2Vzc29yczogW1xuICAgICAgICBuZXcgUm9sbHVwSlNQcm9jZXNzb3IoKSxcbiAgICAgICAgbmV3IFVnbGlmeUpTUHJvY2Vzc29yKClcbiAgICAgIF1cbiAgICB9XG4gIF0sXG5cbiAgLy8gVXNlciBzaG91bGQgYWRkIHJ1bGVzIGhlcmVcbiAgcnVsZXM6IFtdLFxufTtcbiJdfQ==