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
    const out = ['{}', [['foo', ['.', 'foo']]]]
    assert.deepEqual(parseObject(this.test.title, 1)[0], out)
  })

  it('{ foo }', function () {
    const out = ['{}', [['foo', ['.', 'foo']]]]
    assert.deepEqual(parseObject(this.test.title, 1)[0], out)
  })

  it('{foo', function () {
    const out = ['{}', [['foo', ['.', 'foo']]]]
    assert.deepEqual(parseObject(this.test.title, 1)[0], out)
  })

  it('{foo  ', function () {
    const out = ['{}', [['foo', ['.', 'foo']]]]
    assert.deepEqual(parseObject(this.test.title, 1)[0], out)
  })

  it('{foo[].bar[*].baz}', function () {
    const out = [
      '{}',
      [
        [
          'foo[].bar[*].baz',
          ['.', 'foo', '[]', ['.', 'bar', '[*]', ['.', 'baz']]],
        ],
      ],
    ]
    assert.deepEqual(parseObject(this.test.title, 1)[0], out)
  })

  it('{foo: bar[]}', function () {
    const out = ['{}', [['foo', ['.', 'bar', '[]', []]]]]
    assert.deepEqual(parseObject(this.test.title, 1)[0], out)
  })

  it('{foo = 10}', function () {
    const out = ['{}', [['foo', ['.', 'foo'], 10]]]
    assert.deepEqual(parseObject(this.test.title, 1)[0], out)
  })

  it('{"foo[{""}]": bar[]}', function () {
    const out = ['{}', [['foo[{"}]', ['.', 'bar', '[]', []]]]]
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
              ['baz', ['.', 'baz'], false],
              ['id', ['.', 'id'], false],
            ],
          ],
        ],
      ],
    ]

    assert.deepEqual(parseObject(this.test.title, 1)[0], out)
  })

  it(`{ foo: 'bar' , , baz: 4 , id: id[] = 'dd', }`, function () {
    const out = [
      '{}',
      [
        ['foo', [true, 'bar']],
        ['baz', [true, 4]],
        ['id', ['.', 'id', '[]', []], 'dd'],
      ],
    ]
    assert.deepEqual(parseObject(this.test.title, 1)[0], out)
  })

  it('{foo: bar[] = false , baz , cc : aa = "ee" , gee=5}', function () {
    const out = [
      '{}',
      [
        ['foo', ['.', 'bar', '[]', []], false],
        ['baz', ['.', 'baz']],
        ['cc', ['.', 'aa'], 'ee'],
        ['gee', ['.', 'gee'], 5],
      ],
    ]
    assert.deepEqual(parseObject(this.test.title, 1)[0], out)
  })

  it(`{ foo, baz: null , id }`, function () {
    const out = [
      '{}',
      [
        ['foo', ['.', 'foo']],
        ['baz', [true, null]],
        ['id', ['.', 'id']],
      ],
    ]
    assert.deepEqual(parseObject(this.test.title, 1)[0], out)
  })

  it('foo{bar=a,baz=5 }{bb,cc}', function () {
    let out = [
      [
        '{}',
        [
          ['bar', ['.', 'bar'], 'a'],
          ['baz', ['.', 'baz'], 5],
        ],
      ],
      16,
    ]
    assert.deepEqual(parseObject(this.test.title, 4), out)

    out = [
      [
        '{}',
        [
          ['bb', ['.', 'bb']],
          ['cc', ['.', 'cc']],
        ],
      ],
      23,
    ]
    assert.deepEqual(parseObject(this.test.title, 18), out)
  })
})
