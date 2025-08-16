import { assert } from 'chai'

import JSONway from '../index.js'

describe('path-stringifier', () => {
  it('stringifyPath does nothing if not path-array', function () {
    const input = 'ab.cd'

    assert.deepEqual(JSONway.stringifyPath(input), input)
  })

  it('ab.cd', function () {
    const input = JSONway.parse(this.test.title)
    assert.deepEqual(JSONway.stringifyPath(input), this.test.title)
  })

  it('ab[0]', function () {
    const input = JSONway.parse(this.test.title)
    assert.deepEqual(JSONway.stringifyPath(input), this.test.title)
  })

  it(`foo.bar[1].baz['[qee[].0]']['o][]]']`, function () {
    const input = JSONway.parse(this.test.title)
    assert.deepEqual(JSONway.stringifyPath(input), this.test.title)
  })

  it('foo.bar[]', function () {
    const input = JSONway.parse(this.test.title)
    assert.deepEqual(JSONway.stringifyPath(input), this.test.title)
  })

  it('foo.bar[=]', function () {
    const input = JSONway.parse(this.test.title)
    assert.deepEqual(JSONway.stringifyPath(input), this.test.title)
  })

  it('foo.bar[*]', function () {
    const input = JSONway.parse(this.test.title)
    assert.deepEqual(JSONway.stringifyPath(input), this.test.title)
  })

  it('foo.bar[5,3,7].baz.id', function () {
    const input = JSONway.parse(this.test.title)
    assert.deepEqual(JSONway.stringifyPath(input), this.test.title)
  })

  it('bb[#].ee[].hh[].dd', function () {
    const input = JSONway.parse(this.test.title)
    assert.deepEqual(JSONway.stringifyPath(input), this.test.title)
  })

  it('foo.bar[0].baz[][].id', function () {
    const input = JSONway.parse(this.test.title)
    assert.deepEqual(JSONway.stringifyPath(input), this.test.title)
  })

  it(`a(c = 'y').b`, function () {
    const input = JSONway.parse(this.test.title)
    assert.deepEqual(JSONway.stringifyPath(input), this.test.title)
  })

  it('foo.bar[]{id,name}', function () {
    const input = JSONway.parse(this.test.title)
    assert.deepEqual(JSONway.stringifyPath(input), this.test.title)
  })
})
