const defaults = {
  // user option file
  optionFile: '.last-step.js',

  // default Last Step options
  options: {
    sourceDirectory: 'src',
    targetDirectory: 'public',
    verbose: false
  },

  // default HTMLMinifier options
  htmlMinifierOptions: {
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    decodeEntities: true,
    html5: true,
    minifyCSS: true,
    minifyJS: true,
    processConditionalComments: true,
    removeAttributeQuotes: true,
    removeComments: true,
    removeEmptyAttributes: true,
    removeOptionalTags: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    removeTagWhitespace: true,
    sortAttributes: true,
    sortClassName: true,
    trimCustomFragments: true,
    useShortDoctype: true
  },

  // default LESS options
  lessOptions: {
    compress: true
  },

  // default rollup.js options
  rollupOptions: {
    format: 'es'
  },

  // default Babel options
  babelOptions: {
    babelrc: false,
    exclude: 'node_modules/**'
  },

  // default UglifyJS2 options
  uglifyJSOptions: {

  }
};

module.exports = defaults;
