import * as rollup from 'rollup';
import * as babel from 'rollup-plugin-babel';
import * as resolve from 'rollup-plugin-node-resolve';
import * as builtins from 'rollup-plugin-node-builtins';
import * as globals from 'rollup-plugin-node-globals';
import * as commonjs from 'rollup-plugin-commonjs';
import * as json from 'rollup-plugin-json';
import * as replace from 'rollup-plugin-replace';
import { Utils } from '~/utils';
import { Processor } from '~/processors/processor';
import { ProcessResult } from '~/models/processor-models';

const DEFAULT_OPTS = {
  // Turn off plugins
  plugins: {
    babel: true,
    nodeResolve: true,
    nodeBuiltins: true,
    nodeGlobals: true,
    commonJS: true,
    json: true,
    replace: true,
  },

  // rollup.js
  rollupJS: {
    output: {
      format: 'iife',
      name: 'LastStepDummyName'
    }
  },

  babel: {
    babelrc: false,
    presets: [['env', { modules: false }]],
    plugins: ['external-helpers']
  },

  // rollup-plugin-node-resolve
  nodeResolve: {
    browser: true
  },

  // rollup-plugin-commonjs
  commonJS: {
  },

  // rollup-plugin-json
  json: {
  },

  // rollup-plugin-replace
  replace: {
    'process.env.NODE_ENV': JSON.stringify('production')
  },
};

export class RollupJSProcessor extends Processor {
  private options: any;

  constructor(options: any = {}) {
    super();
    options = options || {};
    let pluginToggles = Utils.shallowMerge(DEFAULT_OPTS.plugins || options.plugins);
    let plugins = [];

    if (pluginToggles.replace)
      plugins = plugins.concat(replace(Utils.shallowMerge(DEFAULT_OPTS.replace, options.replace)));
    if (pluginToggles.nodeGlobals)
      plugins = plugins.concat(globals());
    if (pluginToggles.nodeBuiltins)
      plugins = plugins.concat(builtins());
    if (pluginToggles.json)
      plugins = plugins.concat(json(Utils.shallowMerge(DEFAULT_OPTS.json, options.json)));
    if (pluginToggles.nodeResolve)
      plugins = plugins.concat(resolve(Utils.shallowMerge(DEFAULT_OPTS.nodeResolve, options.nodeResolve)));
    if (pluginToggles.babel)
      plugins = plugins.concat(babel(Utils.shallowMerge(DEFAULT_OPTS.babel, options.babel)));
    if (pluginToggles.commonJS)
      plugins = plugins.concat(commonjs(Utils.shallowMerge(DEFAULT_OPTS.commonJS, options.commonJS)));

    this.options = Utils.shallowMerge(DEFAULT_OPTS.rollupJS, options.rollupJS);
    this.options.plugins = plugins.concat(this.options.plugins || []);

    Utils.dbg() && Utils.debug('Options:', this.options);
  }

  async processFile(source: string, target: string): Promise<ProcessResult> {
    let options = Utils.shallowMerge(this.options, {
      input: source,
      file: target
    });
    let bundle = await rollup.rollup(options);
    // Local imports by this file
    let deps = bundle.modules.reduce((i, m) => i.concat(m.dependencies), []);
    return bundle.write(options).then(() => new ProcessResult(deps));
  }
}
