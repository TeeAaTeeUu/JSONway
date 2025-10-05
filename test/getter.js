import { assert } from 'chai'
import { parse as babelParse } from '@babel/parser'

import JSONway from '../index.js'
import { getArrayIndexes } from '../lib/getter.js'
import { _getJsonAsync, _readFile } from './_utils.js'

describe('getter', () => {
  it('a', function () {
    const object = { a: 'z' }
    assert.deepEqual(JSONway.get(object, this.test.title), 'z')
  })

  it('empty', () => {
    const object = 'zz'
    assert.deepEqual(JSONway.get(object, ''), 'zz')
    assert.isUndefined(JSONway.get(undefined, 'aa.bb'))

    assert.deepEqual(getArrayIndexes(object, ''), ['zz', undefined])
    assert.isUndefined(getArrayIndexes(undefined, 'aa.bb'))
  })

  it('a.b.c', function () {
    let object = { a: { d: { e: 'x' }, b: { c: 'z' } } }
    assert.deepEqual(JSONway.get(object, this.test.title), 'z')
    assert.isTrue(JSONway.has(object, this.test.title))
    assert.deepEqual(getArrayIndexes(object, this.test.title), ['z', undefined])

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
    const object = { a: { 'b.c': [1, 2, 3, { 'd.{}[e.[.f]': 'z' }, 5] } }
    assert.deepEqual(JSONway.get(object, this.test.title), 'z')
  })

  it('a.7', function () {
    const object = { a: { 7: 'b' } }
    assert.isUndefined(JSONway.get(object, this.test.title))
  })

  it(`a.b[1].c[d]['7'][0]`, function () {
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

    assert.deepEqual(getArrayIndexes(object, this.test.title), [
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

    assert.deepEqual(getArrayIndexes(object, this.test.title), [
      ['x', 'z'],
      [[[0], [3]], [2]],
    ])
  })

  it('[#].a[0,2]', function () {
    const object = [
      { a: ['x', 'a', 'z'] },
      { b: 'y' },
      { a: ['x'] },
      { a: ['x', 'b', 'z'] },
    ]
    assert.deepEqual(JSONway.get(object, this.test.title), [
      ['x', 'z'],
      ['x', undefined],
    ])

    assert.deepEqual(getArrayIndexes(object, this.test.title), [
      [
        ['x', 'z'],
        ['x', undefined],
      ],
      [
        [
          [0, 0],
          [2, 0],
        ],
        [0, 2],
      ],
    ])
  })

  it('[#][#]', function () {
    const object = [
      ['a', 'b', 'c'],
      ['a', 'c', 'd'],
    ]

    assert.deepEqual(JSONway.get(object, this.test.title), ['a', 'b', 'c', 'd'])

    assert.deepEqual(getArrayIndexes(object, this.test.title), [
      ['a', 'b', 'c', 'd'],
      [
        [
          [0, 0],
          [1, 0],
        ],
        [0, 1],
        [
          [0, 2],
          [1, 1],
        ],
        [1, 2],
      ],
    ])
  })

  it('a[-1]', function () {
    let object = { a: [1, 2, 3] }
    assert.deepEqual(JSONway.get(object, this.test.title), 3)
    assert.deepEqual(getArrayIndexes(object, this.test.title), [3, undefined])

    object = { a: [1, 2, { dd: 'z' }] }
    assert.deepEqual(JSONway.get(object, this.test.title), { dd: 'z' })

    object = { a: [] }
    assert.deepEqual(JSONway.get(object, this.test.title), undefined)
    assert.deepEqual(getArrayIndexes(object, this.test.title), [
      undefined,
      undefined,
    ])

    object = { a: { b: [] } }
    assert.deepEqual(JSONway.get(object, this.test.title), undefined)
    assert.deepEqual(getArrayIndexes(object, this.test.title), [
      undefined,
      undefined,
    ])
  })

  it('a[-2][-1][-1][].b', function () {
    let object = { a: [1, [[1, 2, [{ b: 'z' }]]], 3] }
    assert.deepEqual(JSONway.get(object, this.test.title), ['z'])
    assert.deepEqual(getArrayIndexes(object, this.test.title), [['z'], [[0]]])

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
    assert.isUndefined(JSONway.get(object, this.test.title))
    assert.isFalse(JSONway.has(object, this.test.title))

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

  it(`a[]{b.c(!= 'z'), d[1]}`, function () {
    const object = {
      a: [
        { b: { c: 'z' }, d: [1, 'x', 2] },
        { b: { c: 'y' }, d: [1, 'g', 2] },
      ],
    }
    assert.deepEqual(JSONway.get(object, this.test.title), [
      { 'd[1]': 'x' },
      { "b.c(!= 'z')": 'y', 'd[1]': 'g' },
    ])
  })

  it(`a[]{b.c: b.c(!= 'z'), d[1]}`, function () {
    const object = {
      a: [
        { b: { c: 'z' }, d: [1, 'x', 2] },
        { b: { c: 'y' }, d: [1, 'g', 2] },
      ],
    }
    assert.deepEqual(JSONway.get(object, this.test.title), [
      { 'd[1]': 'x' },
      { 'b.c': 'y', 'd[1]': 'g' },
    ])
  })

  it(`a[](b.c != 'z'){b.c, d[1]}`, function () {
    const object = {
      a: [
        { b: { c: 'z' }, d: [1, 'x', 2] },
        { b: { c: 'y' }, d: [1, 'g', 2] },
      ],
    }
    assert.deepEqual(JSONway.get(object, this.test.title), [
      { 'b.c': 'y', 'd[1]': 'g' },
    ])
  })

  it(`a[]{x: b.c = 'x', d[1]=5}`, function () {
    const object = {
      a: [
        { b: { c: 'z' }, d: [1, 'x', 2] },
        { b: { c: 'y' }, d: [1] },
      ],
    }
    assert.deepEqual(JSONway.get(object, this.test.title), [
      { x: 'z', 'd[1]': 'x' },
      { x: 'y', 'd[1]': 5 },
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
    assert.deepEqual(getArrayIndexes(object, this.test.title), [
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

  it('bar[:#].foo[].id', function () {
    const object = {
      bar: [
        { foo: [{ id: 'aa' }] },
        { foo: [{ id: 'bb' }] },
        { foo: [{ id: 'bb' }] },
        { foo: [{ id: 'cc' }] },
      ],
    }
    assert.deepEqual(JSONway.get(object, this.test.title), [
      ['aa'],
      ['bb'],
      ['cc'],
    ])
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

  it('(aa ?| bb |? cc ?? 15)', function () {
    let object = { bb: 'x' }
    assert.deepEqual(JSONway.get(object, this.test.title), 'x')

    object = { aa: 34, bb: 'x' }
    assert.deepEqual(JSONway.get(object, this.test.title), 34)

    object = { aa: undefined }
    assert.deepEqual(JSONway.get(object, this.test.title), 15)
  })

  it('( aa ?| bb )', function () {
    let object = { bb: 'x' }
    assert.deepEqual(JSONway.get(object, this.test.title), 'x')

    object = { aa: 34, bb: 'x' }
    assert.deepEqual(JSONway.get(object, this.test.title), 34)

    object = {}
    assert.isUndefined(JSONway.get(object, this.test.title))
  })

  it('[aa, bb](?)', function () {
    let object = { aa: false, bb: 'x' }
    assert.deepEqual(JSONway.get(object, this.test.title), ['x'])

    object = { aa: 34, bb: 'x', cc: 'y' }
    assert.deepEqual(JSONway.get(object, this.test.title), [34, 'x'])
  })

  it('[aa, bb][|0](?)', function () {
    let object = { aa: false, bb: 'x' }
    assert.deepEqual(JSONway.get(object, this.test.title), 'x')

    object = { aa: 34, bb: 'x', cc: 'y' }
    assert.deepEqual(JSONway.get(object, this.test.title), 34)

    object = { aa: 0, bb: 'x', cc: 'y' }
    assert.deepEqual(JSONway.get(object, this.test.title), 'x')
  })

  it('[aa, bb, cc](>=10) |> round', function () {
    let object = { aa: 0, bb: 10.4, cc: 20.7 }
    assert.deepEqual(JSONway.get(object, this.test.title), [10, 21])

    object = { aa: 34.1, bb: 'x', cc: 'y' }
    assert.deepEqual(JSONway.get(object, this.test.title), [34])
  })

  it('[aa, bb, cc](i>=10).i |> round', function () {
    let object = { aa: { i: 0 }, bb: { i: 10.4 }, cc: { i: 20.7 } }
    assert.deepEqual(JSONway.get(object, this.test.title), [10, 21])

    object = { aa: { i: 34.1 }, bb: { i: 'x' }, cc: { i: 'y' } }
    assert.deepEqual(JSONway.get(object, this.test.title), [34])
  })

  it('aa[# |> size].bb', function () {
    let object = { aa: [{ bb: 5 }, { bb: 6 }, { bb: 7 }] }
    assert.deepEqual(JSONway.get(object, this.test.title), 3)

    object = { aa: [{ bb: 5 }, { bb: 6 }, { bb: 5 }] }
    assert.deepEqual(JSONway.get(object, this.test.title), 2)
  })

  it('[aa, bb(i < 10), cc].i', function () {
    let object = { aa: { i: 0 }, bb: { i: 10.4 }, cc: { i: 20.7 } }
    assert.deepEqual(JSONway.get(object, this.test.title), [0, 20.7])

    object = { aa: { i: 34.1 }, bb: { i: 'x' }, cc: { i: 'y' } }
    assert.deepEqual(JSONway.get(object, this.test.title), [34.1, 'y'])

    object = { aa: { i: 34.1 }, bb: { i: 7 }, cc: { i: 'y' } }
    assert.deepEqual(JSONway.get(object, this.test.title), [34.1, 7, 'y'])
  })

  it(`a(c='y'){b,d}`, function () {
    let object = { a: { b: 'x', c: 'y', d: 'z' } }
    assert.deepEqual(JSONway.get(object, this.test.title), { b: 'x', d: 'z' })
    assert.deepEqual(getArrayIndexes(object, this.test.title), [
      { b: 'x', d: 'z' },
      undefined,
    ])

    object = { a: { b: 'x', c: 'z' } }
    assert.deepEqual(JSONway.get(object, this.test.title), undefined)
    assert.deepEqual(getArrayIndexes(object, this.test.title), [
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

  it(`a[]([0]='xx')[1]`, function () {
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
    assert.deepEqual(getArrayIndexes(object, this.test.title), [
      ['bb', 'cc'],
      [[1], [2]],
    ])
  })

  it(`a[](='xx')`, function () {
    const object = { a: ['yy', 'xx', 'zz', 'xx', 'yy'] }
    assert.deepEqual(JSONway.get(object, this.test.title), ['xx', 'xx'])
  })

  it(`a[](>15)`, function () {
    const object = { a: [5, 17, 15, 3, 100] }
    assert.deepEqual(JSONway.get(object, this.test.title), [17, 100])
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
    assert.deepEqual(getArrayIndexes(object, this.test.title), [
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

    assert.deepEqual(getArrayIndexes(object, this.test.title), [
      ['z', 'y'],
      [[0], [2]],
    ])
  })

  it('a[0,2,-1]', function () {
    const object = { a: ['a', 'b', 'c', 'd', 'e', 'f'] }
    assert.deepEqual(JSONway.get(object, this.test.title), ['a', 'c', 'f'])

    assert.deepEqual(getArrayIndexes(object, this.test.title), [
      ['a', 'c', 'f'],
      [[0], [2], [5]],
    ])
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

  it(`a[{ b, c: c[*].d, f: c[].f }](b=c).f`, function () {
    const object = {
      a: {
        b: 'x',
        c: [
          { f: 'd1', d: 'z' },
          { f: 'd2', d: 'x' },
          { f: 'd3', d: 'y' },
        ],
      },
    }
    assert.deepEqual(JSONway.get(object, this.test.title), ['d2'])
  })

  it(`a[{ b, c: c[*].d, f: c[].f }].0`, function () {
    const object = {
      a: {
        b: 'x',
        c: [
          { f: 'd1', d: 'z' },
          { f: 'd2', d: 'x' },
          { f: 'd3', d: 'y' },
        ],
      },
    }

    const out = { c: 'z', b: 'x', f: 'd1' }

    assert.deepEqual(JSONway.get(object, this.test.title), out)
  })

  it('a[**].z', function () {
    let object = { a: { b: { c: { z: 'foo', x: 'bar' }, d: { z: 'baz' } } } }
    assert.deepEqual(JSONway.get(object, this.test.title), ['foo', 'baz'])

    object = {
      a: { b: [{ c: { z: 'foo' } }, 10, null, [false, { z: 'baz' }]] },
    }
    assert.deepEqual(JSONway.get(object, this.test.title), ['foo', 'baz'])

    object = { a: 'foo, baz' }
    assert.isUndefined(JSONway.get(object, this.test.title))
  })

  it('a.**.z', function () {
    const object = { a: { b: { c: { z: 'foo', x: 'bar' }, d: { z: 'baz' } } } }
    assert.deepEqual(JSONway.get(object, this.test.title), ['foo', 'baz'])
  })

  // TODO: support other deep value types
  it('a[**](>10)', function () {
    const object = { a: { b: { c: { z: 5, x: 11 }, d: { z: 'baz' } } } }
    assert.deepEqual(JSONway.get(object, this.test.title), []) // [11]
  })

  it('a[1:3]', function () {
    let object = { a: ['b', 'c', 'd', 'e', 'f'] }
    assert.deepEqual(JSONway.get(object, this.test.title), ['c', 'd'])

    object = { a: ['b', 'c'] }
    assert.deepEqual(JSONway.get(object, this.test.title), ['c'])

    object = { a: ['b'] }
    assert.deepEqual(JSONway.get(object, this.test.title), [])

    object = { a: [] }
    assert.deepEqual(JSONway.get(object, this.test.title), [])
  })

  it('a[:3]', function () {
    const object = { a: ['b', 'c', 'd', 'e', 'f'] }
    assert.deepEqual(JSONway.get(object, this.test.title), ['b', 'c', 'd'])
  })

  it('a[** |> 0].z', function () {
    const object = { a: { b: { c: { z: 'foo', x: 'bar' }, d: { z: 'baz' } } } }
    assert.deepEqual(JSONway.get(object, this.test.title), 'foo')
  })

  it('a[** |> 1].z', function () {
    const object = { a: { b: { c: { z: 'foo', x: 'bar' }, d: { z: 'baz' } } } }
    assert.deepEqual(JSONway.get(object, this.test.title), 'baz')
  })

  it('a[** |> [:1]].z', function () {
    const object = { a: { b: { c: { z: 'foo', x: 'bar' }, d: { z: 'baz' } } } }
    assert.deepEqual(JSONway.get(object, this.test.title), ['foo'])
  })

  it('a[|> sort.reverse]', function () {
    const object = { a: [5, 8, 2, 6, 8, -4, -2, 11, 15] }

    assert.deepEqual(
      JSONway.get(object, this.test.title),
      [15, 11, 8, 8, 6, 5, 2, -2, -4],
    )
  })

  it('a[** |> [1:]].z', function () {
    const object = { a: { b: { c: { z: 'foo', x: 'bar' }, d: { z: 'baz' } } } }
    assert.deepEqual(JSONway.get(object, this.test.title), ['baz'])
  })

  it('a[** |> [-2:]].z', function () {
    const object = { a: { b: { c: { z: 'foo', x: 'bar' }, d: { z: 'baz' } } } }
    assert.deepEqual(JSONway.get(object, this.test.title), ['foo', 'baz'])
  })

  it('a[** |> size].z', function () {
    const object = { a: { b: { c: { z: 'foo', x: 'bar' }, d: { z: 'baz' } } } }
    assert.deepEqual(JSONway.get(object, this.test.title), 2)
  })

  it('a.b |> split._.5', function () {
    const object = { a: { b: 'a_b_c_d_e_f_g_h' } }
    assert.deepEqual(JSONway.get(object, this.test.title), 'f')
  })

  it('a[3:]', function () {
    const object = { a: ['b', 'c', 'd', 'e', 'f'] }
    assert.deepEqual(JSONway.get(object, this.test.title), ['e', 'f'])
  })

  it('a[:-2]', function () {
    const object = { a: ['b', 'c', 'd', 'e', 'f'] }
    assert.deepEqual(JSONway.get(object, this.test.title), ['b', 'c', 'd'])
  })

  it('a[-2:]', function () {
    const object = { a: ['b', 'c', 'd', 'e', 'f'] }
    assert.deepEqual(JSONway.get(object, this.test.title), ['e', 'f'])
  })

  it('a[-3::2]', function () {
    const object = { a: ['b', 'c', 'd', 'e', 'f'] }
    assert.deepEqual(JSONway.get(object, this.test.title), ['d', 'f'])
  })

  it('a[:]', function () {
    const object = { a: ['b', 'c', 'd', 'e', 'f'] }
    assert.deepEqual(JSONway.get(object, this.test.title), [
      'b',
      'c',
      'd',
      'e',
      'f',
    ])
  })

  it('a[1:3:2]', function () {
    const object = { a: ['b', 'c', 'd', 'e', 'f'] }
    assert.deepEqual(JSONway.get(object, this.test.title), ['c'])
  })

  it('a[1:4:2]', function () {
    const object = { a: ['b', 'c', 'd', 'e', 'f'] }
    assert.deepEqual(JSONway.get(object, this.test.title), ['c', 'e'])
  })

  it('a[0,2,[2]]', function () {
    const object = { a: [true, { b: 'x' }, 'y'] }
    assert.deepEqual(JSONway.get(object, this.test.title), [0, 2, 'y'])
  })

  it('a[0,2,a,[2]].b', function () {
    const object = { a: [true, { b: 'x' }, { b: 'y' }] }
    assert.deepEqual(JSONway.get(object, this.test.title), ['y'])
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
    assert.deepEqual(getArrayIndexes(object, path), [
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
    assert.deepEqual(getArrayIndexes(object, path), [
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
    assert.deepEqual(getArrayIndexes(object, path), out)

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

    assert.deepEqual(getArrayIndexes(object, path), out)
  })

  it('testing longer format with new lines and spaces', async function () {
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
