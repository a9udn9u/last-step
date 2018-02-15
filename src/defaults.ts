import { CopyProcessor } from '~/processors/copy';
import { HTMLMinifierProcessor } from '~/processors/html-minifier';
import { SASSProcessor } from '~/processors/sass';
import { LESSProcessor } from '~/processors/less';
import { CleanCSSProcessor } from '~/processors/clean-css';
import { RollupJSProcessor } from '~/processors/rollupjs';
import { UglifyJSProcessor } from '~/processors/uglifyjs';

export const defaultConfig = {
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
        new CopyProcessor()
      ]
    },
    // This rule prevents certain files from been copied over to targetDir
    {
      sources: [/(^|\/)(\.DS_Store|Thumbs\.db|\.git.*|\.cvs|.*~|.*\.swp)$/],
      // No processors means matched files will not be processed
    },
    // This rule processes HTML files using default options
    {
      sources: [/.*\.html?$/i],
      processors: [
        new HTMLMinifierProcessor()
      ]
    },
    // This rule processes CSS and LESS files using default options
    {
      sources: [/.*\.(css|less|sass)$/i],
      processors: [
        // new SASSProcessor(),
        new LESSProcessor(),
        new CleanCSSProcessor()
      ]
    },
    // This rule processes JavaScript files using default options
    {
      sources: [/.*\.(js|es6)$/i],
      processors: [
        new RollupJSProcessor(),
        new UglifyJSProcessor()
      ]
    }
  ],

  // User should add rules here
  rules: [],
};
