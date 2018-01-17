import * as fs from 'fs-extra';
import * as path from 'path';
import * as uglify from 'uglify-js';
import * as proc from 'process';
import { Utils } from '~/utils';
import { Processor } from '~/processors/processor';
import { ProcessResult } from '~/models/processor-models';

const DEFAULT_OPTS = {

};

export class UglifyJSProcessor extends Processor {
  private options: any;
  private shouldProcess: boolean;

  constructor(options: any = {}, onlyProcessInProd: boolean = true) {
    super();
    this.options = Utils.shallowMerge(DEFAULT_OPTS, options);
    this.shouldProcess = !onlyProcessInProd || proc.env.NODE_ENV === 'production';
    Utils.dbg() && Utils.debug('Options:', this.options);
  }

  async processFile(source: string, target: string): Promise<ProcessResult> {
    if (this.shouldProcess) {
      let contents = await Utils.readFile(source);
      let minified = await uglify.minify(contents, Utils.shallowMerge(this.options, {
        sourceMap: { filename: path.basename(source) }
      }));
      if (minified.error) {
        throw minified.error;
      }
      return Utils.writeFile(target, minified.code).then(() => undefined);
    } else {
      await fs.ensureSymlink(source, target);
      return undefined;
    }
  }
}

