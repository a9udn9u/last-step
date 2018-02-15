# Last Step

## What is it?

*Last Step* provides an easy way to combine, transform and minify HTML, JavaScript and CSS/LESS files. It glues other tools together to achieve this goal. Specifically, *Last Step* depends on the following projects:

* [HTMLMinifier](https://github.com/kangax/html-minifier) for HTML minification.
* [rollup.js](https://rollupjs.org/) for JavaScript combination.
* [Babel](https://babeljs.io/) for JavaScript transpiling.
* [UglifyJS2](https://github.com/mishoo/UglifyJS2) JavaScript minification.
* [Less](https://github.com/less/less.js) for LESS file processing.
* [SASS](https://github.com/sass/node-sass) for SASS file processing.
* [Clean CSS](https://github.com/jakubpawlowicz/clean-css) for CSS inline import and minification.

Last Step v2 is a complete re-write, it's now easier to configure, has a simple plug-in system and comes with a build server that builds files when they are changed.

## Installation

```bash
npm i -D last-step
```
or
```bash
yarn add -D last-step
```

## Usage

### Configure via .last-step.js

```javascript
module.exports = {
  // Source directory where source files are located
  sourceDir: 'src',
  // Target directory where processed files should be copy to
  targetDir: 'public',

  rules: [
    {
      // Source files, can be a regex pattern or string. Should be relative path in sourceDir
      sources: [/^.*$/],
      // Processors which will process matched source files.
      processors: [
        // Built-in copy processor, simply copies files
        new CopyProcessor()
      ]
    },
    {
      // This rule prevents certain files from been copied to targetDir
      // No processors means matched files will not be processed
      sources: [/(^|\/)(\.DS_Store|Thumbs\.db|\.git.*|\.cvs|.*~|.*\.swp)$/],
    },
    {
      // This rule processes HTML files
      sources: [/.*\.html?$/i],
      processors: [
        new HTMLMinifierProcessor()
      ]
    },
    {
      // This rule processes CSS files
      sources: [/.*\.css$/i],
      processors: [
        new CleanCSSProcessor()
      ]
    },
    {
      // This rule processes JavaScript files
      sources: [/.*\.(js|es6)$/i],
      // Files are chained through all processors so the output of the previous
      // processor will be the input of the next processor.
      processors: [
        new RollupJSProcessor(),
        new UglifyJSProcessor()
      ]
    }
  ]
}
```

Sources are matched against each rule in reverse order, so in the above configuration, `a.css` will match `/.*\.css$/i`, not the catch all `/^.*$/`.

There are a few other built-in processors: LESSProcessor and SASSProcessors which process .less and .sass files respectively. There is also an individual BabelProcessor for people wants to use babel without rollup.

Default settings for each processor can be found in code: [Click here](src/processors)

### Build Project

In `package.json`, add a command:

```
  ...
  "scripts": {
    "build": "last-step",
    ...
  },
  ...
```

Then run `npm run build`.

For the above example configuration, if you have the following package layout:

```
(root) +-- package.json
       |-- .last-step.js
       |-- src/
       |   +-- script-1.js
       |   |-- script-2.js (imported by script-1.js)
       |   |-- workers/
       |   |   +-- worker-1.js
       |   |-- style-1.css
       |   |-- other-styles.css (imported by style-1.css)
       |   |-- index.html
       |   |-- sub-module/
       |   |   +-- sub-module.html
       |   +-- res.jpg
       +-- public/
           +-- (empty)
```

After build, you will have:

```
(root) +-- (contents unchanged)
       +-- public/
           +-- script-1.js (contents of both script-1.js and script-2.js)
           |-- workers/
           |   +-- worker-1.js (contents of worker-1.js and all its imports)
           |-- style-1.css (contents of both style-1.css and other-styles.css)
           |-- index.html
           |-- sub-module/
           |   +-- sub-module.html
           +-- res.jpg

```

`npm run build -w` will start a build server, it will watch for file changes in the configured `sourceDir`, when updates are detected, it will automatically do re-build of the changed files. It also handles file dependencies so your `targetDir` should be always up-to-date.

### Command Line Arguments

`-c [file]` Override the default `.last-step.js` configuration file location.

`-w` Start the build server.

## Plug-ins

Plug-ins are called `Processor`, all file processing functionalities are implemented as processors, including built-in processors. The processor interface is very simple:

```javascript
{
    // Both input and output are strings of file paths.
    // Input is the file which needs to be processed.
    // Output is the file where processed contents should be written to.
    process(input, output) {
        // Process input, write results to output
        return {
            // If input file imported any dependencies, imported files should be returned.
            imports: <Set<string>>
        };
    }
}
```

That's it, for most built-in processors, all they do is read the file content, process it with an external tool (i.e., Babel), then write the results to file.

## Default Behaviors

[This](src/defaults.ts) is the default configuration.

RollupProcessor by default enabled the following plugins:
* [rollup-plugin-replace](https://github.com/rollup/rollup-plugin-replace)
* [rollup-plugin-node-globals](https://github.com/calvinmetcalf/rollup-plugin-node-globals)
* [rollup-plugin-node-builtins](https://github.com/nolanlawson/rollup-pulgin-node-builtins)
* [rollup-plugin-json](https://github.com/rollup/rollup-plugin-json)
* [rollup-plugin-node-resolve](https://github.com/rollup/rollup-plugin-node-resolve)
* [rollup-plugin-babel](https://github.com/rollup/rollup-plugin-babel)
* [rollup-plugin-commonjs](https://github.com/rollup/rollup-plugin-commonjs)
They can be disabled by setting `plugins.[name]` to `false` in RollupJSProcessor options, see [here](src/processors/rollupjs.ts).

BabelProcessor uses [babel-preset-env](https://github.com/babel/babel-preset-env) by default.

## License

MIT
