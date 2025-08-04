import { assert } from 'chai'

import JSONway from '../index.js'

describe('path-stringifier', () => {
  it('stringifyPath does nothing if not path-array', function () {
    const input = 'ab.cd'

    assert.deepEqual(JSONway.stringifyPath(input), input)
  })

  it(`["ab", "cd"]`, function () {
    const input = JSON.parse(this.test.title)
    const out = 'ab.cd'

    assert.deepEqual(JSONway.stringifyPath(input), out)
  })

  it(`["ab", 0]`, function () {
    const input = JSON.parse(this.test.title)
    const out = 'ab[0]'

    assert.deepEqual(JSONway.stringifyPath(input), out)
  })

  it(`["foo", "bar", 1, "baz", "[qee[].0]", "o][]]"]`, function () {
    const input = JSON.parse(this.test.title)
    const out = `foo.bar[1].baz['[qee[].0]']['o][]]']`

    assert.deepEqual(JSONway.stringifyPath(input), out)
  })

  it(`["foo", "bar", "%[]%"]`, function () {
    const input = JSON.parse(this.test.title)
    const out = `foo.bar[]`

    assert.deepEqual(JSONway.stringifyPath(input), out)
  })

  it(`["foo", "bar", "%[+]%"]`, function () {
    const input = JSON.parse(this.test.title)
    const out = `foo.bar[+]`

    assert.deepEqual(JSONway.stringifyPath(input), out)
  })

  it(`["foo", "bar", "%[*]%"]`, function () {
    const input = JSON.parse(this.test.title)
    const out = `foo.bar[*]`

    assert.deepEqual(JSONway.stringifyPath(input), out)
  })

  it(`["foo", "bar", 0, "baz", "%[]%", "%[]%", "id"]`, function () {
    const input = JSON.parse(this.test.title)
    const out = `foo.bar[0].baz[][].id`

    assert.deepEqual(JSONway.stringifyPath(input), out)
  })

  it(`["a", { "rule": [["c"], "=", "y"] }, "b"]`, function () {
    const input = JSON.parse(this.test.title)
    const out = `a(c = 'y').b`

    assert.deepEqual(JSONway.stringifyPath(input), out)
  })

  it('["foo", "bar", "%[]%", [["id", "name"], [["id"], ["name"]]]]', function () {
    const input = JSON.parse(this.test.title)
    const out = 'foo.bar[]{id,name}'

    assert.deepEqual(JSONway.stringifyPath(input), out)
  })
})
