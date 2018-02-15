const { Utils } = require('~/utils');

jest.mock('fs-extra');
const fs = require('fs-extra');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('findCommonParents()', () => {
  test('Test', async () => {
    let results;

    results = Utils.findCommonParents([]);
    expect(results).toEqual([]);

    results = Utils.findCommonParents(['/a']);
    expect(results).toEqual(['/a']);

    results = Utils.findCommonParents([
      '/a/b/c', '/a/b/d', '/a/b', '/a',
      '/h', '/h/i/j', '/h/j', '/h/j/k',
      '/o/p/q', '/o/q/p', '/o/p', '/o/q'
    ]);
    expect(results).toEqual([
      '/a', '/h', '/o/p', '/o/q'
    ]);

    results = Utils.findCommonParents([
      '/a/b/c', '/a/b/d', '/a/b', '/a',
      '/h', '/h/i/j', '/h/j', '/h/j/k',
      '/o/p/q', '/o/q/p', '/o/p', '/o/q',
      '/'
    ]);
    expect(results).toEqual(['/']);
  });
});
