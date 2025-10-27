import { assert } from 'chai'

import JSONway from '../index.js'

describe('path-stringifier', () => {
  it('stringifyPath does nothing if not path-array', function () {
    const input = 'ab.cd'

    assert.deepEqual(JSONway.stringify(input), input)
  })

  const expressions = [
    'ab.cd',
    'ab[0]',
    'ab[c.d]',
    `ab['fo''o']`,
    `foo.bar[1].baz['[qee[].0]']['o][]]']`,
    'foo.bar[]',
    'foo.bar[=]',
    'foo.bar[*]',
    'foo.bar[5,3,7].baz.id',
    'bb[#].ee[].hh[].dd',
    'foo.bar[0].baz[][].id',
    `a(c = 'y').b`,
    'foo.bar[]{id,name}',
    'foo.bar[]{id: key, name}',
    'foo.bar[]{id: id.key = x, name = 10}',
    'foo.bar3',
    'foo[baz 3]',
    'foo[baz.3]',
    'foo.bar',
    'foo[bar.]',
    `foo['bar
      baz']`,
    "foo['bar\nbaz']",
    "foo.bar[' baz 3']",
    "foo['bar''baz']",
    "foo['baz]3']",
    "foo['baz[3']",
    `foo['baz"3']`,
    `foo['baz,3']`,
    'ab[==]',
    'ab[>]',
    'ab.<',
    'ab.!',
    `ab['|']`,
  ]

  /* eslint-disable mocha/no-setup-in-describe */
  expressions.forEach(expression => {
    //
    it(expression, function () {
      const input = JSONway.parse(this.test.title)
      assert.deepEqual(JSONway.stringify(input), this.test.title)
    })
  })
  /* eslint-enable mocha/no-setup-in-describe */
})
