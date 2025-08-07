import { assert } from 'chai'

import JSONway from '../index.js'

describe('parser', () => {
  it('foo', function () {
    const out = ['foo']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('1', function () {
    const out = [1]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('[]', function () {
    const out = [true, '%[]%']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('[+]', function () {
    const out = [true, '%[+]%']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('[*]', function () {
    const out = [true, '%[*]%']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo.bar.baz', function () {
    const out = ['foo', 'bar', 'baz']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo[3]', function () {
    const out = ['foo', 3]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo[-2]', function () {
    const out = ['foo', -2]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo.bar[]', function () {
    const out = ['foo', 'bar', true, '%[]%']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo.bar[].baz', function () {
    const out = ['foo', 'bar', true, '%[]%', 'baz']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`foo['bar'][].baz`, function () {
    const out = ['foo', 'bar', true, '%[]%', 'baz']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`foo.bar[1].baz['[qee[].0]']['o][]]']`, function () {
    const out = ['foo', 'bar', 1, 'baz', '[qee[].0]', 'o][]]']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo.bar[baz[gee][]', function () {
    const out = ['foo', 'bar', 'baz[gee', true, '%[]%']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`foo['{bar}'].baz['{a{(c)']`, function () {
    const out = ['foo', '{bar}', 'baz', '{a{(c)']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo[bar.a].baz[}b{}}.}c}]', function () {
    const out = ['foo', 'bar.a', 'baz', '}b{}}.}c}']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('[,foo,.,bar,].baz', function () {
    const out = [',foo,.,bar,', 'baz']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`foo[bar.a][5]['{a}']`, function () {
    const out = ['foo', 'bar.a', 5, '{a}']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`foo[}[bar}.a}][5]['{a.[}`, function () {
    const out = ['foo', '}[bar}.a}', 5, '{a.[}']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo[bar.a][5][a.{}[b.[.c]', function () {
    const out = ['foo', 'bar.a', 5, 'a.{}[b.[.c']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo.bar[1][quu].baz[qee][aa].0.b[1]', function () {
    const out = ['foo', 'bar', 1, 'quu', 'baz', 'qee', 'aa', '0', 'b', 1]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo[1][0][2].bar[baz]', function () {
    const out = ['foo', 1, 0, 2, 'bar', 'baz']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo.bar[0].baz[][].id', function () {
    const out = ['foo', 'bar', 0, 'baz', true, '%[]%', true, '%[]%', 'id']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo[1][].id', function () {
    const out = ['foo', 1, true, '%[]%', 'id']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo{bar}', function () {
    const out = ['foo', { multi: [['bar'], [['bar']]] }]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo{bar,baz}', function () {
    const out = [
      'foo',
      {
        multi: [
          ['bar', 'baz'],
          [['bar'], ['baz']],
        ],
      },
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  // TODO: add this also for tabletizer
  it('foo{bar,baz=4}', function () {
    const out = [
      'foo',
      {
        multi: [
          ['bar', 'baz=4'],
          [['bar'], ['baz']],
          [undefined, 4],
        ],
      },
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo{bar=a,baz=5}{bb,cc}', function () {
    const out = [
      'foo',
      {
        multi: [
          ['bar=a', 'baz=5'],
          [['bar'], ['baz']],
          ['a', 5],
        ],
      },
      {
        multi: [
          ['bb', 'cc'],
          [['bb'], ['cc']],
        ],
      },
    ]

    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo{bar,baz}.bar', function () {
    const out = [
      'foo',
      {
        multi: [
          ['bar', 'baz'],
          [['bar'], ['baz']],
        ],
      },
      'bar',
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo{bar}.bar', function () {
    const out = ['foo', { multi: [['bar'], [['bar']]] }, 'bar']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('{bar,baz}', function () {
    const out = [
      {
        multi: [
          ['bar', 'baz'],
          [['bar'], ['baz']],
        ],
      },
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo.bar[]{id,name}', function () {
    const out = [
      'foo',
      'bar',
      true,
      '%[]%',
      {
        multi: [
          ['id', 'name'],
          [['id'], ['name']],
        ],
      },
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo[]{id,list[]}', function () {
    const out = [
      'foo',
      true,
      '%[]%',
      {
        multi: [
          ['id', 'list[]'],
          [['id'], ['list', true, '%[]%']],
        ],
      },
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo{bar.id,baz[].value.max}', function () {
    const out = [
      'foo',
      {
        multi: [
          ['bar.id', 'baz[].value.max'],
          [
            ['bar', 'id'],
            ['baz', true, '%[]%', 'value', 'max'],
          ],
        ],
      },
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo{id,bar.id,baz[],qee[].id}', function () {
    const out = [
      'foo',
      {
        multi: [
          ['id', 'bar.id', 'baz[]', 'qee[].id'],
          [
            ['id'],
            ['bar', 'id'],
            ['baz', true, '%[]%'],
            ['qee', true, '%[]%', 'id'],
          ],
        ],
      },
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo{ id : id.key, foo, bur:bar.bur }', function () {
    const out = [
      'foo',
      {
        multi: [
          ['id', 'foo', 'bur'],
          [['id', 'key'], ['foo'], ['bar', 'bur']],
        ],
      },
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo[{bar.bur[*].b, foo, bar.bur[].a}]', function () {
    const out = [
      'foo',
      {
        table: [
          ['bar.bur[0].b', ['bar', 'bur', true, '%[*]%', 'b'], true],
          ['foo', ['foo'], false],
          ['bar.bur[0].a', ['bar', 'bur', true, '%[]%', 'a'], false],
        ],
      },
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`foo[{bur: foo, bar.bur[*].a, 'bar[+].b': bar.bur[].b}]`, function () {
    const out = [
      'foo',
      {
        table: [
          ['bar.bur[0].a', ['bar', 'bur', true, '%[*]%', 'a'], true],
          ['bur', ['foo'], false],
          ['bar[+].b', ['bar', 'bur', true, '%[]%', 'b'], false],
        ],
      },
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo[{a.d[].c[].f, a.d[].g, a.b[].c[].e[], a.b[].g}]', function () {
    const out = [
      'foo',
      {
        table: [
          ['a.b[].g', ['a', 'b', true, '%[]%', 'g'], false],
          [
            'a.b[].c[].e[]',
            ['a', 'b', true, '%[]%', 'c', true, '%[]%', 'e', true, '%[]%'],
            false,
          ],
          ['a.d[].g', ['a', 'd', true, '%[]%', 'g'], false],
          [
            'a.d[].c[].f',
            ['a', 'd', true, '%[]%', 'c', true, '%[]%', 'f'],
            false,
          ],
        ],
      },
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('sub.ba[][1][][ba,z][]{c,d}', function () {
    const out = [
      'sub',
      'ba',
      true,
      '%[]%',
      1,
      true,
      '%[]%',
      'ba,z',
      true,
      '%[]%',
      {
        multi: [
          ['c', 'd'],
          [['c'], ['d']],
        ],
      },
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo.bar[+]{id,name,}', function () {
    const out = [
      'foo',
      'bar',
      true,
      '%[+]%',
      {
        multi: [
          ['id', 'name'],
          [['id'], ['name']],
        ],
      },
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('bar[+][*].id', function () {
    const out = ['bar', true, '%[+]%', true, '%[*]%', 'id']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('bar[#].id', function () {
    const out = ['bar', true, '%[#]%', 'id']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('bar[:#].id', function () {
    const out = ['bar', true, '%[:#]%', 'id']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('bar[#:].id', function () {
    const out = ['bar', true, '%[:#]%', 'id']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('bar[][+]{id,,,,}', function () {
    const out = [
      'bar',
      true,
      '%[]%',
      true,
      '%[+]%',
      { multi: [['id'], [['id']]] },
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo{id{value,name}}', function () {
    const out = [
      'foo',
      {
        multi: [
          ['id{value,name}'],
          [
            [
              'id',
              {
                multi: [
                  ['value', 'name'],
                  [['value'], ['name']],
                ],
              },
            ],
          ],
        ],
      },
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo{id{value}}', function () {
    const out = [
      'foo',
      {
        multi: [
          ['id{value}'],
          [
            [
              'id',
              {
                multi: [['value'], [['value']]],
              },
            ],
          ],
        ],
      },
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo{name,id{value}}', function () {
    const out = [
      'foo',
      {
        multi: [
          ['name', 'id{value}'],
          [
            ['name'],
            [
              'id',
              {
                multi: [['value'], [['value']]],
              },
            ],
          ],
        ],
      },
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo{name{value},,id}', function () {
    const out = [
      'foo',
      {
        multi: [
          ['name{value}', 'id'],
          [
            [
              'name',
              {
                multi: [['value'], [['value']]],
              },
            ],
            ['id'],
          ],
        ],
      },
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo{:}', function () {
    const out = ['foo', true, '%{:}%']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('bb[#].ee[].hh[].dd', function () {
    const out = [
      'bb',
      true,
      '%[#]%',
      'ee',
      true,
      '%[]%',
      'hh',
      true,
      '%[]%',
      'dd',
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`a(c='y').b`, function () {
    const out = ['a', { rule: [['c'], '=', 'y'] }, 'b']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('a(c=34).b', function () {
    const out = ['a', { rule: [['c'], '=', 34] }, 'b']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('a(c=false).b', function () {
    const out = ['a', { rule: [['c'], '=', false] }, 'b']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`a[](c='y').b`, function () {
    const out = ['a', true, '%[]%', { rule: [['c'], '=', 'y'] }, 'b']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`a[](='yy')`, function () {
    const out = ['a', true, '%[]%', { rule: ['=', 'yy'] }]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`a[](cc!='yy').b`, function () {
    const out = ['a', true, '%[]%', { rule: [['cc'], '!=', 'yy'] }, 'b']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`a[](c~='y').b`, function () {
    const out = ['a', true, '%[]%', { rule: [['c'], '~=', 'y'] }, 'b']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`a[](c>'y').b`, function () {
    const out = ['a', true, '%[]%', { rule: [['c'], '>', 'y'] }, 'b']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`a[](c>='y').b`, function () {
    const out = ['a', true, '%[]%', { rule: [['c'], '>=', 'y'] }, 'b']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`a[](c<'y').b`, function () {
    const out = ['a', true, '%[]%', { rule: [['c'], '<', 'y'] }, 'b']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`a[](.[0]='xx')[1]`, function () {
    const out = ['a', true, '%[]%', { rule: ['.', 0, '=', 'xx'] }, 1]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`a[](c<='y').b`, function () {
    const out = ['a', true, '%[]%', { rule: [['c'], '<=', 'y'] }, 'b']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('a[](c?).b', function () {
    const out = ['a', true, '%[]%', { rule: [['c'], '?'] }, 'b']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`a[](c='y')(d='b').b`, function () {
    const out = [
      'a',
      true,
      '%[]%',
      { rule: [['c'], '=', 'y'] },
      { rule: [['d'], '=', 'b'] },
      'b',
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`a[](c[].d='a2').b`, function () {
    const out = [
      'a',
      true,
      '%[]%',
      { rule: [['c', true, '%[]%', 'd'], '=', 'a2'] },
      'b',
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('a[0,2].b', function () {
    const out = ['a', true, '%[_,]%', [0, 2], 'b']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`a[](cc='yy'&&dd!='x][&x').b`, function () {
    const out = [
      'a',
      true,
      '%[]%',
      {
        rule: [['cc'], '=', 'yy', '&&', '(', [['dd'], '!=', 'x][&x']],
      },
      'b',
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`a[](cc='yy'&&dd!='x')(e='z').b`, function () {
    const out = [
      'a',
      true,
      '%[]%',
      {
        rule: [['cc'], '=', 'yy', '&&', '(', [['dd'], '!=', 'x']],
      },
      {
        rule: [['e'], '=', 'z'],
      },
      'b',
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it.skip(`a[](c[~&d!][>][2]='y').b`, function () {
    const out = [
      'a',
      true,
      '%[]%',
      { rule: [['c', '~&d!', '>'], 2, '=', 'y'] },
      'b',
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('a[](cc=yy||dd!=xx).b', function () {
    const out = [
      'a',
      true,
      '%[]%',
      {
        rule: [['cc'], '=', ['yy'], '||', '(', [['dd'], '!=', ['xx']]],
      },
      'b',
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`a[](cc='yy'||dd!='xx'&&ee!='zz').b`, function () {
    const out = [
      'a',
      true,
      '%[]%',
      {
        rule: [
          ['cc'],
          '=',
          'yy',
          '||',
          '(',
          [['dd'], '!=', 'xx'],
          '&&',
          '(',
          [['ee'], '!=', 'zz'],
        ],
      },
      'b',
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`aa.bb?[0]['(cc.dd = [102,100,foo,''baz''])']`, function () {
    // prettier-ignore
    const out = ['aa', 'bb?', 0, "(cc.dd = [102,100,foo,'baz'])"]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('handles new lines and spaces', function () {
    const path = `
      foo[]
        .bar( x = 'z'){
          aa[*] ,
          bb.5,
        }
    `

    const out = [
      'foo',
      true,
      '%[]%',
      'bar',
      {
        rule: [['x'], '=', 'z'],
      },
      {
        multi: [
          ['aa[*]', 'bb.5'],
          [
            ['aa', true, '%[*]%'],
            ['bb', '5'],
          ],
        ],
      },
    ]

    assert.deepEqual(JSONway.parse(path), out)
  })

  it(`body[].expression(callee.name='describe').arguments[](type='ArrowFunctionExpression').body.body[](expression.callee.name='it').expression.arguments[0].raw`, function () {
    const out = [
      'body',
      true,
      '%[]%',
      'expression',
      {
        rule: [['callee', 'name'], '=', 'describe'],
      },
      'arguments',
      true,
      '%[]%',
      {
        rule: [['type'], '=', 'ArrowFunctionExpression'],
      },
      'body',
      'body',
      true,
      '%[]%',
      {
        rule: [['expression', 'callee', 'name'], '=', 'it'],
      },
      'expression',
      'arguments',
      0,
      'raw',
    ]

    assert.deepEqual(JSONway.parse(this.test.title), out)

    const path = `
      body[]
        .expression(callee.name = 'describe')
        .arguments[](type = 'ArrowFunctionExpression')
        .body.body[](expression.callee.name = 'it')
        .expression.arguments[0]
        .raw
    `

    assert.deepEqual(JSONway.parse(path), out)
  })
})
