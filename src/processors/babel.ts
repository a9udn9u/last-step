import * as babel from 'babel-core';
import * as util from 'util';
import { Utils } from '~/utils';
import { Processor } from '~/processors/processor';
import { ProcessResult } from '~/models/processor-models';

const DEFAULT_OPTS = {
  babelrc: false,
  presets: ["env"]
};

const babelAsync: Function = util.promisify(babel.transformFile).bind(babel);

export class BabelProcessor extends Processor {
  private options: any;

  constructor(options: any = {}) {
    super();
    this.options = Utils.shallowMerge(DEFAULT_OPTS, options);
    Utils.dbg() && Utils.debug('Options:', this.options);
  }

  async processFile(source: string, target: string): Promise<ProcessResult> {
    let bundle = await babelAsync(source, Utils.shallowMerge(this.options, {
      sourceRoot: '/Users/quangan/Dropbox/Projects/LastStepDebug'
    }));
    return Utils.writeFile(target, bundle.code).then(() => undefined);
  }
}
