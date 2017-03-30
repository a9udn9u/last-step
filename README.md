# Last Step

Make your project production-ready by rolling up and minifying HTML files,
JavaScript scripts and CSS/LESS stylesheets.

## What is it?

*Last Step* provides an easy way to combine and minify your HTML, JavaScript
and CSS/LESS files. It glues other tools together to achieve this goal.
Specifically, *Last Step* depends on the following projects:

* [HTMLMinifier](https://github.com/kangax/html-minifier) for HTML
  minification.
* [rollup.js](https://rollupjs.org/) for JavaScript combination.
* [Babel](https://babeljs.io/)
  (via [rollup-plugin-babel](https://github.com/rollup/rollup-plugin-babel))
  for JavaScript transpiling.
* [UglifyJS2](https://github.com/mishoo/UglifyJS2)
  (via [rollup-plugin-uglify](https://github.com/TrySound/rollup-plugin-uglify))
  for JavaScript minification.
* [Less](http://lesscss.org/) for CSS inline importing and minification.


## How to install

```bash
npm i -D last-step
```

## Usage

### Configure via .last-step.js

```javascript
module.exports = {
  // Source directory where source files are located
  sourceDirectory: 'src',
  // Target directory where processed files should be copy to
  targetDirectory: 'public',
  // Options for HTML files
  html: [
    {
      // HTML files to be processed.
      // 1. Strings and regex are accepted
      // 2. Regex are tested against file paths relative to the source directory
      //    For example: for 'src/path/to/file', where 'src/' is the source
      //    directory, regex will be tested against 'path/to/file'
      // 3. HTML files are never combined, their relative paths inside of
      //    the target directory will be the same as in the source directory
      entries: [/.*\.html/],
      // options for HTMLMinifier
      // see also: https://github.com/kangax/html-minifier#options-quick-reference
      htmlMinifierOptions: { ... }
    },
    {
      // More HTML file groups
      ...
    }
  ],
  // Options for CSS files
  css: [
    {
      // CSS files to be processed, rules are similar to HTML file entries,
      // except that all matched CSS/LESS files will be combined into one
      // target file
      entries: [/^style-*.less/, 'other-styles.css'],
      // The target file to write to
      dest: 'main.css',
      // Options for LESS
      // see also: http://lesscss.org/usage/#programmatic-usage
      lessOptions: { ... }
    },
    {
      // More CSS bundles
      ...
    }
  ],
  // Options for JavaScript files
  javascript: [
    {
      // JS files to be processed
      entries: [
        {
          // Only strings are accepted, to combine JS files, use 'require',
          // or 'import', rollup.js will handle the rest for you.
          entry: 'script-1.js',
          // The target file to write to, will use source file path if omitted
          dest: 'main.js'
        },
        // You probably want to keep workers in separate files
        { entry: 'workers/worker-1.js' }
      ],
      // Options for rollup.js
      // see also: https://github.com/rollup/rollup/wiki/JavaScript-API
      // note that rollup.js options 'entry' and 'dest' will be ignored
      // because they are determined by the above 'entries' array
      rollupOptions: { ... },
      // Options for Babel
      // see also: https://babeljs.io/docs/usage/api/#options
      babelOptions: { ... },
      // Options for UglifyJS2's minify() method
      // see also: https://github.com/mishoo/UglifyJS2#api-reference
      uglifyJSOptions: { ... }
    },
    {
      // More JS bundles
      ...
    }
  ]
}
```

The configuration file must be located in the package root directory, named
as `.last-step.js`. The reason *Last Step* uses `.js` file for configuration,
instead of `.json` file, is because that you can't write `RegExp` literals
in JSON.

All default settings &rarr; [Click here](src/defaults.js)

### Configure via JavaScript

Not implemented yet.

### Build Your Project

In `package.json`, add a command to build your package:

```
  ...
  "scripts": {
    "build": "last-step",
    ...
  },
  ...
```

That's it.

For the above example configuration, if you have the following package layout:

```
(root) +-- package.json
       |-- .last-step.js
       |-- src/
       |   +-- script-1.js
       |   |-- script-2.js (imported by script-1.js)
       |   |-- workers/
       |   |   +-- worker-1.js
       |   |-- style-1.less (imports stylesheet from example.com/style.css)
       |   |-- style-2.less
       |   |-- other-styles.css
       |   |-- index.html
       |   |-- sub-module/
       |   |   +-- sub-module.html
       |   +-- res.jpg
       +-- public/
           +-- (empty)
```

After `npm run build`, you will have:

```
(root) +-- (contents unchanged)
       +-- public/
           +-- main.js (contents of both script-1.js and script-2.js)
           |-- workers/
           |   +-- worker-1.js (contents of worker-1.js and all its imports)
           |-- main.css (contents of all CSS/LESS files)
           |-- index.html
           |-- sub-module/
           |   +-- sub-module.html
           +-- res.jpg

```

## License

MIT
