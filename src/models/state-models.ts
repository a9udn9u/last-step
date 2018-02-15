import { Utils } from '~/utils';
import { ProcessorInput, ProcessorOutput } from '~/models/processor-models';
import { Processor } from '~/processors/processor';

/**
 * Simple 1-to-M mapping
 */
class OneToMany<T> extends Map<T, Set<T>> {
  constructor() {
    super();
  }
}

/**
 * Target to sources mapping
 */
export class TargetToSources extends OneToMany<string> {
  /**
   * Key is the target file, value is a set of sources that contribute
   * to the target
   */
  constructor() {
    super();
  }

  /**
   * For each target, trace sources back to their original sources
   * @param {Object} oldTts Old targetToSourcesMap
   */
  trace(oldTTS: TargetToSources): void {
    this.forEach((values, key) => {
      let newValues = Array.from(values)
          .map(v => oldTTS.get(v))
          .filter(vals => !!vals)
          .reduce((all, vals) => Utils.union(all, vals), new Set());
      this.set(key, newValues);
    });
  }

  /**
   * Create a new map with flipped key/values
   */
  flip(): SourceToTargets {
    let flipped: SourceToTargets = new SourceToTargets();
    this.forEach((values, key) => {
      values.forEach(val => {
        let rev = flipped.get(val) || new Set<string>();
        rev.add(key);
        flipped.set(val, rev);
      });
    });
    return flipped;
  }
}

export class SourceToTargets extends OneToMany<string> {
}

export class Context {
  rootDir: string;
  sourceDir: string;
  workDir: string;
  index: number;
  input: ProcessorInput;
  output: ProcessorOutput;
  targetToSources: TargetToSources;
  sourceToTargets: SourceToTargets;

  constructor(packed: any = {}) {
    this.rootDir = packed.rootDir;
    this.sourceDir = packed.sourceDir;
    this.workDir = packed.workDir;
    this.index = packed.index;
    this.input = packed.input;
    this.output = packed.output;
    this.targetToSources = packed.targetToSources;
    this.sourceToTargets = packed.sourceToTargets;
  }
}