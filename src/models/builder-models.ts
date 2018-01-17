import { Utils } from '~/utils';
import { Processor } from '~/processors/processor';
import { Finalizer } from '~/processors/finalizer';

export class Environment {
  rootDir: string;
  workDir: string;
  sourceDir: string;
  targetDir: string;
  relativeSourceDir: string;
  relativeTargetDir: string;
  userFile: string;
  config: Configuration;
}

export class Configuration {
  relativeSourceDir: string;
  relativeTargetDir: string;
  sourceDir: string;
  targetDir: string;
  rules: Rule[];
}

export class Rule {
  sources: string[]|RegExp[];
  targets: string|string[];
  processors: Processor[];
  finalizer: Finalizer;
  files: Set<string>;
}

export class Task extends Map<EditEvent, Set<string>> {
}

/**
 * Edit events
 */
export enum EditEvent {
  ADD = '<CREATED>',
  DEL = '<DELETED>',
  CHG = '<CHANGED>'
}

/**
 * Edit event queue
 */
export class EditQueue {
  private events: EditEvent[];

  constructor() {
    this.events = [];
  }

  push(e: EditEvent): void {
    this.events.push(e);
  }

  reduce(): EditEvent {
    let curr;

    if (this.events.length === 0) return undefined;
    if (this.events.length === 1) return this.events.pop();

    while (this.events.length) {
      let next = this.events.pop();
      if (!curr || curr === next ||
          curr === EditEvent.ADD && next === EditEvent.CHG ||
          curr === EditEvent.CHG && next === EditEvent.DEL) {
        curr = next;
      }
      if (curr === EditEvent.ADD && next === EditEvent.DEL ||
          curr === EditEvent.DEL && next === EditEvent.ADD) {
        curr = undefined;
      }
      if (curr === EditEvent.CHG && next === EditEvent.ADD ||
          curr === EditEvent.DEL && next === EditEvent.CHG) {
        Utils.warn(`Bad state transition: ${curr} -> ${next}.`);
      }
    }
    return curr;
  }
}
