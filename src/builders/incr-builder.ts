import * as path from 'path';
import * as chokidar from 'chokidar';
import { Utils } from '~/utils';
import { Builder } from '~/builders/builder';
import { State } from '~/states/state';
import { IncrementalState } from '~/states/incr-state';
import { Rule, Task, EditEvent, EditQueue } from '~/models/builder-models';

const BUILD_DELAY = 250;

const CHOKIDAR_OPTIONS = {
  persistent: true,
  ignoreInitial: true,
  followSymlinks: true,
  usePolling: false,
  atomic: 250,
  alwaysStat: false,
  awaitWriteFinish: true
};

export class IncrementalBuilder extends Builder {
  private editQueues: Map<string, EditQueue>;
  private watcher: any;
  private ruleToState: Map<Rule, State>;
  /**
   * Created when build starts, resolved when build ends
   */
  private buildPromise: Promise<void>;
  /**
   * Resolved when interruption (i.e., CTRL+C) is received
   */
  private exitPromiseResolve: Function;
  /**
   * setTimeout handle for build delay
   */
  private buildDelayTimeout: NodeJS.Timer;

  constructor(rootDir, workDir, userFile, defaults) {
    super(rootDir, workDir, userFile, defaults);

    this.stateClass = IncrementalState;
    this.buildPromise = Promise.resolve();
    this.editQueues = new Map();
    this.ruleToState = new Map();
  }

  private shouldIgnore(file: string): boolean {
    let rel = path.relative(this.env.sourceDir, file);
    let rule = this.matchRule(this.env.config, rel);
    let ignore = !rule || !rule.processors.length;
    ignore && Utils.dbg() && Utils.debug(`${this.name}: Ignore`, file);
    return ignore;
  }

  private watchReady(): void {
    Utils.info('Listening to file changes, press CTRL+C to exit.');
  }

  private watchError(ex: any): void {
    Utils.warn('Error happened in file watcher, rebuild may fix it.', ex);
  }

  private triggerBuild(): void {
    // Already triggered
    if (this.buildDelayTimeout !== undefined) return;

    this.buildDelayTimeout = setTimeout(() =>
      this.buildPromise.then(() => {
        this.incremental();
        this.buildDelayTimeout = undefined;
      }),
      BUILD_DELAY
    );
  }

  private intake(action: EditEvent, file: string): void {
    let relative: string = path.relative(this.env.sourceDir, file);
    let queue: EditQueue = this.editQueues.get(relative) || new EditQueue();
    queue.push(action);
    this.editQueues.set(relative, queue);
    Utils.info(action, file);
    this.triggerBuild();
  }

  /**
   * Generate a map from updates. Key of the map is an State instance, value
   * the updated files.
   * @param {Object} Updates
   * @returns {Map<State, Object>} Tasks
   */
  private generateTasks(updates: Map<string, EditEvent>): Map<State, Task> {
    let tasks: Map<State, Task> = new Map();
    updates.forEach((event, file) => {
      let rule: Rule = this.fileToRule.get(file);
      if (!rule) {
        rule = this.matchRule(this.env.config, file);
        // When the file is deleted, it's not removed from fileRuleMap,
        // this is a feature, because if the file is later added again,
        // disk operations can be avoided.
        this.fileToRule.set(file, rule);
        Utils.info(`${file} matched ${rule.sources}`);
      }
      let state: State = this.ruleToState.get(rule);
      let task: Task = tasks.get(state) || new Task();
      let files: Set<string> = task.get(event) || new Set();
      files.add(file);
      task.set(event, files);
      tasks.set(state, task);
    });
    return tasks;
  }

  private async incremental(): Promise<void> {
    let resolve: Function;
    this.buildPromise = new Promise(r => resolve = r);

    let updates: Map<string, EditEvent> = new Map();
    this.editQueues.forEach((queue, file) => {
      let event: EditEvent = queue.reduce();
      if (event) updates.set(file, event);
    });
    this.editQueues = new Map();

    let tasks = this.generateTasks(updates);
    if (Utils.dbg()) {
      tasks.forEach((task, state) => Utils.debug(`Build tasks for ${state.getRule().sources}`, task));
    }

    let success = true;
    let entries = Array.from(tasks.entries());
    await Promise.all(entries.map(async ([state, task]) => {
      let rule = state.getRule();
      state.beforeBuild(task);
      success = await this.invokeProcessors(rule, state) && success;
      state.afterBuild();
    }));

    await Utils.cleanDirectory(this.env.targetDir, this.getAllTargets())
      .then(() => Utils.info(`Build ${success ? 'COMPLETED' : 'INCOMPLETE'}`))
      .catch(ex => Utils.error('Error happened during cleanup', ex));
    resolve();
  }

  async build(): Promise<void> {
    await super.build();
    this.states.forEach(s => this.ruleToState.set(s.getRule(), s));

    this.watcher = chokidar.watch(this.env.sourceDir, {
      ...CHOKIDAR_OPTIONS,
      ignored: this.shouldIgnore.bind(this)
    });

    this.watcher
      .on('ready', () => this.watchReady())
      .on('error', ex => this.watchError(ex))
      .on('add', p => this.intake(EditEvent.ADD, p))
      .on('unlink', p => this.intake(EditEvent.DEL, p))
      .on('change', p => this.intake(EditEvent.CHG, p));

    return new Promise<void>(resolve => this.exitPromiseResolve = resolve);
  }

  exit(): void {
    this.watcher && this.watcher.close();
    this.buildPromise.then(() => this.exitPromiseResolve());
  }
};
