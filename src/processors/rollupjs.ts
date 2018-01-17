import * as rollup from 'rollup';
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
  // rollup.js
  rollupJS: {
    output: {
      format: 'iife',
      name: 'LastStepDummyName'
    }
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
    this.options = Utils.shallowMerge(DEFAULT_OPTS.rollupJS, options.rollupJS);
    this.options.plugins = (this.options.plugins || []).concat(
      replace(Utils.shallowMerge(DEFAULT_OPTS.replace, options.replace)),
      globals(),
      builtins(),
      json(Utils.shallowMerge(DEFAULT_OPTS.json, options.json)),
      resolve(Utils.shallowMerge(DEFAULT_OPTS.nodeResolve, options.nodeResolve)),
      commonjs(Utils.shallowMerge(DEFAULT_OPTS.commonJS, options.commonJS)),
    );
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
