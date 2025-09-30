import { assert } from 'chai'

import { parseTable } from '../lib/table-parser.js'

describe('table-parser', () => {
  it('{b,a,c}', function () {
    const out = [
      ['a', ['.', 'a'], undefined, [false, false, [0, 0]]],
      ['b', ['.', 'b'], undefined, [false, false, [0, 0]]],
      ['c', ['.', 'c'], undefined, [false, false, [0, 0]]],
    ]
    assert.deepEqual(parseTable(this.test.title), out)
  })

  it('{b,a,a}', function () {
    const out = [
      ['a', ['.', 'a'], undefined, [false, false, [0, 0]]],
      ['a', ['.', 'a'], undefined, [false, false, [0, 0]]],
      ['b', ['.', 'b'], undefined, [false, false, [0, 0]]],
    ]
    assert.deepEqual(parseTable(this.test.title), out)
  })

  it(`{x: b , a = null , z :c = 'test'}`, function () {
    const out = [
      ['a', ['.', 'a'], null, [false, false, [0, 0]]],
      ['x', ['.', 'b'], undefined, [true, false, [0, 0]]],
      ['z', ['.', 'c'], 'test', [true, false, [0, 0]]],
    ]
    assert.deepEqual(parseTable(this.test.title), out)
  })

  it('{bar.bur[*].b, foo, bar.bur[].a}', function () {
    const out = [
      [
        'bar.bur[0].b',
        ['.', 'bar', '.', 'bur', '[*]', ['.', 'b']],
        undefined,
        [false, true, [0, 0]],
      ],
      ['foo', ['.', 'foo'], undefined, [false, false, [0, 0]]],
      [
        'bar.bur[0].a',
        ['.', 'bar', '.', 'bur', '[]', ['.', 'a']],
        undefined,
        [false, false, [0, 1]],
      ],
    ]
    assert.deepEqual(parseTable(this.test.title), out)
  })

  it(`{bur: foo, bar.bur[*].a, 'bar[=].b': bar.bur[].b}`, function () {
    const out = [
      [
        'bar.bur[0].a',
        ['.', 'bar', '.', 'bur', '[*]', ['.', 'a']],
        undefined,
        [false, true, [0, 0]],
      ],
      ['bur', ['.', 'foo'], undefined, [true, false, [0, 0]]],
      [
        'bar[=].b',
        ['.', 'bar', '.', 'bur', '[]', ['.', 'b']],
        undefined,
        [true, false, [0, 1]],
      ],
    ]
    assert.deepEqual(parseTable(this.test.title), out)
  })

  it('{a.d[].c[].f, a.d[].g, a.b[].c[].e[], a.b[].g}', function () {
    const out = [
      [
        'a.b[].g',
        ['.', 'a', '.', 'b', '[]', ['.', 'g']],
        undefined,
        [false, false, [0, 0]],
      ],
      [
        'a.b[].c[].e[]',
        ['.', 'a', '.', 'b', '[]', ['.', 'c', '[]', ['.', 'e', '[]', []]]],
        undefined,
        [false, false, [0, 0]],
      ],
      [
        'a.d[].g',
        ['.', 'a', '.', 'd', '[]', ['.', 'g']],
        undefined,
        [false, false, [0, 0]],
      ],
      [
        'a.d[].c[].f',
        ['.', 'a', '.', 'd', '[]', ['.', 'c', '[]', ['.', 'f']]],
        undefined,
        [false, false, [0, 0]],
      ],
    ]
    assert.deepEqual(parseTable(this.test.title), out)
  })

  it(`{
      bb[*].dd,
      bb[].ee[*].dd,
      bb[].ee[].hh[*].dd,
      myKey: bb[].ee[].hh[].ii.dd,
      aa,
      bb[].cc,
    }`, function () {
    const out = [
      [
        'bb[0].dd',
        ['.', 'bb', '[*]', ['.', 'dd']],
        undefined,
        [false, true, [0, 0]],
      ],
      [
        'bb[0].ee[0].dd',
        ['.', 'bb', '[]', ['.', 'ee', '[*]', ['.', 'dd']]],
        undefined,
        [false, true, [0, 1]],
      ],
      [
        'bb[0].ee[0].hh[0].dd',
        ['.', 'bb', '[]', ['.', 'ee', '[]', ['.', 'hh', '[*]', ['.', 'dd']]]],
        undefined,
        [false, true, [1, 2]],
      ],
      ['aa', ['.', 'aa'], undefined, [false, false, [0, 0]]],
      [
        'bb[0].cc',
        ['.', 'bb', '[]', ['.', 'cc']],
        undefined,
        [false, false, [0, 1]],
      ],
      [
        'myKey',
        [
          '.',
          'bb',
          '[]',
          ['.', 'ee', '[]', ['.', 'hh', '[]', ['.', 'ii', '.', 'dd']]],
        ],
        undefined,
        [true, false, [2, 3]],
      ],
    ]
    assert.deepEqual(parseTable(this.test.title), out)
  })

  // TODO: support expressions on TABLE
  it.skip(`{
      bb[*].dd,
      bb[].ee[*].dd,
      bb[].ee[].hh[*].dd(dd != ['dd3', 'dd16', 'dd19']).dd,
      myKey: bb[].ee[].hh[].ii.dd,
      aa,
      bb[].cc,
    }`, function () {
    const out = [
      [
        'bb[0].dd',
        ['.', 'bb', '[*]', ['.', 'dd']],
        undefined,
        [false, true, [0, 0]],
      ],
      [
        'bb[0].ee[0].dd',
        ['.', 'bb', '[]', ['.', 'ee', '[*]', ['.', 'dd']]],
        undefined,
        [false, true, [0, 1]],
      ],
      [
        'bb[0].ee[0].hh[0].dd',
        ['.', 'bb', '[]', ['.', 'ee', '[]', ['.', 'hh', '[*]', ['.', 'dd']]]],
        undefined,
        [false, true, [1, 2]],
      ],
      ['aa', ['.', 'aa'], undefined, [false, false, [0, 0]]],
      [
        'bb[0].cc',
        ['.', 'bb', '[]', ['.', 'cc']],
        undefined,
        [false, false, [0, 1]],
      ],
      [
        'myKey',
        [
          '.',
          'bb',
          '[]',
          ['.', 'ee', '[]', ['.', 'hh', '[]', ['.', 'ii', '.', 'dd']]],
        ],
        undefined,
        [true, false, [2, 3]],
      ],
    ]
    assert.deepEqual(parseTable(this.test.title), out)
  })
})
