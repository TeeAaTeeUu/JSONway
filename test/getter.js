import { assert } from 'chai'
import { parse as babelParse } from '@babel/parser'

import JSONway from '../index.js'
import getter from '../lib/getter.js'
import { _getJsonAsync, _readFile } from './_utils.js'

describe('getter', () => {
  it('a', function () {
    const object = { a: 'z' }
    assert.deepEqual(JSONway.get(object, this.test.title), 'z')
  })

  it('empty', () => {
    const object = 'zz'
    assert.deepEqual(JSONway.get(object, ''), 'zz')
  })

  it('a.b.c', function () {
    let object = { a: { d: { e: 'x' }, b: { c: 'z' } } }
    assert.deepEqual(JSONway.get(object, this.test.title), 'z')
    assert.isTrue(JSONway.has(object, this.test.title))
    assert.deepEqual(getter.getArrayIndexes(object, this.test.title), [
      'z',
      undefined,
    ])

    object = { a: { b: 'a' } }
    assert.deepEqual(JSONway.get(object, this.test.title), undefined)

    object = { a: { b: false } }
    assert.deepEqual(JSONway.get(object, this.test.title), undefined)
    assert.isFalse(JSONway.has(object, this.test.title))

    object = { a: { d: { e: 'x' }, b: { c: ['z', 'y'] } } }
    assert.deepEqual(JSONway.get(object, this.test.title), ['z', 'y'])
    assert.isTrue(JSONway.has(object, this.test.title))

    object = { a: { d: { e: 'x' }, b: { c: { z: 'y' } } } }
    assert.deepEqual(JSONway.get(object, this.test.title), { z: 'y' })
    assert.isTrue(JSONway.has(object, this.test.title))
  })

  it('a{b}', function () {
    const object = { a: { b: 'z', c: 'y' } }
    assert.deepEqual(JSONway.get(object, this.test.title), { b: 'z' })
  })

  it('a[1][0].b', function () {
    let object = { a: [1, [{ b: 'z' }]] }
    assert.deepEqual(JSONway.get(object, this.test.title), 'z')

    object = { a: [1] }
    assert.deepEqual(JSONway.get(object, this.test.title), undefined)
  })

  it('a[b.c][3][d.{}[e.[.f]', function () {
    const object = { a: { 'b.c': [1, 2, 3, { 'd.{}[e.[.f': 'z' }, 5] } }
    assert.deepEqual(JSONway.get(object, this.test.title), 'z')
  })

  it('a.b[1].c[d].7[0]', function () {
    const object = { a: { b: [1, { c: { d: { 7: ['z'] } } }] } }
    assert.deepEqual(JSONway.get(object, this.test.title), 'z')
  })

  it('0', function () {
    const object = ['bb', 'cc', 'dd']
    assert.deepEqual(JSONway.get(object, this.test.title), 'bb')
  })

  it('[].a', function () {
    const object = [{ a: 'x' }, { b: 'y' }, { a: 'z' }]
    assert.deepEqual(JSONway.get(object, this.test.title), ['x', 'z'])

    assert.deepEqual(getter.getArrayIndexes(object, this.test.title), [
      ['x', 'z'],
      [[0], [2]],
    ])
  })

  it('[:].a', function () {
    const object = [{ a: 'x' }, { b: 'y' }, { a: 'z' }]
    assert.deepEqual(JSONway.get(object, this.test.title), [
      'x',
      undefined,
      'z',
    ])
  })

  it('[]a', function () {
    const object = [{ a: 'x' }, { b: 'y' }, { a: 'z' }]
    assert.deepEqual(JSONway.get(object, this.test.title), ['x', 'z'])
  })

  it('[:]a', function () {
    const object = [{ a: 'x' }, { b: 'y' }, { a: 'z' }]
    assert.deepEqual(JSONway.get(object, this.test.title), [
      'x',
      undefined,
      'z',
    ])
  })

  it('[#].a', function () {
    const object = [{ a: 'x' }, { b: 'y' }, { a: 'z' }, { a: 'x' }]
    assert.deepEqual(JSONway.get(object, this.test.title), ['x', 'z'])

    assert.deepEqual(getter.getArrayIndexes(object, this.test.title), [
      ['x', 'z'],
      [[[0], [3]], [2]],
    ])
  })

  it('a[-1]', function () {
    let object = { a: [1, 2, 3] }
    assert.deepEqual(JSONway.get(object, this.test.title), 3)
    assert.deepEqual(getter.getArrayIndexes(object, this.test.title), [
      3,
      undefined,
    ])

    object = { a: [1, 2, { dd: 'z' }] }
    assert.deepEqual(JSONway.get(object, this.test.title), { dd: 'z' })

    object = { a: [] }
    assert.deepEqual(JSONway.get(object, this.test.title), undefined)
    assert.deepEqual(getter.getArrayIndexes(object, this.test.title), [
      undefined,
      undefined,
    ])
  })

  it('a[-2][-1][-1][].b', function () {
    let object = { a: [1, [[1, 2, [{ b: 'z' }]]], 3] }
    assert.deepEqual(JSONway.get(object, this.test.title), ['z'])
    assert.deepEqual(getter.getArrayIndexes(object, this.test.title), [
      ['z'],
      [[0]],
    ])

    object = { a: [[]] }
    assert.deepEqual(JSONway.get(object, this.test.title), undefined)
    assert.isFalse(JSONway.has(object, this.test.title))
  })

  it('a{b,c}', function () {
    const object = { a: { a: 'y', b: 'z', c: 'x' } }
    assert.deepEqual(JSONway.get(object, this.test.title), { b: 'z', c: 'x' })
  })

  it('a{b,c}.b', function () {
    const object = { a: { a: 'y', b: 'z', c: 'x' } }
    assert.deepEqual(JSONway.get(object, this.test.title), 'z')
    assert.isTrue(JSONway.has(object, this.test.title))
  })

  it('{a,b}', function () {
    const object = { c: 'y', a: 'z', b: 'x' }
    assert.deepEqual(JSONway.get(object, this.test.title), { a: 'z', b: 'x' })
  })

  it('a[]', function () {
    let object = { a: [1, 2, 3] }
    assert.deepEqual(JSONway.get(object, this.test.title), [1, 2, 3])

    object = { a: 'b' }
    assert.deepEqual(JSONway.get(object, this.test.title), [])

    object = { a: [1, { dd: 'z' }, 3] }
    assert.deepEqual(JSONway.get(object, this.test.title), [1, { dd: 'z' }, 3])
  })

  it('a[].c', function () {
    let object = {
      a: [
        { b: 'z', c: 'x' },
        { b: 'y', c: 'g' },
      ],
    }
    assert.deepEqual(JSONway.get(object, this.test.title), ['x', 'g'])

    object = { a: [{ b: 'z', c: 'x' }, null, undefined, { b: 'y', c: 'g' }] }
    assert.deepEqual(JSONway.get(object, this.test.title), ['x', 'g'])
  })

  it('a[].c.d', function () {
    let object = {
      a: [
        { b: 'z', c: { d: 10 } },
        { b: 'y', c: null },
        { b: 'a', c: 6 },
        { b: 'b', c: [5] },
        { b: 'b', c: { d: 'x' } },
      ],
    }
    assert.deepEqual(JSONway.get(object, this.test.title), [10, 'x'])
  })

  it('a[]{b,c}', function () {
    const object = {
      a: [
        { a: 'w', b: 'z', c: 'x' },
        { a: 'q', b: 'y', c: 'g' },
      ],
    }
    assert.deepEqual(JSONway.get(object, this.test.title), [
      { b: 'z', c: 'x' },
      { b: 'y', c: 'g' },
    ])
  })

  it('a[]{b.c,d[1]}', function () {
    const object = {
      a: [
        { b: { c: 'z' }, d: [1, 'x', 2] },
        { b: { c: 'y' }, d: [1, 'g', 2] },
      ],
    }
    assert.deepEqual(JSONway.get(object, this.test.title), [
      { 'b.c': 'z', 'd[1]': 'x' },
      { 'b.c': 'y', 'd[1]': 'g' },
    ])
  })

  it('a[][].b', function () {
    let object = { a: [[{ b: 'z' }]] }
    assert.deepEqual(JSONway.get(object, this.test.title), ['z'])

    object = {
      a: [
        [{ b: 'z' }, { b: 'x' }],
        [{ b: 'y' }, { b: 'g' }],
      ],
    }
    assert.deepEqual(JSONway.get(object, this.test.title), ['z', 'x', 'y', 'g'])
    assert.deepEqual(getter.getArrayIndexes(object, this.test.title), [
      ['z', 'x', 'y', 'g'],
      [
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1],
      ],
    ])

    assert.deepEqual(JSONway.get(object, 'a[:][:].b'), [
      ['z', 'x'],
      ['y', 'g'],
    ])
  })

  it('a[]{[b.b],c,d,e[0],j,[j.j],k}', function () {
    const object = {
      a: [
        { 'b.b': ['f'], c: ['11'] },
        { 'b.b': 'g', d: '21' },
        { 'b.b': ['k'], j: ['31'], 'j.j': ['41'] },
        { 'b.b': ['h'], k: ['51'], j: ['61'] },
        { 'b.b': 'i', e: ['71'] },
      ],
    }

    let out = [
      { '[b.b]': ['f'], c: ['11'] },
      { '[b.b]': 'g', d: '21' },
      { '[b.b]': ['k'], j: ['31'], '[j.j]': ['41'] },
      { '[b.b]': ['h'], j: ['61'], k: ['51'] },
      { '[b.b]': 'i', 'e[0]': '71' },
    ]

    assert.deepEqual(JSONway.get(object, this.test.title), out)
  })

  it('aa.bb[:].cc[]{dd,ee}', function () {
    const object = {
      aa: {
        bb: [
          { cc: [{ dd: '11', ee: 'a', ff: 'z' }] },
          {
            cc: [
              { dd: '21', ee: 'b', ff: 'y' },
              { ff: 'x', dd: '31', ee: 'c' },
              { dd: '41', ff: 'w', ee: 'd' },
            ],
          },
          { cc: [{ dd: '51', ee: 'e', ff: 'v' }] },
          {
            cc: [
              { dd: '61', ee: 'g', ff: 'u' },
              { dd: '71', ee: 'h', ff: 't' },
              { dd: '81', ee: 'i', ff: 's' },
            ],
          },
        ],
      },
    }

    let out = [
      [{ dd: '11', ee: 'a' }],
      [
        { dd: '21', ee: 'b' },
        { dd: '31', ee: 'c' },
        { dd: '41', ee: 'd' },
      ],
      [{ dd: '51', ee: 'e' }],
      [
        { dd: '61', ee: 'g' },
        { dd: '71', ee: 'h' },
        { dd: '81', ee: 'i' },
      ],
    ]

    assert.deepEqual(JSONway.get(object, this.test.title), out)
  })

  it('a{:}', function () {
    let object = { a: { b: 'z', c: 'y' } }
    let out = { b: 'z', c: 'y' }
    assert.deepEqual(JSONway.get(object, this.test.title), out)

    object = { a: { b: { c: { d: 'z', e: 'y' } } } }
    out = { 'b.c{d,e}': ['z', 'y'] }
    assert.deepEqual(JSONway.get(object, this.test.title), out)

    object = { a: { b: { c: ['z', 3, { d: 'aa' }, true], e: null, f: 'y' } } }
    out = {
      'b.c[0]': 'z',
      'b.c[1]': 3,
      'b.c[2].d': 'aa',
      'b.c[3]': true,
      'b.e': null,
      'b.f': 'y',
    }
    assert.deepEqual(JSONway.get(object, this.test.title), out)
    assert.isTrue(JSONway.has(object, this.test.title))
  })

  it(`a[](c='y').b`, function () {
    const object = {
      a: [
        { b: 2, c: 'x' },
        { b: 4, c: 'y' },
        { b: 6, c: 'z' },
      ],
    }
    assert.deepEqual(JSONway.get(object, this.test.title), [4])
  })

  it(`a[](c[0].e='xx').b`, function () {
    const object = {
      a: [{ b: 2, c: [{ e: 'xx' }, {}] }, { c: 'y' }, { c: 'z' }],
    }
    assert.deepEqual(JSONway.get(object, this.test.title), [2])
    assert.isTrue(JSONway.has(object, this.test.title))
  })

  it(`a(c='y').b`, function () {
    let object = { a: { b: 'x', c: 'y' } }
    assert.deepEqual(JSONway.get(object, this.test.title), 'x')
    assert.isTrue(JSONway.has(object, this.test.title))

    object = { a: { b: 'x', c: 'z' } }
    assert.deepEqual(JSONway.get(object, this.test.title), undefined)
    assert.isFalse(JSONway.has(object, this.test.title))
  })

  it(`(aa='yy').b`, function () {
    let object = { aa: 'yy', b: 'x' }
    assert.deepEqual(JSONway.get(object, this.test.title), 'x')

    object = { aa: 'yyx', b: 'x' }
    assert.deepEqual(JSONway.get(object, this.test.title), undefined)
  })

  it('(aa=34).b', function () {
    let object = { aa: 34, b: 'x' }
    assert.deepEqual(JSONway.get(object, this.test.title), 'x')

    object = { aa: '34', b: 'x' }
    assert.deepEqual(JSONway.get(object, this.test.title), undefined)
  })

  it(`a(c='y'){b,d}`, function () {
    let object = { a: { b: 'x', c: 'y', d: 'z' } }
    assert.deepEqual(JSONway.get(object, this.test.title), { b: 'x', d: 'z' })
    assert.deepEqual(getter.getArrayIndexes(object, this.test.title), [
      { b: 'x', d: 'z' },
      undefined,
    ])

    object = { a: { b: 'x', c: 'z' } }
    assert.deepEqual(JSONway.get(object, this.test.title), undefined)
    assert.deepEqual(getter.getArrayIndexes(object, this.test.title), [
      undefined,
      undefined,
    ])
  })

  it(`a(c='y')(d='g'){b,d}`, function () {
    let object = { a: { b: 'x', c: 'y', d: 'g' } }
    assert.deepEqual(JSONway.get(object, this.test.title), { b: 'x', d: 'g' })

    object = { a: { b: 'x', c: 'z', d: 'g' } }
    assert.deepEqual(JSONway.get(object, this.test.title), undefined)

    object = { a: { b: 'x', c: 'y', d: 'y' } }
    assert.deepEqual(JSONway.get(object, this.test.title), undefined)
  })

  it(`(aa~='yy').b`, function () {
    let object = { aa: 'yy', b: 'x' }
    assert.deepEqual(JSONway.get(object, this.test.title), 'x')

    object = { aa: 'yyx', b: 'x' }
    assert.deepEqual(JSONway.get(object, this.test.title), 'x')
  })

  // TODO: this kinda works, but possibly through a wrong expression-path
  it(`a[](.[0]='xx')[1]`, function () {
    let object = {
      a: [
        ['yy', 'aa'],
        ['xx', 'bb'],
        ['yy', 'cc'],
      ],
    }
    assert.deepEqual(JSONway.get(object, this.test.title), ['bb'])

    object = {
      a: [
        ['yy', 'aa'],
        ['xx', 'bb'],
        ['xx', 'cc'],
      ],
    }
    assert.deepEqual(JSONway.get(object, this.test.title), ['bb', 'cc'])
    assert.deepEqual(getter.getArrayIndexes(object, this.test.title), [
      ['bb', 'cc'],
      [[1], [2]],
    ])
  })

  it(`a[](='xx')`, function () {
    const object = { a: ['yy', 'xx', 'zz', 'xx', 'yy'] }
    assert.deepEqual(JSONway.get(object, this.test.title), ['xx', 'xx'])
  })

  it('a[](c?).b', function () {
    const object = {
      a: [{ b: 2 }, { b: 4, c: 'y' }, { b: 6, c: 'z' }, { b: 8 }],
    }
    assert.deepEqual(JSONway.get(object, this.test.title), [4, 6])
    assert.isTrue(JSONway.has(object, this.test.title))
  })

  it(`a[](c!='y').b`, function () {
    const object = {
      a: [
        { b: 2, c: 'x' },
        { b: 4, c: 'y' },
        { b: 6, c: 'z' },
      ],
    }
    assert.deepEqual(JSONway.get(object, this.test.title), [2, 6])
    assert.deepEqual(getter.getArrayIndexes(object, this.test.title), [
      [2, 6],
      [[0], [2]],
    ])
  })

  it(`a[](c~='yx').b`, function () {
    const object = {
      a: [
        { b: 2, c: 'xyxz' },
        { b: 4, c: 'xxxz' },
      ],
    }
    assert.deepEqual(JSONway.get(object, this.test.title), [2])
  })

  it('a[](c~=5).b', function () {
    let object = {
      a: [
        { b: 2, c: 53 },
        { b: 4, c: 63 },
      ],
    }
    assert.deepEqual(JSONway.get(object, this.test.title), [2])

    object = {
      a: [
        { b: 2, c: 43 },
        { b: 4, c: 63 },
      ],
    }
    assert.deepEqual(JSONway.get(object, this.test.title), [])
  })

  it('a[](c>55).b', function () {
    const object = {
      a: [
        { b: 2, c: 53 },
        { b: 4, c: 55 },
        { b: 6, c: 63 },
      ],
    }
    assert.deepEqual(JSONway.get(object, this.test.title), [6])
  })

  it(`a[](c>'dd').b`, function () {
    const object = {
      a: [
        { b: 2, c: 'da' },
        { b: 4, c: 'dd' },
        { b: 6, c: 'de' },
        { b: 8, c: 'fd' },
      ],
    }
    assert.deepEqual(JSONway.get(object, this.test.title), [6, 8])
  })

  it('a[](c>=55).b', function () {
    const object = {
      a: [
        { b: 2, c: 53 },
        { b: 4, c: 55 },
        { b: 6, c: 63 },
      ],
    }
    assert.deepEqual(JSONway.get(object, this.test.title), [4, 6])
  })

  it(`a[](c>='dd').b`, function () {
    const object = {
      a: [
        { b: 2, c: 'da' },
        { b: 4, c: 'dd' },
        { b: 6, c: 'de' },
        { b: 8, c: 'fd' },
      ],
    }
    assert.deepEqual(JSONway.get(object, this.test.title), [4, 6, 8])
  })

  it('a[](c<55).b', function () {
    const object = {
      a: [
        { b: 2, c: 53 },
        { b: 4, c: 55 },
        { b: 6, c: 63 },
      ],
    }
    assert.deepEqual(JSONway.get(object, this.test.title), [2])
  })

  it(`a[](c<'dd').b`, function () {
    const object = {
      a: [
        { b: 2, c: 'da' },
        { b: 4, c: 'dd' },
        { b: 6, c: 'de' },
        { b: 8, c: 'fd' },
      ],
    }
    assert.deepEqual(JSONway.get(object, this.test.title), [2])
  })

  it('a[](c<=55).b', function () {
    const object = {
      a: [
        { b: 2, c: 53 },
        { b: 4, c: 55 },
        { b: 6, c: 63 },
      ],
    }
    assert.deepEqual(JSONway.get(object, this.test.title), [2, 4])
  })

  it(`a[](c<='dd').b`, function () {
    const object = {
      a: [
        { b: 2, c: 'da' },
        { b: 4, c: 'dd' },
        { b: 6, c: 'de' },
        { b: 8, c: 'fd' },
      ],
    }
    assert.deepEqual(JSONway.get(object, this.test.title), [2, 4])
  })

  it('[](a?).a', function () {
    const object = [{ a: 'x' }, { b: 'y' }, { a: 'z' }]
    assert.deepEqual(JSONway.get(object, this.test.title), ['x', 'z'])
  })

  it(`a[](c='y')(d='b').b`, function () {
    const object = {
      a: [
        { b: 2, c: 'x', d: 'a' },
        { b: 4, c: 'y', d: 'b' },
        { b: 6, c: 'z', d: 'c' },
      ],
    }
    assert.deepEqual(JSONway.get(object, this.test.title), [4])
  })

  it(`a[](c[].d='a2').b`, function () {
    const object = {
      a: [
        { b: 2, c: [{ d: 'a1' }, { d: 'b1' }] },
        { b: 4, c: [{ d: 'a2' }, { d: 'b2' }] },
        { b: 6, c: [{ d: 'a3' }, { d: 'b3' }] },
      ],
    }
    assert.deepEqual(JSONway.get(object, this.test.title), [4])
  })

  it('a[0,2].b', function () {
    const object = { a: [{ b: 'z' }, { c: 'x' }, { b: 'y' }] }
    assert.deepEqual(JSONway.get(object, this.test.title), ['z', 'y'])
  })

  it('a[1,0].b', function () {
    const object = { a: [{ b: 'z' }, { c: 'x' }, { b: 'y' }] }
    assert.deepEqual(JSONway.get(object, this.test.title), [undefined, 'z'])
  })

  it(`a[](cc='yy'&&dd!='x').dd`, function () {
    const object = {
      a: [
        { dd: 'x', cc: 'yy' },
        { dd: 4, cc: 'yy' },
        { dd: 5, cc: 'z' },
      ],
    }
    assert.deepEqual(JSONway.get(object, this.test.title), [4])
  })

  it('nested-list-response.json bb[].ee[].hh[].dd', async function () {
    const object = await _getJsonAsync('./fixtures/nested-list-response.json')
    let path = 'bb[:].ee[:].hh[].dd'
    let out = [
      [
        ['dd3', 'dd5'],
        ['dd8', 'dd10'],
      ],
      [
        ['dd14', 'dd16'],
        ['dd19', 'dd21'],
      ],
    ]

    assert.deepEqual(JSONway.get(object, path), out)
    assert.isTrue(JSONway.has(object, path))

    path = 'bb[].ee[].hh[].dd'
    out = ['dd3', 'dd5', 'dd8', 'dd10', 'dd14', 'dd16', 'dd19', 'dd21']

    assert.deepEqual(JSONway.get(object, path), out)
    assert.isTrue(JSONway.has(object, path))
    assert.deepEqual(getter.getArrayIndexes(object, path), [
      out,
      [
        [0, 0, 0],
        [0, 0, 1],
        [0, 1, 0],
        [0, 1, 1],
        [1, 0, 0],
        [1, 0, 1],
        [1, 1, 0],
        [1, 1, 1],
      ],
    ])
  })

  it('nested-list-response.json bb[].ee[].cc', async function () {
    const object = await _getJsonAsync('./fixtures/nested-list-response.json')
    const path = 'bb[:].ee[].cc'
    const out = [
      ['cc2', 'cc7'],
      ['cc13', 'cc18'],
    ]

    assert.deepEqual(JSONway.get(object, path), out)
    assert.deepEqual(getter.getArrayIndexes(object, path), [
      out,
      [
        [
          [0, 0],
          [0, 1],
        ],
        [
          [1, 0],
          [1, 1],
        ],
      ],
    ])
  })

  it('nested-list-response.json bb[].dd', async function () {
    const object = await _getJsonAsync('./fixtures/nested-list-response.json')
    const path = 'bb[].dd'
    const out = ['dd1', 'dd12']

    assert.deepEqual(JSONway.get(object, path), out)
    assert.isTrue(JSONway.has(object, path))
  })

  it('nested-list-response.json bb[].ee[].ff[].gg[]', async function () {
    const object = await _getJsonAsync('./fixtures/nested-list-response.json')
    let path = 'bb[].ee[].ff[].gg[]'
    let out = ['01', '11', '02', '12', '03', '13', '04', '14']

    assert.deepEqual(JSONway.get(object, path), out)

    out = [
      ['01', '11', '02', '12', '03', '13', '04', '14'],
      [
        [0, 0, 0, 0],
        [0, 0, 0, 1],
        [0, 0, 1, 0],
        [0, 0, 1, 1],
        [0, 1, 0, 0],
        [0, 1, 0, 1],
        [1, 1, 0, 0],
        [1, 1, 0, 1],
      ],
    ]
    assert.deepEqual(getter.getArrayIndexes(object, path), out)

    path = 'bb[].ee[].ff[:].gg[]'
    out = [
      ['01', '11'],
      ['02', '12'],
      ['03', '13'],
      ['04', '14'],
    ]

    assert.deepEqual(JSONway.get(object, path), out)

    out = [
      [
        ['01', '11'],
        ['02', '12'],
        ['03', '13'],
        ['04', '14'],
      ],
      [
        [
          [0, 0, 0, 0],
          [0, 0, 0, 1],
        ],
        [
          [0, 0, 1, 0],
          [0, 0, 1, 1],
        ],
        [
          [0, 1, 0, 0],
          [0, 1, 0, 1],
        ],
        [
          [1, 1, 0, 0],
          [1, 1, 0, 1],
        ],
      ],
    ]

    assert.deepEqual(getter.getArrayIndexes(object, path), out)
  })

  it('testing', async function () {
    const object = babelParse(await _readFile('./setter.js', 'utf8'), {
      sourceType: 'module',
    })

    const path = `
      program.body[]
        .expression(callee.name = 'describe')
        .arguments[](type = 'ArrowFunctionExpression')
        .body.body[](
          expression.callee.name = 'it' &&
          expression.arguments[0].type = [
            'TemplateLiteral',
            'StringLiteral',
          ]
        )
        .expression.arguments{
          path: [0].value,
          path: [0].quasis[0].value.cooked,
          type: [1].body.body[0].type,
        }
    ` // TODO: check if empty when with tabletizer syntax

    const out = { path: '{a}', type: 'VariableDeclaration' }

    assert.deepEqual(JSONway.get(object, path)[3], out)

    const javascriptVersion = object.program.body
      .map(body1 => body1.expression)
      .filter(expression => expression?.callee?.name === 'describe')
      .flatMap(expression => expression.arguments)
      .filter(argument => argument?.type === 'ArrowFunctionExpression')
      .flatMap(expression => expression.body?.body)
      .filter(
        body =>
          body.expression.callee.name === 'it' &&
          ['TemplateLiteral', 'StringLiteral'].includes(
            body.expression.arguments[0].type,
          ),
      )
      .map(body => body.expression?.arguments)
      .map(expressionArguments => ({
        path:
          expressionArguments[0]?.value ||
          expressionArguments[0]?.quasis[0]?.value?.cooked,
        type: expressionArguments[1]?.body?.body[0]?.type,
      }))

    assert.deepEqual(JSONway.get(object, path), javascriptVersion)
  })

  it('nested-list-response.json aa', async function () {
    const object = await _getJsonAsync('./fixtures/nested-list-response.json')
    const path = 'aa'
    const out = 'aa1'

    assert.deepEqual(JSONway.get(object, path), out)
    assert.isTrue(JSONway.has(object, path))
  })
})
