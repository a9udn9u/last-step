const State = include('~/builders/state');

describe('toRelativePaths()', () => {
  test('Test', () => {
    let paths = State.toRelativePaths([
      '/pkg/src/path/1',
      'path/2',
      '/pkg/node_modules/external/1',
      '/external/2'
    ], '/pkg/src');
    expect(paths.size).toBe(2);
    expect(paths.has('path/1')).toBe(true);
    expect(paths.has('path/2')).toBe(true);
  });
});

describe('getImportedTargets()', () => {
  test('No import', () => {
    let remove = State.getImportedTargets({
      'a': ['a'],
      'b': ['b'],
      'c': ['z']
    });
    expect(remove.size).toBe(0);
  });

  test('With import, no target renaming', () => {
    let remove = State.getImportedTargets({
      'a': ['a', 'b'],
      'b': ['b'],
      'c': ['b', 'c']
    });
    expect(remove.size).toBe(1);
    expect(remove.has('b')).toBe(true);
  });

  test('With import, with target renaming', () => {
    let remove = State.getImportedTargets({
      'a': ['a', 'c'],
      'b': ['b'],
      'z': ['b', 'c']
    });
    expect(remove.size).toBe(1);
    expect(remove.has('b')).toBe(true);
  });
});

