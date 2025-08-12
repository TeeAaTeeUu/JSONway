import { assert } from 'chai'
import { _getJsonAsync } from './_utils.js'

import JSONway from '../index.js'

describe('setter', () => {
  it('a', function () {
    let out = { a: 'z' }
    assert.deepEqual(JSONway.set({}, this.test.title, 'z'), out)

    let object = { b: 'x' }
    out = { b: 'x', a: 'z' }
    assert.deepEqual(JSONway.set(object, this.test.title, 'z'), out)

    object = { a: 'x' }
    out = { a: 'z' }
    assert.deepEqual(JSONway.set(object, this.test.title, 'z'), out)

    object = { a: ['x'] }
    out = { a: 'z' }
    assert.deepEqual(JSONway.set(object, this.test.title, 'z'), out)

    assert.doesNotThrow(() => JSONway.set({}, this.test.title, 'z'))
    assert.throws(() => JSONway.set([], this.test.title, 'z'))
  })

  it('[2]', function () {
    let out = [undefined, undefined, 'z']
    assert.deepEqual(JSONway.set([], this.test.title, 'z'), out)

    out = [3, 5, 'z', 8]
    assert.deepEqual(JSONway.set([3, 5, 7, 8], this.test.title, 'z'), out)

    assert.doesNotThrow(() => JSONway.set([], this.test.title, 'z'))
    assert.throws(() => JSONway.set({}, this.test.title, 'z'))
  })

  it('[-1]', function () {
    let out = [undefined, 'z']
    assert.deepEqual(JSONway.set([undefined, 'x'], this.test.title, 'z'), out)

    out = ['z']
    assert.deepEqual(JSONway.set([], this.test.title, 'z'), out)

    out = ['z']
    assert.deepEqual(JSONway.set(['a'], this.test.title, 'z'), out)
  })

  it('{a}', function () {
    const out = { a: 'z' }
    assert.deepEqual(JSONway.set({}, this.test.title, 'z'), out)
  })

  it('a.b', function () {
    const out = { a: { b: 'z' } }
    assert.deepEqual(JSONway.set({}, this.test.title, 'z'), out)
  })

  it('a.b.c', function () {
    let object = {}
    let out = { a: { b: { c: 'z' } } }
    assert.deepEqual(JSONway.set(object, this.test.title, 'z'), out)

    object = { d: 'x', a: { e: 'y' } }
    out = { d: 'x', a: { e: 'y', b: { c: 'z' } } }
    assert.deepEqual(JSONway.set(object, this.test.title, 'z'), out)

    object = { d: 'x', a: 'y' }
    out = { d: 'x', a: { b: { c: 'z' } } }
    assert.deepEqual(JSONway.set(object, this.test.title, 'z'), out)

    object = { d: 'x', a: ['y'] }
    out = { d: 'x', a: { b: { c: 'z' } } }
    assert.deepEqual(JSONway.set(object, this.test.title, 'z'), out)

    object = { d: 'x', a: { e: 'y', b: 'g' } }
    out = { d: 'x', a: { e: 'y', b: { c: 'z' } } }
    assert.deepEqual(JSONway.set(object, this.test.title, 'z'), out)
  })

  it('a[0]', function () {
    let object = {}
    let out = { a: ['z'] }
    assert.deepEqual(JSONway.set(object, this.test.title, 'z'), out)

    object = { b: 'x' }
    out = { b: 'x', a: ['z'] }
    assert.deepEqual(JSONway.set(object, this.test.title, 'z'), out)

    object = { a: [undefined, 'g'] }
    out = { a: ['z', 'g'] }
    assert.deepEqual(JSONway.set(object, this.test.title, 'z'), out)

    object = { a: ['y', 'g'] }
    out = { a: ['z', 'g'] }
    assert.deepEqual(JSONway.set(object, this.test.title, 'z'), out)

    object = { a: [['y'], 'g'] }
    out = { a: ['z', 'g'] }
    assert.deepEqual(JSONway.set(object, this.test.title, 'z'), out)

    object = { a: [{ b: 'y' }, 'g'] }
    out = { a: ['z', 'g'] }
    assert.deepEqual(JSONway.set(object, this.test.title, 'z'), out)

    object = { b: 'x' }
    out = { b: 'x', a: [['z']] }
    assert.deepEqual(JSONway.set(object, this.test.title, ['z']), out)

    object = { b: 'x', a: ['g'] }
    out = { b: 'x', a: ['z'] }
    assert.deepEqual(JSONway.set(object, this.test.title, 'z'), out)
  })

  it('[+]', function () {
    let out = ['z']
    assert.deepEqual(JSONway.set([], this.test.title, 'z'), out)

    out = ['z']
    assert.deepEqual(JSONway.set([], this.test.title, ['z']), out)

    out = ['x', 'z']
    assert.deepEqual(JSONway.set(['x'], this.test.title, 'z'), out)

    out = ['x', 'z', 'y']
    assert.deepEqual(JSONway.set(['x'], this.test.title, ['z', 'y']), out)
  })

  it('[*]', function () {
    let out = []
    assert.deepEqual(JSONway.set([], this.test.title, 'z'), out)

    out = ['z']
    assert.deepEqual(JSONway.set(['a'], this.test.title, 'z'), out)

    out = ['z', 'z', 'z']
    assert.deepEqual(JSONway.set(['a', 'b', 'c'], this.test.title, 'z'), out)

    out = [['zo', 'za']]
    assert.deepEqual(JSONway.set([5], this.test.title, ['zo', 'za']), out)

    out = [{ a: 'b' }, { a: 'b' }]
    assert.deepEqual(JSONway.set(['c', 'd'], this.test.title, { a: 'b' }), out)
  })

  it('[]', function () {
    let out = ['zo']
    assert.deepEqual(JSONway.set([], this.test.title, 'zo'), out)

    out = ['zo']
    assert.deepEqual(JSONway.set([], this.test.title, ['zo']), out)

    out = ['zo']
    assert.deepEqual(JSONway.set([1], this.test.title, 'zo'), out)

    out = ['zo']
    assert.deepEqual(JSONway.set([1], this.test.title, ['zo']), out)

    out = ['zo']
    assert.deepEqual(JSONway.set(['a', 'b'], this.test.title, 'zo'), out)

    out = ['zo', 'za']
    assert.deepEqual(JSONway.set([], this.test.title, ['zo', 'za']), out)

    out = ['z', 'x']
    assert.deepEqual(JSONway.set([1, 2, 3], this.test.title, ['z', 'x']), out)
  })

  it('a[+]', function () {
    const out = { a: ['z'] }
    assert.deepEqual(JSONway.set({}, this.test.title, 'z'), out)
  })

  it('[0][+]', function () {
    const out = [['z']]
    assert.deepEqual(JSONway.set([], this.test.title, 'z'), out)
  })

  it('[0][1]', function () {
    const out = [[undefined, 'z']]
    assert.deepEqual(JSONway.set([], this.test.title, 'z'), out)
  })

  it('a[0].b', function () {
    const out = { a: [{ b: 'z' }] }
    assert.deepEqual(JSONway.set({}, this.test.title, 'z'), out)
  })

  it('a[1].b', function () {
    const out = { a: [undefined, { b: 'z' }] }
    assert.deepEqual(JSONway.set({}, this.test.title, 'z'), out)
  })

  it('a[+].b', function () {
    const out = { a: [{ b: 'z' }] }
    assert.deepEqual(JSONway.set({}, this.test.title, 'z'), out)
  })

  it('a[1][0].b', function () {
    const out = { a: [undefined, [{ b: 'z' }]] }
    assert.deepEqual(JSONway.set({}, this.test.title, 'z'), out)
  })

  it('a[-1].b', function () {
    const out = { a: [{ b: 'z' }] }
    assert.deepEqual(JSONway.set({}, this.test.title, 'z'), out)
  })

  it('a[0,2].b', function () {
    const out = { a: [{ b: 'z' }, undefined, { b: 'z' }] }
    assert.deepEqual(JSONway.set({}, this.test.title, 'z'), out)
  })

  it('a[-1][-1][1][-1].b', function () {
    const out = { a: [[[undefined, [{ b: 'z' }]]]] }
    assert.deepEqual(JSONway.set({}, this.test.title, 'z'), out)
  })

  it('a[b.c][3][d.{}[e.[.f]', function () {
    const out = {
      a: { 'b.c': [undefined, undefined, undefined, { 'd.{}[e.[.f': 'z' }] },
    }
    assert.deepEqual(JSONway.set({}, this.test.title, 'z'), out)
  })

  it('a.b[1].c[d].7[0]', function () {
    const out = { a: { b: [undefined, { c: { d: { 7: ['z'] } } }] } }
    assert.deepEqual(JSONway.set({}, this.test.title, 'z'), out)
  })

  it('a{b}', function () {
    const out = { a: { b: 'zoo' } }
    assert.deepEqual(JSONway.set({}, this.test.title, ['zoo']), out)
  })

  it('a{b,c}', function () {
    const out = { a: { b: 'zoo', c: 'yoo' } }
    assert.deepEqual(JSONway.set({}, this.test.title, ['zoo', 'yoo']), out)
  })

  it('a{b.c,d[1]}', function () {
    const out = { a: { b: { c: 'z' }, d: [undefined, 'y'] } }
    assert.deepEqual(JSONway.set({}, this.test.title, ['z', 'y']), out)
  })

  it('a{b.c,d[1],b[+],d}', function () {
    const out = { a: { b: ['x'], d: 'g' } }
    assert.deepEqual(
      JSONway.set({}, this.test.title, ['z', 'y', 'x', 'g']),
      out,
    )
  })

  it('a[].b', function () {
    let out = { a: [{ b: 'zo' }, { b: 'yo' }] }
    assert.deepEqual(JSONway.set({}, this.test.title, ['zo', 'yo']), out)

    out = { a: [{ b: 'zo' }] }
    assert.deepEqual(JSONway.set({}, this.test.title, 'zo'), out)

    let existing = { a: [{ b: 'yo' }] }
    out = { a: [{ b: 'yo' }, { b: 'zo' }] }
    assert.deepEqual(JSONway.set(existing, this.test.title, 'zo'), out)
  })

  it('a[].b[]', function () {
    let out = { a: [{ b: ['zo'] }, { b: ['yo'] }] }
    assert.deepEqual(JSONway.set({}, this.test.title, ['zo', 'yo']), out)

    out = { a: [{ b: ['zo', 3] }, { b: [2, 'yo'] }] }
    assert.deepEqual(
      JSONway.set({}, this.test.title, [
        ['zo', 3],
        [2, 'yo'],
      ]),
      out,
    )
  })

  it('a[]{b,c.d}', function () {
    const out = {
      a: [
        { b: 'zo', c: { d: 4 } },
        { b: 'yo', c: { d: true } },
      ],
    }
    assert.deepEqual(
      JSONway.set({}, this.test.title, [
        ['zo', 4],
        ['yo', true],
      ]),
      out,
    )
  })

  it('[+].a', function () {
    let out = [{ a: 'z' }]
    assert.deepEqual(JSONway.set([], this.test.title, 'z'), out)

    assert.deepEqual(JSONway.set([5], this.test.title, 'z'), out)

    out = [{ a: 'zo' }, { a: 'za' }]
    assert.deepEqual(JSONway.set([], this.test.title, ['zo', 'za']), out)
  })

  it('[+]{a,b}', function () {
    let out = [{ a: 'za', b: 'xb' }]
    assert.deepEqual(JSONway.set([], this.test.title, [['za', 'xb']]), out)
    assert.deepEqual(JSONway.set([5], this.test.title, [['za', 'xb']]), out)

    out = [
      { a: 'za', b: 'xb' },
      { a: 'ya', b: 'gb' },
    ]
    assert.deepEqual(
      JSONway.set([3, 5], this.test.title, [
        ['za', 'xb'],
        ['ya', 'gb'],
      ]),
      out,
    )
  })

  it('[*].a', function () {
    let out = []
    assert.deepEqual(JSONway.set([], this.test.title, 'z'), out)

    out = [5]
    assert.deepEqual(JSONway.set([5], this.test.title, 'z'), out)

    out = [{ a: 'z' }]
    assert.deepEqual(JSONway.set([{}], this.test.title, 'z'), out)

    out = [{ a: ['zo', 'za'] }]
    assert.deepEqual(JSONway.set([{}], this.test.title, ['zo', 'za']), out)

    out = [{ b: 'x', a: 'z' }]
    assert.deepEqual(JSONway.set([{ b: 'x' }], this.test.title, 'z'), out)

    out = [{ b: 'x', a: 'z' }, { a: 'z', y: 'g' }, { a: 'z' }]
    assert.deepEqual(
      JSONway.set([{ b: 'x' }, { y: 'g' }, { a: true }], this.test.title, 'z'),
      out,
    )
  })

  it('[*]{a,b}', function () {
    let out = []
    assert.deepEqual(JSONway.set([], this.test.title, ['za', 'xb']), out)

    out = [5]
    assert.deepEqual(JSONway.set([5], this.test.title, ['za', 'xb']), out)

    out = [3, { a: 'za', b: 'xb' }]
    assert.deepEqual(JSONway.set([3, {}], this.test.title, ['za', 'xb']), out)

    out = [{ a: 'za', b: 'xb' }, { c: 'y', a: 'za', b: 'xb' }, 5]
    assert.deepEqual(
      JSONway.set([{}, { c: 'y' }, 5], this.test.title, ['za', 'xb']),
      out,
    )

    out = [
      { c: 3, a: 'za', b: 'xb' },
      { d: 5, a: 'za', b: 'xb' },
    ]
    assert.deepEqual(
      JSONway.set([{ c: 3 }, { d: 5 }], this.test.title, ['za', 'xb']),
      out,
    )
  })

  it('a[*][*].b', function () {
    let out = {}
    assert.deepEqual(JSONway.set({}, this.test.title, 'z'), out)

    out = { a: [5] }
    assert.deepEqual(JSONway.set({ a: [5] }, this.test.title, 'z'), out)

    out = { a: [[4]] }
    assert.deepEqual(JSONway.set({ a: [[4]] }, this.test.title, 'z'), out)

    out = { a: [3, [{ b: 'z' }]] }
    assert.deepEqual(JSONway.set({ a: [3, [{}]] }, this.test.title, 'z'), out)

    out = { a: [2, [4, { b: 'z' }, { c: 3, b: 'z' }], 6] }
    assert.deepEqual(
      JSONway.set({ a: [2, [4, {}, { c: 3 }], 6] }, this.test.title, 'z'),
      out,
    )
  })

  it('a[*].b[*].c', function () {
    let out = {}
    assert.deepEqual(JSONway.set({}, this.test.title, 'z'), out)

    out = { a: [5] }
    assert.deepEqual(JSONway.set({ a: [5] }, this.test.title, 'z'), out)

    out = { a: [{ b: [4] }] }
    assert.deepEqual(
      JSONway.set({ a: [{ b: [4] }] }, this.test.title, 'z'),
      out,
    )

    out = { a: [{ b: [4, { c: 'z' }, { d: true, c: 'z' }] }] }
    assert.deepEqual(
      JSONway.set({ a: [{ b: [4, {}, { d: true }] }] }, this.test.title, 'z'),
      out,
    )
  })

  it('[0][*]', function () {
    let out = []
    assert.deepEqual(JSONway.set([], this.test.title, 'z'), out)

    out = ['a']
    assert.deepEqual(JSONway.set(['a'], this.test.title, 'z'), out)

    out = [[], 3]
    assert.deepEqual(JSONway.set([[], 3], this.test.title, 'z'), out)

    out = [['z']]
    assert.deepEqual(JSONway.set([[null]], this.test.title, 'z'), out)

    out = ['a', 'b', 'c']
    assert.deepEqual(JSONway.set(['a', 'b', 'c'], this.test.title, 'z'), out)

    out = [['z'], ['aa']]
    assert.deepEqual(JSONway.set([[0], ['aa']], this.test.title, 'z'), out)

    out = [5]
    assert.deepEqual(JSONway.set([5], this.test.title, ['zo', 'za']), out)

    out = [[['zo', 'za']], 3]
    assert.deepEqual(JSONway.set([[2], 3], this.test.title, ['zo', 'za']), out)

    out = [[{ a: 'b' }], { a: 'c' }]
    assert.deepEqual(
      JSONway.set([[1], { a: 'c' }], this.test.title, { a: 'b' }),
      out,
    )
  })

  it('a{:}', function () {
    let set = { b: 'z' }
    let out = { a: { b: 'z' } }
    assert.deepEqual(JSONway.set({}, this.test.title, set), out)

    set = { b: 'z', c: 'x' }
    out = { a: { b: 'z', c: 'x' } }
    assert.deepEqual(JSONway.set({}, this.test.title, set), out)

    set = { 'b.c': 'z', 'b.d': 'x' }
    out = { a: { b: { c: 'z', d: 'x' } } }
    assert.deepEqual(JSONway.set({}, this.test.title, set), out)

    let orig = { g: 3, a: { f: 'y' } }
    set = { 'b.c': 'z', 'b.d': 'x' }
    out = { g: 3, a: { f: 'y', b: { c: 'z', d: 'x' } } }
    assert.deepEqual(JSONway.set(orig, this.test.title, set), out)

    orig = { g: 3, a: { b: 'y' } }
    set = { 'b.c': 'z', 'b.d': 'x' }
    out = { g: 3, a: { b: { c: 'z', d: 'x' } } }
    assert.deepEqual(JSONway.set(orig, this.test.title, set), out)

    orig = { g: 3, a: { b: { c: 'y' } } }
    set = { 'b.c': 'z', 'b.d': 'x' }
    out = { g: 3, a: { b: { c: 'z', d: 'x' } } }
    assert.deepEqual(JSONway.set(orig, this.test.title, set), out)

    orig = { g: 3, a: { b: { f: 'y' } } }
    set = { 'b.c': 'z', 'b.d': 'x' }
    out = { g: 3, a: { b: { f: 'y', c: 'z', d: 'x' } } }
    assert.deepEqual(JSONway.set(orig, this.test.title, set), out)
  })

  it('a{b.c,d[],[[{}[]}', function () {
    const out = { a: { b: { c: 'zo' }, d: ['yo'], '[{}[': 'go' } }
    assert.deepEqual(JSONway.set({}, this.test.title, ['zo', 'yo', 'go']), out)
  })

  it('a[]{[b.b],c,d,e[0],j,[j.j],k}', function () {
    const out = {
      a: [
        { 'b.b': ['f'], c: ['11'] },
        { 'b.b': 'g', d: '21' },
        { 'b.b': ['k'], j: ['31'], 'j.j': ['41'] },
        { 'b.b': ['h'], k: ['51'], j: ['61'] },
        { 'b.b': 'i', e: ['71'] },
      ],
    }

    let value = [
      [['f'], ['11']],
      ['g', undefined, '21'],
      [['k'], undefined, undefined, undefined, ['31'], ['41']],
      [['h'], undefined, undefined, undefined, ['61'], undefined, ['51']],
      ['i', undefined, undefined, '71'],
    ]

    assert.deepEqual(JSONway.set({}, this.test.title, value), out)

    value = [
      { '[b.b]': ['f'], c: ['11'] },
      { '[b.b]': 'g', d: '21' },
      { '[b.b]': ['k'], j: ['31'], '[j.j]': ['41'] },
      { '[b.b]': ['h'], j: ['61'], k: ['51'] },
      { '[b.b]': 'i', 'e[0]': '71' },
    ]

    assert.deepEqual(JSONway.set({}, this.test.title, value), out)
  })

  it('aa.bb[].cc[]{dd,ee}', function () {
    const out = {
      aa: {
        bb: [
          { cc: [{ dd: '11', ee: 'a' }] },
          {
            cc: [
              { dd: '21', ee: 'b' },
              { dd: '31', ee: 'c' },
              { dd: '41', ee: 'd' },
            ],
          },
          { cc: [{ dd: '51', ee: 'e' }] },
          {
            cc: [
              { dd: '61', ee: 'g' },
              { dd: '71', ee: 'h' },
              { dd: '81', ee: 'i' },
            ],
          },
        ],
      },
    }

    let value = [
      [['11', 'a']],
      [
        ['21', 'b'],
        ['31', 'c'],
        ['41', 'd'],
      ],
      [['51', 'e']],
      [
        ['61', 'g'],
        ['71', 'h'],
        ['81', 'i'],
      ],
    ]

    assert.deepEqual(JSONway.set({}, this.test.title, value), out)

    value = [
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

    assert.deepEqual(JSONway.set({}, this.test.title, value), out)
  })

  it(`a(c='yy').b`, function () {
    let out = { a: { b: 'x', c: 'yy' } }
    assert.deepEqual(JSONway.set({}, this.test.title, 'x'), out)

    out = { a: { b: 'x', c: 'yy' } }
    assert.deepEqual(JSONway.set({ a: { b: 'g' } }, this.test.title, 'x'), out)

    out = { a: { b: 'x', c: 'yy', f: 'q' } }
    assert.deepEqual(
      JSONway.set({ a: { c: 'g', f: 'q' } }, this.test.title, 'x'),
      out,
    )
  })

  it(`a(c=5).b`, function () {
    let out = { a: { b: 'x', c: 5 } }
    assert.deepEqual(JSONway.set({}, this.test.title, 'x'), out)

    out = { a: { b: 'x', c: 5 } }
    assert.deepEqual(JSONway.set({ a: { b: 'g' } }, this.test.title, 'x'), out)

    out = { a: { b: 'x', c: 5, f: 'q' } }
    assert.deepEqual(
      JSONway.set({ a: { c: 'g', f: 'q' } }, this.test.title, 'x'),
      out,
    )
  })

  it(`a(c='yy'&&d=5).b`, function () {
    let out = { a: { b: 'x', c: 'yy', d: 5 } }
    assert.deepEqual(JSONway.set({}, this.test.title, 'x'), out)

    out = { a: { b: 'x', c: 'yy', d: 5 } }
    assert.deepEqual(JSONway.set({ a: { b: 'g' } }, this.test.title, 'x'), out)

    out = { a: { b: 'x', c: 'yy', d: 5, f: 'q' } }
    assert.deepEqual(
      JSONway.set({ a: { c: 'g', f: 'q' } }, this.test.title, 'x'),
      out,
    )
  })

  it(`a(c='yy'&&d=5&&e=true).b`, function () {
    let out = { a: { b: 'x', c: 'yy', d: 5, e: true } }
    assert.deepEqual(JSONway.set({}, this.test.title, 'x'), out)

    out = { a: { b: 'x', c: 'yy', d: 5, e: true } }
    assert.deepEqual(JSONway.set({ a: { b: 'g' } }, this.test.title, 'x'), out)

    out = { a: { b: 'x', c: 'yy', d: 5, f: 'q', e: true } }
    assert.deepEqual(
      JSONway.set({ a: { c: 'g', f: 'q', e: false } }, this.test.title, 'x'),
      out,
    )
  })

  it(`(c='yy').b`, function () {
    let out = { b: 'x', c: 'yy' }
    assert.deepEqual(JSONway.set({}, this.test.title, 'x'), out)

    out = { b: 'x', c: 'yy' }
    assert.deepEqual(JSONway.set({ b: 'g' }, this.test.title, 'x'), out)

    out = { b: 'x', c: 'yy', f: 'q' }
    assert.deepEqual(JSONway.set({ c: 'g', f: 'q' }, this.test.title, 'x'), out)
  })

  it(`a[](c='yy').b`, function () {
    let out = { a: [{ b: 'x', c: 'yy' }] }
    assert.deepEqual(JSONway.set({}, this.test.title, 'x'), out)

    out = { a: [{ b: 'x', c: 'yy' }] }
    assert.deepEqual(JSONway.set({}, this.test.title, ['x']), out)

    out = {
      a: [
        { b: 'x', c: 'yy' },
        { b: 'z', c: 'yy' },
      ],
    }
    assert.deepEqual(JSONway.set({}, this.test.title, ['x', 'z']), out)

    out = {
      a: [2, 4, 6, { b: 'x', c: 'yy' }, { b: 'z', c: 'yy' }],
    }
    assert.deepEqual(
      JSONway.set({ a: [2, 4, 6] }, this.test.title, ['x', 'z']),
      out,
    )
  })

  it(`a[](c!='yy').b`, function () {
    const out = { a: [{ b: 'x' }, { b: 'z' }] }
    assert.deepEqual(JSONway.set({}, this.test.title, ['x', 'z']), out)
  })

  it(`bb[*].ee[*].hh[*].cc`, async function () {
    const object = await _getJsonAsync('./fixtures/nested-list-response.json')

    const out = JSON.parse(JSON.stringify(object))
    out.bb[0].ee[0].hh[0].cc = 'ooo'
    out.bb[0].ee[0].hh[1].cc = 'ooo'
    out.bb[0].ee[1].hh[0].cc = 'ooo'
    out.bb[0].ee[1].hh[1].cc = 'ooo'
    out.bb[1].ee[0].hh[0].cc = 'ooo'
    out.bb[1].ee[0].hh[1].cc = 'ooo'
    out.bb[1].ee[1].hh[0].cc = 'ooo'
    out.bb[1].ee[1].hh[1].cc = 'ooo'

    assert.deepEqual(JSONway.set(object, this.test.title, 'ooo'), out)
  })
})
