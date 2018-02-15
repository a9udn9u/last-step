const { FinalizerInput } = require ('~/models/processor-models');
const { Finalizer } = require('~/processors/finalizer');

jest.mock('~/utils');
jest.mock('fs-extra');
const Utils = require('~/utils').Utils;

beforeEach(() => {
  jest.clearAllMocks();
})

describe('finalize()', () => {
  test('Merge all into one target file', async () => {
    let finalizer = new Finalizer('/fake-root/fake-target', 'fake-path/target.js');
    let input = new FinalizerInput('/fake/dir');
    input.add('/fake/dir/1');
    input.add('/fake/dir/2');
    let result = await finalizer.finalize(input);
    let fakeTarget = '/fake-root/fake-target/fake-path/target.js';
    expect(result.length).toBe(1);
    expect(result[0]).toBe(fakeTarget);
    expect(Utils.copyFiles).toHaveBeenCalledTimes(0);
    expect(Utils.concatFiles).toHaveBeenCalledTimes(1);
    expect(Utils.concatFiles).toHaveBeenCalledWith(fakeTarget, ['/fake/dir/1', '/fake/dir/2']);
  });

  test('One to one copy', async () => {
    let finalizer = new Finalizer(
      { targetDir: '/fake-root/fake-target', },
      { targets: undefined }
    );
    let result = await finalizer.finalize(new Map([
      ['a/1', {
        'source': '/fake/source/1',
        'target': '/will/ignore'
      }],
      ['a/2', {
        'source': '/fake/source/2',
        'target': '/will/ignore/too'
      }]
    ]));
    let fakeTarget1 = '/fake-root/fake-target/a/1';
    let fakeTarget2 = '/fake-root/fake-target/a/2';
    let output = result.output;
    expect(result.workDir).toBe('/fake-root/fake-target');
    expect(output.size).toBe(2);
    let outputEntry1 = output.get('a/1');
    let outputEntry2 = output.get('a/2');
    expect(outputEntry1.source).toBe('/fake/source/1');
    expect(outputEntry1.target).toBe(fakeTarget1);
    expect(outputEntry1.contains).toEqual(['a/1'])
    expect(outputEntry2.source).toBe('/fake/source/2');
    expect(outputEntry2.target).toBe(fakeTarget2);
    expect(outputEntry2.contains).toEqual(['a/2']);
    expect(Utils.copyFiles).toHaveBeenCalledTimes(2);
    expect(Utils.copyFiles).toHaveBeenCalledWith(['/fake/source/1'], [fakeTarget1]);
    expect(Utils.copyFiles).toHaveBeenCalledWith(['/fake/source/2'], [fakeTarget2]);
    expect(Utils.concatFiles).toHaveBeenCalledTimes(0);
  });

  test('One to one copy then merge the rest', async () => {
    let finalizer = new Finalizer(
      { targetDir: '/fake-root/fake-target', },
      { targets: ['b/1', 'b/2'] }
    );
    let result = await finalizer.finalize(new Map([
      ['a/1', {
        'source': '/fake/source/1',
        'target': '/will/ignore'
      }],
      ['a/2', {
        'source': '/fake/source/2',
        'target': '/will/ignore/too'
      }],
      ['a/3', {
        'source': '/fake/source/3',
        'target': '/will/ignore/again'
      }]
    ]));
    let fakeTarget1 = '/fake-root/fake-target/b/1';
    let fakeTarget2 = '/fake-root/fake-target/b/2';
    let output = result.output;
    expect(result.workDir).toBe('/fake-root/fake-target');
    expect(output.size).toBe(2);
    let outputEntry1 = output.get('b/1');
    let outputEntry2 = output.get('b/2');
    expect(outputEntry1.source).toBe('/fake/source/1');
    expect(outputEntry1.target).toBe(fakeTarget1);
    expect(outputEntry1.contains).toEqual(['a/1']);
    expect(outputEntry2.source).toBe('/fake/source/2');
    expect(outputEntry2.target).toBe(fakeTarget2);
    expect(outputEntry2.contains).toEqual(['a/2', 'a/3']);
    expect(Utils.copyFiles).toHaveBeenCalledTimes(1);
    expect(Utils.copyFiles).toHaveBeenCalledWith(['/fake/source/1'], [fakeTarget1]);
    expect(Utils.concatFiles).toHaveBeenCalledTimes(1);
    expect(Utils.concatFiles).toHaveBeenCalledWith(fakeTarget2, ['/fake/source/2', '/fake/source/3']);
  });
});