import * as fs from 'fs-extra';
import * as path from 'path';
import { Processor } from '~/processors/processor';
import { ProcessResult } from '~/models/processor-models';

export class CopyProcessor extends Processor {
  constructor() {
    super();
  }

  async processFile(source: string, target: string): Promise<ProcessResult> {
    await fs.ensureSymlink(source, target);
    return undefined;
  }
}