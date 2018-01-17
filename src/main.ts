import * as fs from 'fs-extra';
import { Utils } from'~/utils';
import { IncrementalBuilder } from '~/builders/incr-builder';
import { Builder } from '~/builders/builder';

export class LastStep {
  private builder: Builder;
  private watch: string;
  private userFile: string;

  constructor(options: any) {
    this.watch = options.watch;
    this.userFile = options.userFile;
  }

  async run(): Promise<void> {
    let rootDir: string = await fs.realpath(await Utils.getPackageRoot());
    let workDir = await fs.realpath(Utils.tmpPath(undefined, 'last-step-'));
    let defaultConfig = require('~/defaults').defaultConfig;
    let builderClass = this.watch ? IncrementalBuilder : Builder;

    this.builder = new builderClass(rootDir, workDir, this.userFile, defaultConfig);

    try {
      await this.builder.build();
    } catch (ex) {
      console.error(ex);
    }
    return fs.remove(workDir);
  }

  interrupt(): void {
    this.builder && this.builder.exit();
  }
}
