import { assert } from 'chai'
import { stringifyExpression } from '../lib/expression-stringifier.js'
import JSONway from '../index.js'

describe('expression-stringifier', () => {
  it('stringifyExpression does nothing if not path-array', function () {
    const input = '5 > 10'

    assert.deepEqual(stringifyExpression(input), input)
  })

  const expressions = [
    'ab.cd != 12',
    `ab[0] > 'foo'`,
    'ab.cd > 12 && (cd != 10)',
    `ab.cd = 12 || (cd.ab != 13) && (ba.dc = 'foo') && (ba.dc != ab.cd)`,
    `ab = [1, 'a', 0, b] && (d.b != ['error', false, null, ab.cd])`,
    '7 + 10 - 2 > 12',
    '7 + 10 - 5 + 1 + (-5 - 3 * 1) + 3',
    'ab.cd = 12 && (cd.ab = 13)',
    'ab.cd = 12 || (cd.ab != 13)',
    `x ~= 'bar'`,
    'x = $ || (y = $)',
    '15 >= [11, 17, 20]',
    `c[].d = 'a2'`,
    `'bfoor' ~= ['baz', 'bar', 'foo']`,
    'aa ?| bb ?| cc ?| 15',
    '?',
    '> 15',
    `aa.bb.cc = 'xx' && (dd.ee[0].ff = ['gg', 'hh'])`,
  ]

  /* eslint-disable mocha/no-setup-in-describe */
  expressions.forEach(expression => {
    //
    it(expression, function () {
      const input = JSONway.parseExpression(this.test.title)[0]
      assert.deepEqual(stringifyExpression(input), this.test.title)
    })
  })
  /* eslint-enable mocha/no-setup-in-describe */
})
