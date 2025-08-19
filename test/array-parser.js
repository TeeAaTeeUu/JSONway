import { assert } from 'chai'

import { parseArray } from '../lib/array-parser.js'

describe('array-parser', () => {
  it('[foo]', function () {
    const out = ['.', 'foo']
    assert.deepEqual(parseArray(this.test.title, 1)[0], out)
  })

  it('[foo', function () {
    const out = ['.', 'foo']
    assert.deepEqual(parseArray(this.test.title, 1)[0], out)
  })

  it(`['foo']`, function () {
    const out = ['.', 'foo']
    assert.deepEqual(parseArray(this.test.title, 1)[0], out)
  })

  it('[5].foo', function () {
    const out = ['1', 5]
    assert.deepEqual(parseArray(this.test.title, 1), [out, 2])
  })

  it(`['5'].foo`, function () {
    const out = ['.', '5']
    assert.deepEqual(parseArray(this.test.title, 1)[0], out)
  })

  it('[-2]', function () {
    const out = ['-1', -2]
    assert.deepEqual(parseArray(this.test.title, 1)[0], out)
  })

  it('[]', function () {
    const out = ['[]', []]
    assert.deepEqual(parseArray(this.test.title, 1)[0], out)
  })

  it('[*]', function () {
    const out = ['[*]', []]
    assert.deepEqual(parseArray(this.test.title, 1)[0], out)
  })

  it(`['*']`, function () {
    const out = ['.', '*']
    assert.deepEqual(parseArray(this.test.title, 1)[0], out)
  })

  it(`['[*]']`, function () {
    const out = ['.', '[*]']
    assert.deepEqual(parseArray(this.test.title, 1)[0], out)
  })

  it('[[*]]', function () {
    const out = ['.', '[*]']
    assert.deepEqual(parseArray(this.test.title, 1)[0], out)
  })

  it('[=]', function () {
    const out = ['[=]', []]
    assert.deepEqual(parseArray(this.test.title, 1)[0], out)
  })

  it('[#]', function () {
    const out = ['[#]', []]
    assert.deepEqual(parseArray(this.test.title, 1)[0], out)
  })

  it('[:]', function () {
    const out = ['[:]', []]
    assert.deepEqual(parseArray(this.test.title, 1)[0], out)
  })

  it('[:#]', function () {
    const out = ['[:#]', []]
    assert.deepEqual(parseArray(this.test.title, 1)[0], out)
    assert.deepEqual(parseArray('[#:]', 1)[0], out)
  })

  it('[*#]', function () {
    const out = ['[*#]', []]
    assert.deepEqual(parseArray(this.test.title, 1)[0], out)
    assert.deepEqual(parseArray('[#*]', 1)[0], out)
  })

  it('[3,7]', function () {
    const out = ['[_,]', [[3, 7]]]
    assert.deepEqual(parseArray(this.test.title, 1)[0], out)
  })

  it(`baz['[qee[].0]'][foo]`, function () {
    const out = ['.', '[qee[].0]']
    assert.deepEqual(parseArray(this.test.title, 4), [out, 15])
  })

  it(`['error', false, null, ab.cd]`, function () {
    const out = ['error', false, null, ['.', 'ab', '.', 'cd']]
    assert.deepEqual(parseArray(this.test.title, 1)[0], out)
  })

  it(`[foo[].bar, baz, foo[*].id]`, function () {
    const out = [
      ['.', 'foo', '[]', ['.', 'bar']],
      ['.', 'baz'],
      ['.', 'foo', '[*]', ['.', 'id']],
    ]
    assert.deepEqual(parseArray(this.test.title, 1)[0], out)
  })

  it('[foo[3,5].bar, baz]', function () {
    const out = [
      ['.', 'foo', '[_,]', [[3, 5], '.', 'bar']],
      ['.', 'baz'],
    ]
    assert.deepEqual(parseArray(this.test.title, 1)[0], out)
  })

  it(`['{bar,baz}']`, function () {
    const out = ['.', '{bar,baz}']
    assert.deepEqual(parseArray(this.test.title, 1)[0], out)
  })

  it('[ foo{bar}, baz ]', function () {
    const out = [
      ['.', 'foo', '{}', [['bar'], [['.', 'bar']]]],
      ['.', 'baz'],
    ]
    assert.deepEqual(parseArray(this.test.title, 1)[0], out)
  })

  it(`[
      foo{bar,gee},
      baz[2,1].id,
      name
    ]

    `, function () {
    const out = [
      [
        '.',
        'foo',
        '{}',
        [
          ['bar', 'gee'],
          [
            ['.', 'bar'],
            ['.', 'gee'],
          ],
        ],
      ],
      ['.', 'baz', '[_,]', [[2, 1], '.', 'id']],
      ['.', 'name'],
    ]
    assert.deepEqual(parseArray(this.test.title, 1)[0], out)
  })
})
