import * as fs from 'fs-extra';
import * as proc from 'process';
import * as CleanCSS from 'clean-css';
import { Utils } from '~/utils';
import { Processor } from '~/processors/processor';
import { ProcessResult } from '~/models/processor-models';

const DEFAULT_OPTS = {
  inline: ['local']
};

export class CleanCSSProcessor extends Processor {
  private ccss: CleanCSS;
  private shouldProcess: boolean;

  constructor(options: any = {}, onlyProcessInProd: boolean = true) {
    super();
    options = Utils.shallowMerge(DEFAULT_OPTS, options, {
      returnPromise: true
    });
    this.ccss = new CleanCSS(options);
    this.shouldProcess = !onlyProcessInProd || proc.env.NODE_ENV === 'production';
    Utils.dbg() && Utils.debug('Options:', options);
  }

  async processFile(source: string, target: string): Promise<ProcessResult> {
    if (this.shouldProcess) {
      let compiled = await this.ccss.minify([source]);
      let imports: Set<string> = new Set(compiled.inlinedStylesheets);
      imports.delete(source);
      return Utils.writeFile(target, compiled.styles).then(() =>
          new ProcessResult([...imports])
      );
    } else {
      await fs.ensureSymlink(source, target);
      return undefined;
    }
  }
}
