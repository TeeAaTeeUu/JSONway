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

  it('{', function () {
    const out = []
    assert.deepEqual(parseObject(this.test.title, 1)[0], out)
  })

  it('{foo}', function () {
    const out = ['{}', [['foo', ['.', 'foo'], undefined]]]
    assert.deepEqual(parseObject(this.test.title, 1)[0], out)
  })

  it('{ foo }', function () {
    const out = ['{}', [['foo', ['.', 'foo'], undefined]]]
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
        ],
      ],
    ]
    assert.deepEqual(parseObject(this.test.title, 1)[0], out)
  })

  it('{foo: bar[]}', function () {
    const out = ['{}', [['foo', ['.', 'bar', '[]', []], undefined]]]
    assert.deepEqual(parseObject(this.test.title, 1)[0], out)
  })

  it('{"foo[{""}]": bar[]}', function () {
    const out = ['{}', [['foo[{"}]', ['.', 'bar', '[]', []], undefined]]]
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
          undefined,
        ],
      ],
    ]

    assert.deepEqual(parseObject(this.test.title, 1)[0], out)
  })

  it(`{ foo: 'bar' , baz: 4 , id: id[] = 'dd' }`, function () {
    const out = [
      '{}',
      [
        ['foo', [true, 'bar'], undefined],
        ['baz', [true, 4], undefined],
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
        ['baz', ['.', 'baz'], undefined],
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
        ['foo', ['.', 'foo'], undefined],
        ['baz', [true, null], undefined],
        ['id', ['.', 'id'], undefined],
      ],
    ]
    assert.deepEqual(parseObject(this.test.title, 1)[0], out)
  })
})
