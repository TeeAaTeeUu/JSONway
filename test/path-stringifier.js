import { assert } from 'chai'

import JSONway from '../index.js'
import { stringifyPath } from '../lib/path-stringifier.js'

describe('path-stringifier', () => {
  it('stringifyPath does nothing if not path-array', function () {
    const input = 'ab.cd'

    assert.deepEqual(stringifyPath(input), input)
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
  ]

  /* eslint-disable mocha/no-setup-in-describe */
  expressions.forEach(expression => {
    //
    it(expression, function () {
      const input = JSONway.parse(this.test.title)
      assert.deepEqual(stringifyPath(input), this.test.title)
    })
  })
  /* eslint-enable mocha/no-setup-in-describe */
})
