import * as path from 'path';
import { Utils } from '~/utils';
import { EditEvent, Environment, Rule, Task } from '~/models/builder-models';
import { TargetToSources, SourceToTargets, Context } from '~/models/state-models';
import { State } from '~/states/state';
import { ProcessorOutput, ProcessorInputEntry } from '~/models/processor-models';

export class IncrementalState extends State {
  /**
   * 1 to M mapping, key is the target file, value is a set of source
   * files which compose the target file
   */
  targetToSources: TargetToSources;
  /**
   * 1 to M mapping, key is the source file, value is a set of target
   * files which contain the source file
   */
  sourceToTargets: SourceToTargets;
  /**
   * This is a set of sources that should be forced to re-compile in the
   * next incremental build
   */
  recompileSources: Set<string>;
  /**
   * Conetxt list from the last build
   */
  lastBuildContexts: Context[];

  constructor(env: Environment, rule: Rule) {
    super(env, rule);
    this.targetToSources = new TargetToSources();
    this.sourceToTargets = new SourceToTargets();
    this.recompileSources = new Set();
  }

  /**
   * Find files requring re-compile when the given file changed.
   * First find the targets affected by the changed file, then backtrack each
   * execution context, find the original source of each target.
   *
   * File additions will fall through, but caught later in
   * [processorInput()]{@link IncrementalState#processorInput}
   *
   * @param file The added/updated/deleted file.
   * @returns List of files requiring re-compile.
   */
  private findReompileSources(source: string): Set<string> {
    let sources = new Set<string>();
    let targets = this.sourceToTargets.get(source);
    if (!targets) {
      sources.add(source);
    } else {
      targets.forEach(finalTarget => {
        // Backtracking source
        // TODO: This might be unncecessary though, the key of the output
        // map is the original source (needs confirmation)
        let file = finalTarget;
        for (let i = this.contexts.length - 1; i >= 0; --i) {
          let context = this.contexts[i];
          file = context.output.getByTarget(file).source;
          file = path.relative(context.sourceDir, file);
        }
        sources.add(file);
      });
    }
    Utils.dbg() && Utils.debug('Re-compile candidates:', sources);
    return sources;
  }

  private getLastBuildContext(index: number): Context {
    return this.lastBuildContexts ? this.lastBuildContexts[index] : undefined;
  }

  protected nextRootDir(): string {
    // At this point, new context hasn't been pushed to this.contexts,
    // so index should be context length without minus one
    let lastBuildContext = this.getLastBuildContext(this.contexts.length);
    return lastBuildContext ? lastBuildContext.rootDir : super.nextRootDir();
  }

  protected processorInput(context: Context, file: string): ProcessorInputEntry {
    let entry = new ProcessorInputEntry(
      path.resolve(context.sourceDir, file),
      path.resolve(context.workDir, file),
      false,
      undefined
    );

    let lastBuildContext = this.getLastBuildContext(context.index);
    // Original source files in recompileSources should be compiled
    if (context.index === 0) {
      if (this.recompileSources.has(file)) {
        entry.shouldCompile = true;
        Utils.dbg() && Utils.debug(`Recompile ${file} because itself or its dependencies have changed.`);
      }
    }
    // First build, or previous build didn't advance to this step, source should be
    // compiled regardless.
    if (!lastBuildContext) {
      entry.shouldCompile = true;
    }
    // No ouput from last exection, either this is a new file, or the file
    // failed compile last time, either way it should be re-compiled
    else if (!lastBuildContext.output.hasSource(file)) {
      Utils.dbg() && Utils.debug(`Recompile ${file} because it's new or it failed last time.`);
      entry.shouldCompile = true;
    }

    // When compile is skipped, processor needs output from last build to
    // generate its own output
    if (lastBuildContext) {
      entry.lastOutput = lastBuildContext.output.getBySource(file);
    }

    return entry;
  }

  beforeBuild(task: Task = new Task()): void {
    super.beforeBuild(task);
    // Compute re-compile sources
    this.recompileSources = [...task.values()]
      .reduce((all, batch) => all.concat([...batch]), [])
      .map(file => this.findReompileSources(file))
      .reduce((cands, sources) => Utils.union(cands, sources), new Set());

    // Update file list according to file system update
    if (task.has(EditEvent.ADD)) {
      task.get(EditEvent.ADD).forEach(f => this.rule.files.add(f));
    }
    if (task.has(EditEvent.DEL)) {
      task.get(EditEvent.DEL).forEach(f => this.rule.files.delete(f));
    }

    // Reinitiate TTS
    if (this.rule.files.size) {
      this.targetToSources = new TargetToSources();
      this.rule.files.forEach(f => this.targetToSources.set(f, new Set([f])));
      this.sourceToTargets = this.targetToSources.flip();
    }
    this.lastBuildContexts = this.contexts;
    this.contexts = [];
  }

  /**
   * Transform processor output and save it into context.
   * @param output Results returned by processor.
   */
  saveOutput(output: ProcessorOutput): void {
    super.saveOutput(output);

    let context = Utils.lastElement(this.contexts);

    // Update targetToSourcesMap and sourceToTargetsMap
    context.targetToSources.trace(this.targetToSources);
    this.targetToSources = context.targetToSources;
    context.sourceToTargets = this.sourceToTargets = this.targetToSources.flip();

    if (Utils.dbg()) {
      Utils.debug(`${this.name}: TTS`, this.targetToSources);
      Utils.debug(`${this.name}: STT`, this.sourceToTargets);
    }
  }
}