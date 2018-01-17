import * as fs from 'fs-extra';
import * as path from 'path';
import { Utils } from '~/utils';
import { FinalizerInput } from '~/models/processor-models';

/**
 * Caches file mtime
 */
const MTIME_CACHE = new Map<string, number>();

export class Finalizer {
  private name: string;
  private targets: string|string[];
  private targetDir: string;

  constructor(targetDir: string, targets: string|string[]) {
    this.targets = targets;
    this.targetDir = targetDir;
    this.name = this.constructor.name;

    Utils.dbg() && Utils.debug(`${this.name} created.`);
  }

  /**
   * Copy/merge files in input to the target directory.
   * Support 3 use cases:
   * 1. No target specified: Source files will be copied to the target
   *    directory 1 to 1, with file name decided by the last processor.
   * 2. One target file specified: All sources will be merged into one file.
   * 3. An array of target files specified: In this case, sources will be
   *    copied to target directory in 1 to 1 fashion first, when there is only
   *    one target left, all remaining sources will be mreged into the last
   *    target.
   * All merged sources will be treated as imports.
   * @param {ProcessorInput} input Input
   * @returns {Promise<void>} A Promise resolve when all copy are done.
   */
  async finalize(input: FinalizerInput): Promise<string[]> {
    if (Utils.dbg()) {
      Utils.debug(`Calling ${this.name}.process().`);
      Utils.debug('Input:', input);
    }

    let sources: string[] = input.sources;
    let copySources: string[] = [], copyTargets: string[] = [];
    let mergeSources: string[], mergeTarget: string;
    let promises: Promise<void>[] = [];
    let returnTargets: string[] = [];
    let targets: string[] = this.targets ? [].concat(this.targets) :
      sources.map(s => path.relative(input.sourceDir, s));

    // Discard excessive targets
    targets.splice(sources.length);

    // Needs merge if true
    if (targets.length < sources.length) {
      mergeSources = sources.splice(targets.length - 1);
      mergeTarget = targets.pop();
    }

    // Copy
    await Promise.all(sources.map(async (source, i) => {
      let target: string = path.resolve(this.targetDir, targets[i]);
      let mtime: number = (await fs.stat(source)).mtimeMs;
      if (MTIME_CACHE.get(source) === mtime) {
        Utils.dbg() && Utils.debug(`${this.name}: ${source} unchanged, skip.`);
      } else {
        copySources.push(source);
        copyTargets.push(target);
        Utils.dbg() && Utils.debug(`${this.name}: ${source} -> ${target}`);
        MTIME_CACHE.set(source, mtime);
      }
      returnTargets.push(target);
    }));
    promises.push(Utils.copyFiles(copySources, copyTargets, {
      overwrite: true, dereference: true
    }));

    // Merge
    if (mergeSources && mergeTarget) {
      mergeTarget = path.resolve(this.targetDir, mergeTarget);
      let shouldProcess: boolean = false;
      await Promise.all(mergeSources.map(async s => {
        let mtime: number = (await fs.stat(s)).mtimeMs;
        if (mtime !== MTIME_CACHE.get(s)) {
          MTIME_CACHE.set(s, mtime);
          shouldProcess = true;
        }
      }));
      if (shouldProcess) {
        Utils.dbg() && Utils.debug(`${this.name}: ${mergeSources} -> ${mergeTarget}`);
        promises.push(Utils.concatFiles(mergeTarget, mergeSources));
      } else {
        Utils.dbg() && Utils.debug(`${this.name}: ${mergeSources} unchanged, skip.`);
      }
      returnTargets.push(mergeTarget);
    }

    return Promise.all(promises).then(() => returnTargets);
  }
}
