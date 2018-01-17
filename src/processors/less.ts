import * as less from 'less';
import * as LessNpmImport from 'less-plugin-npm-import';
import { Utils } from '~/utils';
import { Processor } from '~/processors/processor';
import { ProcessResult } from '~/models/processor-models';

const DEFAULT_OPTS = {};

const LESS_EXT = /\.less$/i;

export class LESSProcessor extends Processor {
  private options: any;

  constructor(options: any = {}) {
    super();
    this.options = Utils.shallowMerge(DEFAULT_OPTS, options);
    this.options.plugins = (this.options.plugins || []).concat(
      new LessNpmImport()
    );
    Utils.dbg() && Utils.debug('Options:', this.options);
  }

  async processFile(source: string, target: string): Promise<ProcessResult> {
    let contents = await Utils.readFile(source);
    let options = Utils.shallowMerge(this.options, { filename: source });
    let compiled = await less.render(contents, options);
    // Update target file name
    target = target.replace(LESS_EXT, '.css');
    return Utils.writeFile(target, compiled.css).then(() =>
      new ProcessResult(compiled.imports, target)
    );
  }
}
