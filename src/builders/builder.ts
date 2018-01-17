import * as fs from 'fs-extra';
import * as path from 'path';
import { Utils } from '~/utils';
import { State } from '~/states/state';
import { Processor } from '~/processors/processor';
import { Finalizer } from '~/processors/finalizer';
import { Rule, Environment, Configuration } from '~/models/builder-models';
import { ProcessorInput } from '~/models/processor-models';

export class Builder {
  protected name: string;
  protected envPromise: Promise<Environment>;
  protected stateClass: typeof State;
  protected env: Environment;
  protected states: State[];
  protected fileToRule: Map<string, Rule>;
  protected ruleToTargets: Map<Rule, string[]>;

  constructor(rootDir: string, workDir: string, userFile: string, defaults: any) {
    this.envPromise = this.buildEnv(rootDir, workDir, userFile, defaults);
    this.name = this.constructor.name;
    this.stateClass = State;
    this.ruleToTargets = new Map();
  }

  /**
   * Import configs in user file, merge with default configs
   * @param {string} userFile Path to user config file
   * @returns {any} User configs
   */
  private getConfig(userFile: string): any {
    let userConfig: any = {};
    if (fs.existsSync(userFile)) {
      try {
        userConfig = require(userFile);
      } catch (err) {
        Utils.fatal(`${userFile} corrupted or unreadable.`, err);
      }
    } else {
      Utils.info(`${userFile} doesn't exist, will use default config.`);
    }
    return userConfig;
  }

  /**
   * Sanitize config.
   * @param {Configuration} config Config
   * @param {string} rootDir Project root directory
   * @returns {Configuration} Santinized config
   */
  private sanitizeConfig(config: Configuration, rootDir: string): Configuration {
    config.relativeSourceDir = config.sourceDir;
    config.relativeTargetDir = config.targetDir;
    config.sourceDir = path.resolve(rootDir, config.sourceDir);
    config.targetDir = path.resolve(rootDir, config.targetDir);
    config.rules.forEach(rule => {
      rule.sources = rule.sources ? [].concat(rule.sources) : [];
      rule.files = new Set();
      rule.finalizer = new Finalizer(config.targetDir, rule.targets);
      rule.processors = rule.processors || [];
      rule.processors.forEach(processor => {
        if (processor.process !== Processor.prototype.process) {
          Utils.fatal(`${processor.id}: .process() shouldn't be overriden.`);
        }
      })
    });
    return config;
  }

  /**
   * Merge default and user config.
   * @param {any} defaults Default config
   * @param {any} userConfig User config
   * @returns {Configuration} Merged config
   */
  private mergeConfig(defaults: any, userConfig: any): Configuration {
    let fallbackRules: any[] = defaults.fallbackRules;
    let rules: any[] = userConfig.rules || [];
    let config: Configuration;
    delete defaults.fallbackRules;
    delete userConfig.fallbackRules;
    config = Utils.shallowMerge(defaults, userConfig);
    config.rules = fallbackRules.concat(rules);
    return config;
  }

  /**
   * Matches a file path against rules in reversed order, return the first found
   * @param config Config
   * @param file File to match
   * @returns The matched rule, or undefined if no match
   */
  protected matchRule(config: Configuration, file: string): Rule {
    // Traverse in reverse order so later rules have higher priorities
    for (let i = config.rules.length - 1; i >=0; --i) {
      let rule = config.rules[i];
      if (Utils.matchOrEqual(file, rule.sources)) {
        return rule;
      }
    }
  }

  /**
   * Scan source directory, get full manifest of files, and add matched files
   * to each rule in config.
   * Also build mapping from file path to matching rule.
   * @param {Object} config Config
   * @returns {Array} [Config with matched files, file path to rule mapping]
   */
  private async matchSourceFiles(config: Configuration): Promise<Configuration> {
    this.fileToRule = new Map();
    (await Utils.listAllFiles(config.sourceDir, true)).forEach(file => {
      let rule = this.matchRule(config, file);
      if (rule) {
        rule.files.add(file);
        this.fileToRule.set(file, rule);
      }
    });
    return config;
  }

  /**
   * Consolidate global variables
   * @param {string} rootDir Project directory
   * @param {string} workDir Work directory
   * @param {string} userFile User file name
   * @param {any} defaults Default config
   */
  private async buildEnv(rootDir: string, workDir: string, userFile: string, defaults: any): Promise<Environment> {
    let userFilePath: string = path.resolve(rootDir, userFile);
    let userConfig: any = this.getConfig(userFilePath);
    let mergedConfig: Configuration = this.mergeConfig(defaults, userConfig);
    let sanitizedConfig: Configuration = this.sanitizeConfig(mergedConfig, rootDir);
    let config = await this.matchSourceFiles(sanitizedConfig);

    let env = new Environment();
    env.rootDir = rootDir;
    env.workDir = workDir;
    env.sourceDir = config.sourceDir;
    env.targetDir = config.targetDir;
    env.relativeSourceDir = config.relativeSourceDir;
    env.relativeTargetDir = config.relativeTargetDir;
    env.userFile = userFilePath;
    env.config = config;
    Utils.dbg() && Utils.debug('Environment: ', Utils.toJson(env));
    return env;
  }

  /**
   * Get all build targets
   * @returns Array for targets
   */
  protected getAllTargets(): string[] {
    return [...this.ruleToTargets.values()]
      .reduce((all, perRule) => all.concat(perRule), []);
  }

  /**
   * Ensures a symlink to the node_modules dir exists in the processor work dir
   * @param dir Work dir of a processor
   */
  private async ensureNodeModules(dir: string): Promise<void> {
    let npdir = path.resolve(this.env.rootDir, 'node_modules');
    let symlink = path.resolve(dir, 'node_modules');
    return fs.ensureSymlink(npdir, symlink);
  }

  /**
   * Invoke processors in a rule, mutate states
   * @param rule Rule
   * @param state State
   * @returns true if all processors succeeded, false otherwise
   */
  protected async invokeProcessors(rule: Rule, state: State): Promise<boolean> {
    let success: boolean = true;
    for (let processor of rule.processors) {
      let input: ProcessorInput = state.nextInput();
      await this.ensureNodeModules(state.currentContext().rootDir);
      let output = await processor.process(input);
      state.saveOutput(output);
      success = success && !output.failures.length;
    }
    if (rule.processors.length) {
      let targets: string[] = await rule.finalizer.finalize(state.finalizerInput());
      Utils.dbg() && Utils.debug(`Build passed in ${rule.sources}:`, targets);
      this.ruleToTargets.set(rule, targets);
    }
    return success;
  }

  /**
   * Do one time build
   * @returns Promise, resolve when done.
   */
  async build(): Promise<void> {
    let success: boolean = true;
    this.env = await this.envPromise;
    this.states = await Promise.all(this.env.config.rules.map(async rule => {
      let state = new this.stateClass(this.env, rule);
      if (rule.files.size) {
        state.beforeBuild();
        success = await this.invokeProcessors(rule, state) && success;
        state.afterBuild();
      }
      return state;
    }));
    let targets: string[] = this.getAllTargets();
    Utils.dbg() && Utils.debug(`${this.name}: Final targets`, targets);

    return Utils.cleanDirectory(this.env.targetDir, targets)
      .then(() => Utils.info(`Build ${success ? 'SUCCESS' : 'FAILED'}`))
      .catch(ex => Utils.error(`Error happened during cleanup`, ex));
  }

  exit(): void {
  }
}
