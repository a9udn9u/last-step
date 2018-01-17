export class ProcessResult {
  private importFiles: Set<string>;
  private targetFile: string;

  constructor(importFiles: string[] = [], targetFile: string = undefined) {
    this.importFiles = new Set(importFiles);
    this.targetFile = targetFile;
  }

  get imports(): Set<string> {
    return this.importFiles;
  }

  get target(): string {
    return this.targetFile;
  }
}

class ProcessorIOEntry {
  source: string;
  target: string;

  constructor(source: string, target: string) {
    this.source = source;
    this.target = target;
  }
}

export class ProcessorInputEntry extends ProcessorIOEntry {
  shouldCompile: boolean;
  lastOutput: ProcessorOutputEntry;

  constructor(source: string, target: string, shouldCompile: boolean = false, lastOutput: ProcessorOutputEntry = undefined) {
    super(source, target);
    this.shouldCompile = shouldCompile;
    this.lastOutput = lastOutput;
  }
}

export class ProcessorOutputEntry extends ProcessorIOEntry {
  contains: Set<string>;
  imported: boolean;

  constructor(source: string, target: string, contains: Set<string> = new Set()) {
    super(source, target);
    this.contains = contains;
  }
}

class ProcessorIO<T extends ProcessorIOEntry> {
  private bySourceMap: Map<string, T>;
  private byTargetMap: Map<string, T>;

  constructor() {
    this.bySourceMap = new Map();
    this.byTargetMap = new Map();
  }

  add(entry: T): void {
    this.bySourceMap.set(entry.source, entry);
    this.byTargetMap.set(entry.target, entry);
  }

  hasSource(key: string): boolean {
    return this.bySourceMap.has(key);
  }

  getBySource(key: string): T {
    return this.bySourceMap.get(key);
  }

  hasTarget(key: string): boolean {
    return this.byTargetMap.has(key);
  }

  getByTarget(key: string): T {
    return this.byTargetMap.get(key);
  }

  *values(): Iterable<T> {
    yield* this.bySourceMap.values();
  }

  get sources(): string[] {
    return [...this.values()].map(entry => entry.source);
  }

  get targets(): string[] {
    return [...this.values()].map(entry => entry.target);
  }
}

export class ProcessorInput extends ProcessorIO<ProcessorInputEntry> {
}

export class ProcessorOutput extends ProcessorIO<ProcessorOutputEntry> {
  failures: string[] = [];
}

export class FinalizerInput {
  sourceSet: Set<string>;
  sourceDir: string;

  constructor() {
    this.sourceSet = new Set();
  }

  add(source: string) {
    this.sourceSet.add(source);
  }

  *values(): Iterable<string> {
    yield* this.sourceSet.values();
  }

  get sources(): string[] {
    return [...this.sourceSet];
  }
}

