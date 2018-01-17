import * as sass from 'node-sass';
import * as util from 'util';
import { Utils } from '~/utils';
import { Processor } from '~/processors/processor';
import { ProcessResult } from '~/models/processor-models';

const DEFAULT_OPTS = {};

const SASS_EXT = /\.sass$/i;

const sassAsync = util.promisify(sass.render).bind(sass);

export class SASSProcessor extends Processor {
  private options: any;

  constructor(options: any = {}) {
    super();
    this.options = Utils.shallowMerge(DEFAULT_OPTS, options);
    Utils.dbg() && Utils.debug('Options:', this.options);
  }

  async processFile(source: string, target: string): Promise<ProcessResult> {
    target = target.replace(SASS_EXT, '.css');
    let contents = await Utils.readFile(source);
    let options = Utils.shallowMerge(this.options, { file: source, outFile: target });
    let result = await sassAsync(options);
    return Utils.writeFile(target, result.css).then(() =>
      new ProcessResult(result.stats.includedFiles, target)
    );
  }
}
