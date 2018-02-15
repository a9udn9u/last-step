const IncrementalState = include('~/states/incr-state').IncrementalState;

describe('getNewTTS()', () => {
  test('When old TTS is empty', () => {
    let tts = IncrementalState.getNewTTS(
      {
        'a': ['a']
      },
      {
      }
    );
    expect(tts).toEqual(
      {
        'a': new Set(['a'])
      }
    )
  });

  test('No import', () => {
    let tts = IncrementalState.getNewTTS(
      {
        'a': ['a'],
        'b': ['b'],
        'c': ['c']
      },
      {
        'a': ['a'],
        'b': ['b'],
        'c': ['c']
      }
    );
    expect(tts).toEqual(
      {
        'a': new Set(['a']),
        'b': new Set(['b']),
        'c': new Set(['c'])
      }
    )
  });

  test('With import, no target renaming', () => {
    let tts = IncrementalState.getNewTTS(
      {
        'a': ['a'],
        'b': ['b'],
        'c': ['c']
      },
      {
        'a': ['a'],
        'b': ['b', 'c']
      }
    );
    expect(tts).toEqual(
      {
        'a': new Set(['a']),
        'b': new Set(['b', 'c'])
      }
    )
  });

  test('With import, with target renaming', () => {
    let tts = IncrementalState.getNewTTS(
      {
        'a': ['a'],
        'b': ['b'],
        'c': ['c']
      },
      {
        'y': ['a'],
        'z': ['b', 'c']
      }
    );
    expect(tts).toEqual(
      {
        'y': new Set(['a']),
        'z': new Set(['b', 'c'])
      }
    )
  });

  test('With import and previous imports, with target renaming', () => {
    let tts = IncrementalState.getNewTTS(
      {
        'a': ['a1', 'a2'],
        'b': ['b1', 'b2', 'b3'],
        'c': ['c']
      },
      {
        'y': ['a'],
        'z': ['b', 'c']
      }
    );
    expect(tts).toEqual(
      {
        'y': new Set(['a1', 'a2']),
        'z': new Set(['b1', 'b2', 'b3', 'c'])
      }
    )
  });
});

describe('getNewSTT()', () => {
  test('Test', () => {
    let tts = IncrementalState.getNewSTT(
      {
        'a': ['s1', 's2', 's3'],
        'b': ['s3', 's4'],
        'c': ['s1']
      }
    );
    expect(tts).toEqual(
      {
        's1': new Set(['a', 'c']),
        's2': new Set(['a']),
        's3': new Set(['a', 'b']),
        's4': new Set(['b'])
      }
    )
  });
});