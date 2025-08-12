import { assert } from 'chai'

import JSONway from '../index.js'

describe('expression-parser', () => {
  it(`ab.cd='foo'`, function () {
    const out = [['.', 'ab', '.', 'cd'], '=', 'foo']
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it('ab.cd!=12', function () {
    const out = [['.', 'ab', '.', 'cd'], '!=', 12]
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it(`c='y'`, function () {
    const out = [['.', 'c'], '=', 'y']
    assert.deepEqual(JSONway.parseExpression(this.test.title), [out, 5])
  })

  it('ab.cd>12', function () {
    const out = [['.', 'ab', '.', 'cd'], '>', 12]
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it('ab.cd<12', function () {
    const out = [['.', 'ab', '.', 'cd'], '<', 12]
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it('ab.cd<=12', function () {
    const out = [['.', 'ab', '.', 'cd'], '<=', 12]
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it('ab.cd>=12', function () {
    const out = [['.', 'ab', '.', 'cd'], '>=', 12]
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it(`ab.cd~='foo'`, function () {
    const out = [['.', 'ab', '.', 'cd'], '~=', 'foo']
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it('>=12', function () {
    const out = ['>=', 12]
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it('=[0,2]', function () {
    const out = ['=', '[', [0, 2]]
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it(`5>3`, function () {
    const out = [5, '>', 3]
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it.skip(`.[0]='xx'`, function () {
    const out = ['.', 0, '=', 'xx']
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it('>=12 && foo[0][bar]', function () {
    const out = ['>=', 12, '&&', ['.', 'foo', '1', 0, '.', 'bar']]
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it('ab.cd>12 &cd !=10', function () {
    const out = [
      ['.', 'ab', '.', 'cd'],
      '>',
      12,
      '&&',
      '(',
      [['.', 'cd'], '!=', 10],
    ]
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it('ab>12 |cd !=10', function () {
    const out = [['.', 'ab'], '>', 12, '||', '(', [['.', 'cd'], '!=', 10]]
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it('ab.cd>12 &= cd !=10', function () {
    const out = [
      ['.', 'ab', '.', 'cd'],
      '>',
      12,
      '&&',
      '(',
      ['=', ['.', 'cd'], '!=', 10],
    ]
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it('ab.cd>12 =& cd !=10', function () {
    const out = [
      ['.', 'ab', '.', 'cd'],
      '>',
      12,
      '=',
      '&&',
      '(',
      [['.', 'cd'], '!=', 10],
    ]
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it('ab.cd>12 |& cd !=10', function () {
    const out = [
      ['.', 'ab', '.', 'cd'],
      '>',
      12,
      '||',
      '&&',
      '(',
      [['.', 'cd'], '!=', 10],
    ]
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it('ab.cd>12 &| cd !=10', function () {
    const out = [
      ['.', 'ab', '.', 'cd'],
      '>',
      12,
      '&&',
      '||',
      '(',
      [['.', 'cd'], '!=', 10],
    ]
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it('ab.cd>12 |> cd !=10', function () {
    const out = [
      ['.', 'ab', '.', 'cd'],
      '>',
      12,
      '||',
      '(',
      ['>', ['.', 'cd'], '!=', 10],
    ]
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it('>=12 && foo[0][bar', function () {
    const out = ['>=', 12, '&&', ['.', 'foo', '1', 0, '.', 'bar']]
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it('ab > [1, cd', function () {
    const out = [['.', 'ab'], '>', '[', [1, ['.', 'cd']]]
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it(`c[].d='a2'`, function () {
    const out = [['.', 'c', '[]', '.', 'd'], '=', 'a2']
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it('ab > [1, cd[ef], true]', function () {
    const out = [['.', 'ab'], '>', '[', [1, ['.', 'cd', '.', 'ef'], true]]
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it('ab.cd=12 && cd[ab] != 13', function () {
    const out = [
      ['.', 'ab', '.', 'cd'],
      '=',
      12,
      '&&',
      '(',
      [['.', 'cd', '.', 'ab'], '!=', 13],
    ]
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it('ab.cd=12 || cd.ab != 13', function () {
    const out = [
      ['.', 'ab', '.', 'cd'],
      '=',
      12,
      '||',
      '(',
      [['.', 'cd', '.', 'ab'], '!=', 13],
    ]
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it('7 + 10 - 2 > (12 + 5)', function () {
    const out = [7, '+', 10, '-', 2, '>', '(', [12, '+', 5]]
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it.skip('7 + 10 - 2 > 12 + 5', function () {
    const out = [7, '+', 10, '-', 2, '>', '(', [12, '+', 5]]
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it(`ab.cd=12 || cd.ab != 13 && ba.dc = 'foo' && ba.dc!=ab.cd`, function () {
    const out = [
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
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it('ab.cd=12 || (ef.gh != 13 && ij.kl > 20)', function () {
    const out = [
      ['.', 'ab', '.', 'cd'],
      '=',
      12,
      '||',
      '(',
      [
        ['.', 'ef', '.', 'gh'],
        '!=',
        13,
        '&&',
        '(',
        [['.', 'ij', '.', 'kl'], '>', 20],
      ],
    ]
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it('!(ab.cd > 10)', function () {
    const out = ['!', '(', [['.', 'ab', '.', 'cd'], '>', 10]]
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it(`ab.cd=12 || (cd.ab != 13 && ba.dc = 'foo' || c?) && a=b || ((c='d' || x.d = $) || (e=0&&d=true))`, function () {
    const out = [
      ['.', 'ab', '.', 'cd'],
      '=',
      12,
      '||',
      '(',
      [
        ['.', 'cd', '.', 'ab'],
        '!=',
        13,
        '&&',
        '(',
        [['.', 'ba', '.', 'dc'], '=', 'foo'],
        '||',
        '(',
        [['.', 'c'], '?'],
      ],
      '&&',
      '(',
      [['.', 'a'], '=', ['.', 'b']],
      '||',
      '(',
      [
        '(',
        [['.', 'c'], '=', 'd', '||', '(', [['.', 'x', '.', 'd'], '=', '$']],
        '||',
        '(',
        [['.', 'e'], '=', 0, '&&', '(', [['.', 'd'], '=', true]],
      ],
    ]
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it(`ab = [1, 'a', 0, b] && d.b != ['error', false, null, ab.cd]`, function () {
    const out = [
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
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it('ab = [] && d.b != $', function () {
    const out = [
      ['.', 'ab'],
      '=',
      '[',
      [],
      '&&',
      '(',
      [['.', 'd', '.', 'b'], '!=', '$'],
    ]
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it('(ab = 10 && cd?)', function () {
    const out = ['(', [['.', 'ab'], '=', 10, '&&', '(', [['.', 'cd'], '?']]]
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it('((ab = 10 && ((cd?))))', function () {
    const out = [
      '(',
      ['(', [['.', 'ab'], '=', 10, '&&', '(', ['(', [['.', 'cd'], '?']]]],
    ]
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it('ab + 2', function () {
    const out = [['.', 'ab'], '+', 2]
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it('ab ++ 2', function () {
    const out = [['.', 'ab'], '+', '+', 2]
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it('ab - 2', function () {
    const out = [['.', 'ab'], '-', 2]
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it('ab / 2', function () {
    const out = [['.', 'ab'], '/', 2]
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it('ab * 2', function () {
    const out = [['.', 'ab'], '*', 2]
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it('(ab.cd >= 20 && (ab.cd / 2)) || (ab.cd >= 10 && ab.cd) || 10', function () {
    const out = [
      '(',
      [
        ['.', 'ab', '.', 'cd'],
        '>=',
        20,
        '&&',
        '(',
        [['.', 'ab', '.', 'cd'], '/', 2],
      ],
      '||',
      '(',
      [['.', 'ab', '.', 'cd'], '>=', 10, '&&', ['.', 'ab', '.', 'cd']],
      '||',
      10,
    ]
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it('ab + 2 + cd.ab - cd.ef', function () {
    const out = [
      ['.', 'ab'],
      '+',
      2,
      '+',
      ['.', 'cd', '.', 'ab'],
      '-',
      ['.', 'cd', '.', 'ef'],
    ]
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it(`ab.cd='foo && ab?`, function () {
    const out = [['.', 'ab', '.', 'cd'], '=', 'foo && ab?']
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it('ab > round(cd / 2)', function () {
    const out = [
      ['.', 'ab'],
      '>',
      { func: 'round' },
      '(',
      [['.', 'cd'], '/', 2],
    ]
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it('!(10 > ab)', function () {
    const out = ['!', '(', [10, '>', ['.', 'ab']]]
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })

  it.skip(`c[~&d!][>][2]='y'`, function () {
    const out = [['c', '~&d!', '>'], 2, '=', 'y']
    assert.deepEqual(JSONway.parseExpression(this.test.title), [
      out,
      this.test.title.length,
    ])
  })
})
