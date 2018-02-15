import * as fs from 'fs-extra';
import * as path from 'path';
import { Utils } from '~/utils';
import { Environment, Rule, Task } from '~/models/builder-models';
import { Context, TargetToSources } from '~/models/state-models';
import { FinalizerInput,ProcessorInput, ProcessorInputEntry, ProcessorOutput } from '~/models/processor-models';

export class State {
  protected env: Environment;
  protected rule: Rule;
  protected name: string;
  protected contexts: Context[];

  constructor(env: Environment, rule: Rule) {
    this.env = env;
    this.rule = rule;
    this.name = this.constructor.name;

    /**
     * @see {@link Context}
     */
    this.contexts = [];

    Utils.dbg() && Utils.debug(`${this.name} [${this.rule.sources}] created.`);
  }

  getRule(): Rule {
    return this.rule;
  }

  /**
   * Convert given paths to relative paths, ignore those not under sourceDir
   * @param sourceDir Parent path
   * @param paths List of paths
   * @returns Relative paths
   */
  private static toRelativePaths(sourceDir: string, paths: Set<string>): Set<string> {
    return new Set([...paths]
      .map(p => {
        p = Utils.getLocalPath(p);
        if (p) {
          if (!path.isAbsolute(p)) return p;
          if (p.startsWith(`${sourceDir}/`)) return path.relative(sourceDir, p);
        }
        return undefined;
      })
      .filter(p => p !== undefined)
    );
  }

  /**
   * Find targets imported by another target, therefore should be excluded from
   * input of next processor
   * @param tts targetToSources mapping
   * @returns A set of files included by other files
   */
  private static getImportedTargets(tts: TargetToSources): Set<string> {
    let importedTargets: Set<string> = new Set();
    let allTargets = [...tts.keys()];
    for (let i = 0; i < allTargets.length - 1; ++i) {
      for (let j = i + 1; j < allTargets.length; ++j) {
        let t1 = allTargets[i], t2 = allTargets[j];
        let s1 = tts.get(t1), s2 = tts.get(t2);
        let common = Utils.intersection(s1, s2);
        if (s1.size === common.size && s2.size === common.size) {
          // Impossible case
          throw `Files (even paths) are identical? ${t1} ${s1} : ${t2} ${s2}`;
        } else if (s1.size === common.size) {
          importedTargets.add(t1);
          break; // No need to continue as t1 itself is fully contained
        } else if (s2.size === common.size) {
          importedTargets.add(t2);
        }
      }
    }
    return importedTargets;
  }

  beforeBuild(task: Task = undefined): void {
  }

  afterBuild(): void {
  }

  protected nextRootDir(): string {
    return Utils.tmpPath(this.env.workDir);
  }

  /**
   * Generate input for the next processor call. Input element structure:
   * {
   *   source: "path to the source file (target file from the last processor)",
   *   target: "path to the target file, processor should write to here",
   *   shouldCompile: <boolean>, whether if the file requires re-compiled
   * }
   * @param {Object} context Context of current step
   * @param {string} relPath Relative path of the source file
   */
  protected processorInput(context: Context, relPath: string): ProcessorInputEntry {
    return new ProcessorInputEntry(
      path.resolve(context.sourceDir, relPath),
      path.resolve(context.workDir, relPath),
      true
    );
  }

  /**
   * Generate input for the next processor call.
   * Files in the input must be ordered in insertion order so that eventually
   * in Finalizer, when files get merged, they are in the same order as
   * in input.
   * @returns {ProcessorInput} Input for the next processor call.
   */
  nextInput(): ProcessorInput {
    let nextRootDir = this.nextRootDir();
    let input: ProcessorInput;
    let nextContext = new Context({
      rootDir: nextRootDir,
      workDir: path.resolve(nextRootDir, this.env.relativeSourceDir),
      index: this.contexts.length
    });
    if (!this.contexts.length) {
      nextContext.sourceDir = this.env.sourceDir;
      input = new ProcessorInput(nextContext.sourceDir, nextContext.workDir);
      this.rule.files.forEach(file =>
        input.add(this.processorInput(nextContext, file))
      );
    } else {
      let prevContext = Utils.lastElement(this.contexts);
      nextContext.sourceDir = prevContext.workDir;
      input = new ProcessorInput(nextContext.sourceDir, nextContext.workDir);
      for (let [target, entry] of prevContext.output.targetEntries()) {
        if (entry.imported) {
          Utils.dbg() && Utils.debug(`Skipping imported file: ${entry.target}`);
        } else {
          input.add(this.processorInput(nextContext, target))
        }
      }
    }
    this.contexts.push(nextContext);
    return nextContext.input = input;
  }

  /**
   * Generate input for Finalizer
   * @returns {FinalizerInput} Input for Finalizer
   */
  finalizerInput(): FinalizerInput {
    let context = Utils.lastElement(this.contexts);
    let input = new FinalizerInput(context.workDir);
    for (let entry of context.output.values()) {
      if (entry.imported) {
        Utils.dbg() && Utils.debug(`Skipping imported file: ${entry.target}`);
      } else {
        input.add(entry.target);
      }
    }
    return input;
  }

  /**
   * Transform processor output and save it into context.
   * @param output Results returned by processor.
   */
  saveOutput(output: ProcessorOutput): void {
    let context = Utils.lastElement(this.contexts);
    context.output = output;
    if (Utils.dbg()) Utils.debug(`${this.name}: Output`, context.output);

    this.handleFailures(context.output.failures);

    let tts = new TargetToSources();
    for (let [target, entry] of context.output.targetEntries()) {
      // Convert included file paths to relative path
      tts.set(target, State.toRelativePaths(context.sourceDir, entry.contains));
    }

    // In the next step, imported files should be skipped.
    let imported = State.getImportedTargets(tts);
    Utils.dbg() && Utils.debug('Imported files will be excluded from next processor:', imported);
    imported.forEach(target =>
      context.output.getByTarget(target).imported = true
    );

    // TODO: This is a hack, IncrementalState needs this to map to do
    // its own calculation, we saved it in context to avoid duplicated
    // processing in IncrementalState. Base State doesn't need it saved.
    context.targetToSources = tts;
  }

  protected handleFailures(failures: string[]): void {
    // Doesn't seem there is anything need to be done yet, failure should
    // recover organically.
  }

  currentContext(): Context {
    return Utils.lastElement(this.contexts);
  }
}