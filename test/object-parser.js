import { assert } from 'chai'

import { parseObject } from '../lib/object-parser.js'

describe('object-parser', () => {
  it('{:}', function () {
    const out = ['{:}', true]
    assert.deepEqual(parseObject(this.test.title, 1)[0], out)
  })

  it('{:', function () {
    const out = ['{:}', true]
    assert.deepEqual(parseObject(this.test.title, 1)[0], out)
  })

  it('{:}.foo', function () {
    const out = ['{:}', true]
    assert.deepEqual(parseObject(this.test.title, 1)[0], out)
  })

  it('foo{', function () {
    const out = []
    assert.deepEqual(parseObject(this.test.title, 4)[0], out)
  })

  it('{   ', function () {
    const out = []
    assert.deepEqual(parseObject(this.test.title, 1)[0], out)
  })

  it('{foo}', function () {
    const out = ['{}', [['foo', ['.', 'foo'], undefined, [false]]]]
    assert.deepEqual(parseObject(this.test.title, 1)[0], out)
  })

  it('{ foo }', function () {
    const out = ['{}', [['foo', ['.', 'foo'], undefined, [false]]]]
    assert.deepEqual(parseObject(this.test.title, 1)[0], out)
  })

  it('{foo', function () {
    const out = ['{}', [['foo', ['.', 'foo'], undefined, [false]]]]
    assert.deepEqual(parseObject(this.test.title, 1)[0], out)
  })

  it('{foo  ', function () {
    const out = ['{}', [['foo', ['.', 'foo'], undefined, [false]]]]
    assert.deepEqual(parseObject(this.test.title, 1)[0], out)
  })

  it('{foo[].bar[*].baz}', function () {
    const out = [
      '{}',
      [
        [
          'foo[].bar[*].baz',
          ['.', 'foo', '[]', ['.', 'bar', '[*]', ['.', 'baz']]],
          undefined,
          [false],
        ],
      ],
    ]
    assert.deepEqual(parseObject(this.test.title, 1)[0], out)
  })

  it('{foo: bar[]}', function () {
    const out = ['{}', [['foo', ['.', 'bar', '[]', []], undefined, [true]]]]
    assert.deepEqual(parseObject(this.test.title, 1)[0], out)
  })

  it('{foo = 10}', function () {
    const out = ['{}', [['foo', ['.', 'foo'], 10, [false]]]]
    assert.deepEqual(parseObject(this.test.title, 1)[0], out)
  })

  it('{foo == 10}', function () {
    const out = ['{}', [['foo', ['.', 'foo'], 10, [false]]]]
    assert.deepEqual(parseObject(this.test.title, 1)[0], out)
  })

  it('{foo ?? 10}', function () {
    const out = ['{}', [['foo', ['.', 'foo'], 10, [false]]]]
    assert.deepEqual(parseObject(this.test.title, 1)[0], out)
  })

  it('{foo ?| 10}', function () {
    const out = ['{}', [['foo', ['.', 'foo'], 10, [false]]]]
    assert.deepEqual(parseObject(this.test.title, 1)[0], out)
  })

  it('{foo | 10}', function () {
    const out = ['{}', [['foo', ['.', 'foo'], 10, [false]]]]
    assert.deepEqual(parseObject(this.test.title, 1)[0], out)
  })

  it('{foo || 10}', function () {
    const out = ['{}', [['foo', ['.', 'foo'], 10, [false]]]]
    assert.deepEqual(parseObject(this.test.title, 1)[0], out)
  })

  it('{foo |? 10}', function () {
    const out = ['{}', [['foo', ['.', 'foo'], 10, [false]]]]
    assert.deepEqual(parseObject(this.test.title, 1)[0], out)
  })

  it("{aa: foo |? 10, bb: baz == 'bar'}", function () {
    const out = [
      '{}',
      [
        ['aa', ['.', 'foo'], 10, [true]],
        ['bb', ['.', 'baz'], 'bar', [true]],
      ],
    ]
    assert.deepEqual(parseObject(this.test.title, 1)[0], out)
  })

  it('{"foo[{""}]": bar[]}', function () {
    const out = [
      '{}',
      [['foo[{"}]', ['.', 'bar', '[]', []], undefined, [true]]],
    ]
    assert.deepEqual(parseObject(this.test.title, 1)[0], out)
  })

  it('{foo: bar[{baz,id}]}', function () {
    const out = [
      '{}',
      [
        [
          'foo',
          [
            '.',
            'bar',
            '[{}]',
            [
              ['baz', ['.', 'baz'], undefined, [false, false, [0, 0]]],
              ['id', ['.', 'id'], undefined, [false, false, [0, 0]]],
            ],
          ],
          undefined,
          [true],
        ],
      ],
    ]

    assert.deepEqual(parseObject(this.test.title, 1)[0], out)
  })

  it(`{ foo: 'bar' , , baz: 4 , id: id[] = 'dd', }`, function () {
    const out = [
      '{}',
      [
        ['foo', [true, 'bar'], undefined, [true]],
        ['baz', [true, 4], undefined, [true]],
        ['id', ['.', 'id', '[]', []], 'dd', [true]],
      ],
    ]
    assert.deepEqual(parseObject(this.test.title, 1)[0], out)
  })

  it('{foo: bar[] = false , baz , cc : aa = "ee" , gee=5}', function () {
    const out = [
      '{}',
      [
        ['foo', ['.', 'bar', '[]', []], false, [true]],
        ['baz', ['.', 'baz'], undefined, [false]],
        ['cc', ['.', 'aa'], 'ee', [true]],
        ['gee', ['.', 'gee'], 5, [false]],
      ],
    ]
    assert.deepEqual(parseObject(this.test.title, 1)[0], out)
  })

  it(`{ foo, baz: null , id }`, function () {
    const out = [
      '{}',
      [
        ['foo', ['.', 'foo'], undefined, [false]],
        ['baz', [true, null], undefined, [true]],
        ['id', ['.', 'id'], undefined, [false]],
      ],
    ]
    assert.deepEqual(parseObject(this.test.title, 1)[0], out)
  })

  it('foo{bar=a,baz=5 }{bb,cc}', function () {
    let out = [
      [
        '{}',
        [
          ['bar', ['.', 'bar'], 'a', [false]],
          ['baz', ['.', 'baz'], 5, [false]],
        ],
      ],
      16,
    ]
    assert.deepEqual(parseObject(this.test.title, 4), out)

    out = [
      [
        '{}',
        [
          ['bb', ['.', 'bb'], undefined, [false]],
          ['cc', ['.', 'cc'], undefined, [false]],
        ],
      ],
      23,
    ]
    assert.deepEqual(parseObject(this.test.title, 18), out)
  })
})
