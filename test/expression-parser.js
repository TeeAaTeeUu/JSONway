import { assert } from 'chai'

import JSONway from '../index.js'

describe('expression-parser', () => {
  it(`ab.cd='foo'`, function () {
    const out = [['.', 'ab', '.', 'cd'], '=', 'foo']
    assert.deepEqual(JSONway.parseExpression(this.test.title), out)
  })

  it('ab.cd!=12', function () {
    const out = [['.', 'ab', '.', 'cd'], '!=', 12]
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
      out,
      this.test.title.length,
    ])
  })

  it(`c='y'`, function () {
    const out = [['.', 'c'], '=', 'y']
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [out, 5])
  })

  it(`c='y''d'`, function () {
    const out = [['.', 'c'], '=', "y'd"]
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [out, 8])
  })

  it('c="y"', function () {
    const out = [['.', 'c'], '=', 'y']
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [out, 5])
  })

  it('c="y""d"', function () {
    const out = [['.', 'c'], '=', 'y"d']
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [out, 8])
  })

  it('ab.cd>12', function () {
    const out = [['.', 'ab', '.', 'cd'], '>', 12]
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
      out,
      this.test.title.length,
    ])
  })

  it('ab.cd<12', function () {
    const out = [['.', 'ab', '.', 'cd'], '<', 12]
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
      out,
      this.test.title.length,
    ])
  })

  it('ab.cd<=12', function () {
    const out = [['.', 'ab', '.', 'cd'], '<=', 12]
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
      out,
      this.test.title.length,
    ])
  })

  it('ab.cd>=12', function () {
    const out = [['.', 'ab', '.', 'cd'], '>=', 12]
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
      out,
      this.test.title.length,
    ])
  })

  it('15 % 12', function () {
    const out = [15, '%', 12]
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0)[0], out)
  })

  it(`ab.cd ~= 'foo'`, function () {
    const out = [['.', 'ab', '.', 'cd'], '~=', 'foo']
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
      out,
      this.test.title.length,
    ])
  })

  it('>=12', function () {
    const out = ['>=', 12]
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
      out,
      this.test.title.length,
    ])

    const input = ' \t\n\f >= 12 '
    assert.deepEqual(JSONway.parseExpression(input), out)
  })

  it('=[0,2]', function () {
    const out = ['=', '[', [0, 2]]
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
      out,
      this.test.title.length,
    ])
  })

  it(`5>3`, function () {
    const out = [5, '>', 3]
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
      out,
      this.test.title.length,
    ])
  })

  it(`[0]='xx'`, function () {
    const out = [['1', 0], '=', 'xx']
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
      out,
      this.test.title.length,
    ])
  })

  // TODO: differentiate operators from strings
  it(`a = '='`, function () {
    const out = [['.', 'a'], '=', '=']
    assert.deepEqual(JSONway.parseExpression(this.test.title), out)
  })

  it('>=12 && foo[0][bar]', function () {
    const out = ['>=', 12, '&&', ['.', 'foo', '1', 0, '.', 'bar']]
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
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
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
      out,
      this.test.title.length,
    ])
  })

  it('ab>12 |cd !=10', function () {
    const out = [['.', 'ab'], '>', 12, '||', '(', [['.', 'cd'], '!=', 10]]
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
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
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
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
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
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
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
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
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
      out,
      this.test.title.length,
    ])
  })

  it('ab.cd>12 | cd !=10', function () {
    const out = [
      ['.', 'ab', '.', 'cd'],
      '>',
      12,
      '||',
      '(',
      [['.', 'cd'], '!=', 10],
    ]
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
      out,
      this.test.title.length,
    ])
  })

  it('>=12 && foo[0][bar', function () {
    const out = ['>=', 12, '&&', ['.', 'foo', '1', 0, '.', 'bar']]
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
      out,
      this.test.title.length,
    ])
  })

  it(`'x'?`, function () {
    const out = ['x', '?']
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
      out,
      this.test.title.length,
    ])
  })

  it('ab > [1, cd', function () {
    const out = [['.', 'ab'], '>', '[', [1, ['.', 'cd']]]
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
      out,
      this.test.title.length,
    ])
  })

  it(`c[].d='a2'`, function () {
    const out = [['.', 'c', '[]', ['.', 'd']], '=', 'a2']
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
      out,
      this.test.title.length,
    ])
  })

  it('ab > [1, cd[ef], true]', function () {
    const out = [['.', 'ab'], '>', '[', [1, ['.', 'cd', '.', 'ef'], true]]
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
      out,
      this.test.title.length,
    ])
  })

  it('ab - 10 -', function () {
    const out = [['.', 'ab'], '-', 10, '-']
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
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
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
      out,
      this.test.title.length,
    ])
  })

  it('(ab.cd: 12, cd[ab]: 13).bar', function () {
    const out = [
      ['.', 'ab', '.', 'cd'],
      '=',
      12,
      '&&',
      '(',
      [['.', 'cd', '.', 'ab'], '=', 13],
    ]
    assert.deepEqual(JSONway.parseExpression(this.test.title, 1), [
      out,
      this.test.title.length - 5,
    ])
  })

  it('ab.cd === 12 & cd[ab] == 13', function () {
    const out = [
      ['.', 'ab', '.', 'cd'],
      '=',
      12,
      '&&',
      '(',
      [['.', 'cd', '.', 'ab'], '=', 13],
    ]
    assert.deepEqual(JSONway.parseExpression(this.test.title), out)

    const input = this.test.title.replaceAll(' ', '')
    assert.deepEqual(JSONway.parseExpression(input), out)
  })

  it('ab.cd !== 12 , cd[ab] != 13', function () {
    const out = [
      ['.', 'ab', '.', 'cd'],
      '!=',
      12,
      '&&',
      '(',
      [['.', 'cd', '.', 'ab'], '!=', 13],
    ]
    assert.deepEqual(JSONway.parseExpression(this.test.title), out)

    const input = this.test.title.replaceAll(' ', '')
    assert.deepEqual(JSONway.parseExpression(input), out)
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
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
      out,
      this.test.title.length,
    ])
  })

  it('7 + 10 - 2 > (12 + 5)', function () {
    const out = [7, '+', 10, '-', 2, '>', '(', [12, '+', 5]]
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
      out,
      this.test.title.length,
    ])
  })

  it('7 + 10 - 5 + 1 + (-5 - 3 + 1) + 3', function () {
    const out = [
      7,
      '+',
      10,
      '-',
      5,
      '+',
      1,
      '+',
      '(',
      [-5, '-', 3, '+', 1],
      '+',
      3,
    ]

    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
      out,
      this.test.title.length,
    ])
  })

  it.skip('7 + 10 - 2 > 12 + 5', function () {
    const out = [7, '+', 10, '-', 2, '>', '(', [12, '+', 5]]
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
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
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
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
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
      out,
      this.test.title.length,
    ])
  })

  it('!(ab.cd > 10)', function () {
    const out = ['!', '(', [['.', 'ab', '.', 'cd'], '>', 10]]
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
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
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
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
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
      out,
      this.test.title.length,
    ])
  })

  it('ab = [] && d.b != $', function () {
    const out = [
      ['.', 'ab'],
      '=',
      ['[]', []],
      '&&',
      '(',
      [['.', 'd', '.', 'b'], '!=', '$'],
    ]
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
      out,
      this.test.title.length,
    ])
  })

  it('[].a = [].c && d.b != $', function () {
    const out = [
      ['[]', ['.', 'a']],
      '=',
      ['[]', ['.', 'c']],
      '&&',
      '(',
      [['.', 'd', '.', 'b'], '!=', '$'],
    ]
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
      out,
      this.test.title.length,
    ])
  })

  it('(ab = 10 && cd?)', function () {
    const out = ['(', [['.', 'ab'], '=', 10, '&&', '(', [['.', 'cd'], '?']]]
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
      out,
      this.test.title.length,
    ])
  })

  it('((ab = 10 && ((cd?))))', function () {
    const out = [
      '(',
      ['(', [['.', 'ab'], '=', 10, '&&', '(', ['(', [['.', 'cd'], '?']]]],
    ]
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
      out,
      this.test.title.length,
    ])
  })

  it('ab + 2', function () {
    const out = [['.', 'ab'], '+', 2]
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
      out,
      this.test.title.length,
    ])
  })

  it('ab ++ 2', function () {
    const out = [['.', 'ab'], '+', '+', 2]
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
      out,
      this.test.title.length,
    ])
  })

  it('ab - 2', function () {
    const out = [['.', 'ab'], '-', 2]
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
      out,
      this.test.title.length,
    ])
  })

  it('ab / 2', function () {
    const out = [['.', 'ab'], '/', 2]
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
      out,
      this.test.title.length,
    ])
  })

  it('ab * 2', function () {
    const out = [['.', 'ab'], '*', 2]
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
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
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
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
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
      out,
      this.test.title.length,
    ])
  })

  it(`ab.cd='foo && ab?`, function () {
    const out = [['.', 'ab', '.', 'cd'], '=', 'foo && ab?']
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
      out,
      this.test.title.length,
    ])
  })

  it('ab > ef (cd / 2)', function () {
    const out = [
      ['.', 'ab'],
      '>',
      ['.', 'ef'],
      '&&',
      '(',
      [['.', 'cd'], '/', 2],
    ]
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
      out,
      this.test.title.length,
    ])
  })

  it('ab > (cd / 2)', function () {
    const out = [['.', 'ab'], '>', '(', [['.', 'cd'], '/', 2]]
    assert.deepEqual(JSONway.parseExpression(this.test.title), out)

    const input = '\n\f ab \n\t\f > \n\f ( \n\f cd \n\f / 2 \n\f) \n\f'
    assert.deepEqual(JSONway.parseExpression(input), out)
  })

  it('ab? && (cd?)', function () {
    const out = [['.', 'ab'], '?', '&&', '(', [['.', 'cd'], '?']]
    assert.deepEqual(JSONway.parseExpression(this.test.title), out)

    const input = 'ab? && (cd? \n\f)'
    assert.deepEqual(JSONway.parseExpression(input), out)
  })

  it('!(10 > ab)', function () {
    const out = ['!', '(', [10, '>', ['.', 'ab']]]
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
      out,
      this.test.title.length,
    ])
  })

  it('aa || bb || 15', function () {
    const out = [['.', 'aa'], '||', ['.', 'bb'], '||', 15]
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
      out,
      this.test.title.length,
    ])
  })

  it('aa ?| bb |? cc ?? 15', function () {
    const out = [
      '?|',
      [['.', 'aa'], '?|', ['.', 'bb'], '?|', ['.', 'cc'], '?|', 15],
    ]
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
      out,
      this.test.title.length,
    ])
  })

  it(`(
    aa ?|
    bb
    |? cc ??
    15
    )`, function () {
    const out = [
      '?|',
      [['.', 'aa'], '?|', ['.', 'bb'], '?|', ['.', 'cc'], '?|', 15],
    ]
    assert.deepEqual(JSONway.parseExpression(this.test.title, 1), [
      out,
      this.test.title.length - 1,
    ])
  })

  it(`(
      aa.bb = 'xx'
    )`, function () {
    const out = [['.', 'aa', '.', 'bb'], '=', 'xx']
    assert.deepEqual(JSONway.parseExpression(this.test.title, 1), [
      out,
      this.test.title.length - 1,
    ])
  })

  // TODO: find a better way to handle incorrect operators and spacing
  it('5 # 15', function () {
    const out = [['.', '5#15']]
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
      out,
      this.test.title.length,
    ])
  })

  it(`c[~&d!][>][2]='y'`, function () {
    const out = [['.', 'c', '.', '~&d!', '.', '>', '1', 2], '=', 'y']
    assert.deepEqual(JSONway.parseExpression(this.test.title, 0), [
      out,
      this.test.title.length,
    ])
  })

  it('a => max / b =| min * a |> size', function () {
    const out = [
      ['.', 'a', '|', [true, ['.', 'max']]],
      '/',
      ['.', 'b', '|', [true, ['.', 'min']]],
      '*',
      ['.', 'a', '|', [true, ['.', 'size']]],
    ]
    assert.deepEqual(JSONway.parseExpression(this.test.title), out)
  })
})
