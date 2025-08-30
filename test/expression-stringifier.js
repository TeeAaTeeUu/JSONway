import { assert } from 'chai'
import { stringifyExpression } from '../lib/expression-stringifier.js'

describe('expression-stringifier', () => {
  it('stringifyExpression does nothing if not path-array', function () {
    const input = '5 > 10'

    assert.deepEqual(stringifyExpression(input), input)
  })

  it(`[[".", "ab", ".", "cd"], "!=", 12]`, function () {
    const input = JSON.parse(this.test.title)
    const out = 'ab.cd != 12'

    assert.deepEqual(stringifyExpression(input), out)
  })

  it(`[[".", "ab", "1",  0], ">", "foo"]`, function () {
    const input = JSON.parse(this.test.title)
    const out = `ab[0] > 'foo'`

    assert.deepEqual(stringifyExpression(input), out)
  })

  it(`[[".", "ab", ".", "cd"], ">", 12, "&&", "(", [[".", "cd"], "!=", 10]]`, function () {
    const input = JSON.parse(this.test.title)
    const out = 'ab.cd > 12 && (cd != 10)'

    assert.deepEqual(stringifyExpression(input), out)
  })

  it(`ab.cd = 12 || (cd.ab != 13) && (ba.dc = 'foo') && (ba.dc != ab.cd)`, function () {
    const input = [
      ['.', 'ab', '.', 'cd'],
      '=',
      12,
      '||',
      '(',
      [['.', 'cd', '.', 'ab'], '!=', 13],
      '&&',
      '(',
      [['.', 'ba', '.', 'dc'], '=', 'foo'],
      '&&',
      '(',
      [['.', 'ba', '.', 'dc'], '!=', ['.', 'ab', '.', 'cd']],
    ]

    assert.deepEqual(stringifyExpression(input), this.test.title)
  })

  it(`ab = [1, 'a', 0, b] && (d.b != ['error', false, null, ab.cd])`, function () {
    const input = [
      ['.', 'ab'],
      '=',
      '[',
      [1, 'a', 0, ['.', 'b']],
      '&&',
      '(',
      [
        ['.', 'd', '.', 'b'],
        '!=',
        '[',
        ['error', false, null, ['.', 'ab', '.', 'cd']],
      ],
    ]

    assert.deepEqual(stringifyExpression(input), this.test.title)
  })
})
