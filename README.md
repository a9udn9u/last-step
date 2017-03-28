# Last Step

Make your project production-ready by rolling up and minifying HTML files,
JavaScript scripts and CSS/LESS stylesheets.

## What is it?

This module provides an easy way to combine and minify your HTML, JavaScript
and CSS/LESS files.
HTML is processed via [HTMLMinifier](https://github.com/kangax/html-minifier).
For JavaScript, it uses [rollup.js](https://rollupjs.org/)
for combining files, [Babel](https://babeljs.io/)
(via [rollup-plugin-babel](https://github.com/rollup/rollup-plugin-babel))
as code transpiler and [UglifyJS2](https://github.com/mishoo/UglifyJS2)
(via [rollup-plugin-uglify](https://github.com/TrySound/rollup-plugin-uglify))
for file minification.
For CSS/LESS, it uses [less](http://lesscss.org/) for inline importing and
CSS minification.

## How to install

```bash
npm i -D last-step
```

## Usage

### Configure via .last-step.js

```javascript
module.exports = {
  // source directory
  sourceDirectory: 'src',
  // target directory
  targetDirectory: 'public',
  // these files will not be copied to the target directory
  doNotCopy: ['*.html', '*.js', '*.css', '*.less'],
  // options for HTML files
  html: [
    {
      // wheter code should be minified
      minify: true,
      // for HTML files, file name and location will not be changed
      entries: ['index.html'],
      // the following options will be passed to HTMLMinifier
      minifyCSS: true,
      minifyJS: true
    }
  ],
  // options for JavaScript files
  javascript: [
    {
      // whether code should be minified
      minify: true,
      // these options will be passed to rollup
      // see also: https://github.com/rollup/rollup/wiki/JavaScript-API
      entry: 'script-1.js',
      dest: 'main.js',
      format: 'es',
      external: ['npm-dep-1', 'npm-dep-2'],
      ...
      // these options will be passed to rollup-plugin-babel
      // see also: https://github.com/rollup/rollup-plugin-babel#configuring-babel
      // note: babel will not be called if this section is omitted
      babel: {
        babelrc: false,
        exclude: 'node_modules/**',
        presets: ['es2015-rollup', 'stage-1']
      }
    }
  ],
  // options for CSS files
  css: [
    {
      // wheter code should be minified
      minify: true,
      // entries to be processed
      // use less' import (inline) to include external style sheets
      entries: ['style-1.less', 'style-2.css'],
      // file to write to
      dest: 'main.css'
    }
  ]
}
```

The reason a `.js` file is used for configuration, instead of a `.json` file,
is that when there are repetitive configuration segments, you can put them
in variables and reuse them.

### Configure via JavaScript

Not implemented yet.

### Build

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
       |   |-- script-2.js (required by script-1.js)
       |   |-- style-1.less (imported an external stylesheet from example.com/style.css)
       |   |-- style-2.css
       |   +-- index.html
       +-- public/
           +-- (empty)
```

After `npm run build`, you will have:

```
(root) +-- (content unchanged)
       +-- public/
           +-- main.js (content of both script-1.js and script-2.js)
           |-- main.css (content of style-1.less, example.com/style.css and style-2.css)
           +-- index.html
```

## Known issues

`rsync` command must be in your `$PATH` environment variable, it's used to
copy content from source directory to target directory.

## License

MIT
