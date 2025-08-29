import { assert } from 'chai'

import JSONway from '../index.js'

describe('parser', () => {
  it('foo', function () {
    const out = ['.', 'foo']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('3', function () {
    const out = ['1', 3]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('-5', function () {
    const out = ['-1', -5]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('[]', function () {
    const out = ['[]', []]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('[=]', function () {
    const out = ['[=]', []]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('[*]', function () {
    const out = ['[*]', []]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo.bar.baz', function () {
    const out = ['.', 'foo', '.', 'bar', '.', 'baz']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo.__proto__', function () {
    assert.throws(() => {
      JSONway.parse(this.test.title)
    }, 'Attempted prototype pollution disallowed.')
  })

  it('foo[3]', function () {
    const out = ['.', 'foo', '1', 3]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo[-2]', function () {
    const out = ['.', 'foo', '-1', -2]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo.bar[]', function () {
    const out = ['.', 'foo', '.', 'bar', '[]', []]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo.bar.[]', function () {
    const out = ['.', 'foo', '.', 'bar', '[]', []]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo..bar.[]', function () {
    const out = ['.', 'foo', '.', 'bar', '[]', []]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo.bar[].', function () {
    const out = ['.', 'foo', '.', 'bar', '[]', []]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo.bar[].baz', function () {
    const out = ['.', 'foo', '.', 'bar', '[]', ['.', 'baz']]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`foo['bar'][].baz`, function () {
    const out = ['.', 'foo', '.', 'bar', '[]', ['.', 'baz']]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`foo['[]'].bar`, function () {
    const out = ['.', 'foo', '.', '[]', '.', 'bar']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`foo['*'].bar`, function () {
    const out = ['.', 'foo', '.', '*', '.', 'bar']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`foo['5'].bar`, function () {
    const out = ['.', 'foo', '.', '5', '.', 'bar']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`foo.bar[1].baz['[qee[].0]']['o][]]']`, function () {
    const out = [
      '.',
      'foo',
      '.',
      'bar',
      '1',
      1,
      '.',
      'baz',
      '.',
      '[qee[].0]',
      '.',
      'o][]]',
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo.bar[baz[gee][]', function () {
    const out = ['.', 'foo', '.', 'bar', '.', 'baz[gee][]']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo.bar[baz[gee]][]', function () {
    const out = ['.', 'foo', '.', 'bar', '.', 'baz[gee]', '[]', []]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`foo['{bar}'].baz['{a{(c)']`, function () {
    const out = ['.', 'foo', '.', '{bar}', '.', 'baz', '.', '{a{(c)']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo[bar.a].baz[}b{}}.}c}]', function () {
    const out = ['.', 'foo', '.', 'bar.a', '.', 'baz', '.', '}b{}}.}c}']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`[,foo : ''''.bar,].baz`, function () {
    const out = ['.', `foo : ''''.bar`, '.', 'baz']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`foo[bar.a][5]['{a}']`, function () {
    const out = ['.', 'foo', '.', 'bar.a', '1', 5, '.', '{a}']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`foo[}[bar}.a}][5]['{a.[}`, function () {
    const out = ['.', 'foo', '.', `}[bar}.a}][5]['{a.[}`]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo[bar.a][5][a.{}[b.[.c]', function () {
    const out = ['.', 'foo', '.', 'bar.a', '1', 5, '.', 'a.{}[b.[.c]']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('[foo]', function () {
    const out = ['.', 'foo']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('.[foo]', function () {
    const out = ['.', 'foo']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`['foo']`, function () {
    const out = ['.', 'foo']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`['[foo ='']']`, function () {
    const out = ['.', `[foo =']`]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo.bar[1][quu].baz[qee][aa].0.b[1]', function () {
    const out = [
      '.',
      'foo',
      '.',
      'bar',
      '1',
      1,
      '.',
      'quu',
      '.',
      'baz',
      '.',
      'qee',
      '.',
      'aa',
      '.',
      '0',
      '.',
      'b',
      '1',
      1,
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo[1][0][2].bar[baz]', function () {
    const out = ['.', 'foo', '1', 1, '1', 0, '1', 2, '.', 'bar', '.', 'baz']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo.bar[0].baz[][].id', function () {
    const out = [
      '.',
      'foo',
      '.',
      'bar',
      '1',
      0,
      '.',
      'baz',
      '[]',
      ['[]', ['.', 'id']],
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo[1][].id', function () {
    const out = ['.', 'foo', '1', 1, '[]', ['.', 'id']]
    assert.deepEqual(JSONway.parse(this.test.title), out)

    const input = 'foo[1][]=}.id'
    assert.deepEqual(JSONway.parse(input), out)
  })

  it('foo{bar}', function () {
    const out = ['.', 'foo', '{}', [['bar', ['.', 'bar']]]]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo{bar,baz}', function () {
    const out = [
      '.',
      'foo',
      '{}',
      [
        ['bar', ['.', 'bar']],
        ['baz', ['.', 'baz']],
      ],
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo{bar:gee,baz}', function () {
    const out = [
      '.',
      'foo',
      '{}',
      [
        ['bar', ['.', 'gee']],
        ['baz', ['.', 'baz']],
      ],
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)

    const input = 'foo { bar: gee, baz }'
    assert.deepEqual(JSONway.parse(input), out)
  })

  it(`foo{bar[1,2],[baz:]['id,[]']}`, function () {
    const out = [
      '.',
      'foo',
      '{}',
      [
        ['bar[1,2]', ['.', 'bar', '[_,]', [[1, 2]]]],
        [`[baz:]['id,[]']`, ['.', 'baz:', '.', 'id,[]']],
      ],
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo[bar{baz}]', function () {
    const out = ['.', 'foo', '.', 'bar{baz}']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  // TODO: add default values also for tabletizer
  it(`foo{bar,baz='test' ,gee,yee=345}`, function () {
    const out = [
      '.',
      'foo',
      '{}',
      [
        ['bar', ['.', 'bar']],
        ['baz', ['.', 'baz'], 'test'],
        ['gee', ['.', 'gee']],
        ['yee', ['.', 'yee'], 345],
      ],
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo{bar=a,baz=5 }{bb,cc}', function () {
    const out = [
      '.',
      'foo',
      '{}',
      [
        ['bar', ['.', 'bar'], 'a'],
        ['baz', ['.', 'baz'], 5],
      ],
      '{}',
      [
        ['bb', ['.', 'bb']],
        ['cc', ['.', 'cc']],
      ],
    ]

    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`foo{ [' bar= '] = 124 }`, function () {
    const out = ['.', 'foo', '{}', [[`[' bar= ']`, ['.', ' bar= '], 124]]]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo{bar,baz}.bar', function () {
    const out = [
      '.',
      'foo',
      '{}',
      [
        ['bar', ['.', 'bar']],
        ['baz', ['.', 'baz']],
      ],
      '.',
      'bar',
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo{bar}.bar', function () {
    const out = ['.', 'foo', '{}', [['bar', ['.', 'bar']]], '.', 'bar']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('{bar,baz}', function () {
    const out = [
      '{}',
      [
        ['bar', ['.', 'bar']],
        ['baz', ['.', 'baz']],
      ],
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo.bar[]{id,name}', function () {
    const out = [
      '.',
      'foo',
      '.',
      'bar',
      '[]',
      [
        '{}',
        [
          ['id', ['.', 'id']],
          ['name', ['.', 'name']],
        ],
      ],
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo[]{id,list[]}', function () {
    const out = [
      '.',
      'foo',
      '[]',
      [
        '{}',
        [
          ['id', ['.', 'id']],
          ['list[]', ['.', 'list', '[]', []]],
        ],
      ],
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo{bar.id,baz[].value.max}', function () {
    const out = [
      '.',
      'foo',
      '{}',
      [
        ['bar.id', ['.', 'bar', '.', 'id']],
        ['baz[].value.max', ['.', 'baz', '[]', ['.', 'value', '.', 'max']]],
      ],
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo{id,bar.id,baz[],qee[].id}', function () {
    const out = [
      '.',
      'foo',
      '{}',
      [
        ['id', ['.', 'id']],
        ['bar.id', ['.', 'bar', '.', 'id']],
        ['baz[]', ['.', 'baz', '[]', []]],
        ['qee[].id', ['.', 'qee', '[]', ['.', 'id']]],
      ],
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo{ id : id.key, foo, bur:bar.bur }', function () {
    const out = [
      '.',
      'foo',
      '{}',
      [
        ['id', ['.', 'id', '.', 'key']],
        ['foo', ['.', 'foo']],
        ['bur', ['.', 'bar', '.', 'bur']],
      ],
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo[{bar.bur[*].b, foo, bar.bur[].a}]', function () {
    const out = [
      '.',
      'foo',
      '[{}]',
      [
        ['bar.bur[0].b', ['.', 'bar', '.', 'bur', '[*]', ['.', 'b']], true],
        ['foo', ['.', 'foo'], false],
        ['bar.bur[0].a', ['.', 'bar', '.', 'bur', '[]', ['.', 'a']], false],
      ],
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`foo[ {bur: foo, bar.bur[*].a, 'bar[=].b': bar.bur[].b}

 ]  `, function () {
    const out = [
      '.',
      'foo',
      '[{}]',
      [
        ['bar.bur[0].a', ['.', 'bar', '.', 'bur', '[*]', ['.', 'a']], true],
        ['bur', ['.', 'foo'], false],
        ['bar[=].b', ['.', 'bar', '.', 'bur', '[]', ['.', 'b']], false],
      ],
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo[{a.d[].c[].f, a.d[].g, a.b[].c[].e[], a.b[].g}]', function () {
    const out = [
      '.',
      'foo',
      '[{}]',
      [
        ['a.b[].g', ['.', 'a', '.', 'b', '[]', ['.', 'g']], false],
        [
          'a.b[].c[].e[]',
          ['.', 'a', '.', 'b', '[]', ['.', 'c', '[]', ['.', 'e', '[]', []]]],
          false,
        ],
        ['a.d[].g', ['.', 'a', '.', 'd', '[]', ['.', 'g']], false],
        [
          'a.d[].c[].f',
          ['.', 'a', '.', 'd', '[]', ['.', 'c', '[]', ['.', 'f']]],
          false,
        ],
      ],
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('sub.ba[][1][][baz,][]{c,d}', function () {
    const out = [
      '.',
      'sub',
      '.',
      'ba',
      '[]',
      [
        '1',
        1,
        '[]',
        [
          '.',
          'baz',
          '[]',
          [
            '{}',
            [
              ['c', ['.', 'c']],
              ['d', ['.', 'd']],
            ],
          ],
        ],
      ],
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo.bar[=]{id,name,}', function () {
    const out = [
      '.',
      'foo',
      '.',
      'bar',
      '[=]',
      [
        '{}',
        [
          ['id', ['.', 'id']],
          ['name', ['.', 'name']],
        ],
      ],
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('bar[=][*].id', function () {
    const out = ['.', 'bar', '[=]', ['[*]', ['.', 'id']]]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('bar[#].id', function () {
    const out = ['.', 'bar', '[#]', ['.', 'id']]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('bar[:#].id', function () {
    const out = ['.', 'bar', '[:#]', ['.', 'id']]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('bar[#:].id', function () {
    const out = ['.', 'bar', '[:#]', ['.', 'id']]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('bar[][=]{id,,,,}', function () {
    const out = ['.', 'bar', '[]', ['[=]', ['{}', [['id', ['.', 'id']]]]]]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo{id{value,name}}', function () {
    const out = [
      '.',
      'foo',
      '{}',
      [
        [
          'id{value,name}',
          [
            '.',
            'id',
            '{}',
            [
              ['value', ['.', 'value']],
              ['name', ['.', 'name']],
            ],
          ],
        ],
      ],
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo{id{value}}', function () {
    const out = [
      '.',
      'foo',
      '{}',
      [['id{value}', ['.', 'id', '{}', [['value', ['.', 'value']]]]]],
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo{name,id{value}}', function () {
    const out = [
      '.',
      'foo',
      '{}',
      [
        ['name', ['.', 'name']],
        ['id{value}', ['.', 'id', '{}', [['value', ['.', 'value']]]]],
      ],
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo{name{value},,id}', function () {
    const out = [
      '.',
      'foo',
      '{}',
      [
        ['name{value}', ['.', 'name', '{}', [['value', ['.', 'value']]]]],
        ['id', ['.', 'id']],
      ],
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo{:}', function () {
    const out = ['.', 'foo', '{:}', true]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('bb[#].ee[].hh[].dd', function () {
    const out = [
      '.',
      'bb',
      '[#]',
      ['.', 'ee', '[]', ['.', 'hh', '[]', ['.', 'dd']]],
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`a(c='y').b`, function () {
    const out = ['.', 'a', '()', [['.', 'c'], '=', 'y'], '.', 'b']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('a(c=34).b', function () {
    const out = ['.', 'a', '()', [['.', 'c'], '=', 34], '.', 'b']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('a(c=false).b', function () {
    const out = ['.', 'a', '()', [['.', 'c'], '=', false], '.', 'b']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`a[](c='y').b`, function () {
    const out = ['.', 'a', '[]', ['()', [['.', 'c'], '=', 'y'], '.', 'b']]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`a[](='yy')`, function () {
    const out = ['.', 'a', '[]', ['()', ['=', 'yy']]]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`a[](cc!='yy').b`, function () {
    const out = ['.', 'a', '[]', ['()', [['.', 'cc'], '!=', 'yy'], '.', 'b']]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`a[](c~='y').b`, function () {
    const out = ['.', 'a', '[]', ['()', [['.', 'c'], '~=', 'y'], '.', 'b']]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`a[](c>'y').b`, function () {
    const out = ['.', 'a', '[]', ['()', [['.', 'c'], '>', 'y'], '.', 'b']]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`a[](c>='y').b`, function () {
    const out = ['.', 'a', '[]', ['()', [['.', 'c'], '>=', 'y'], '.', 'b']]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`a[](c<'y').b`, function () {
    const out = ['.', 'a', '[]', ['()', [['.', 'c'], '<', 'y'], '.', 'b']]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`a[]([0]='xx')[1]`, function () {
    const out = ['.', 'a', '[]', ['()', [['1', 0], '=', 'xx'], '1', 1]]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`a[](c<='y').b`, function () {
    const out = ['.', 'a', '[]', ['()', [['.', 'c'], '<=', 'y'], '.', 'b']]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('a[](c?).b', function () {
    const out = ['.', 'a', '[]', ['()', [['.', 'c'], '?'], '.', 'b']]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`a[](c='y')(d='b').b`, function () {
    const out = [
      '.',
      'a',
      '[]',
      ['()', [['.', 'c'], '=', 'y'], '()', [['.', 'd'], '=', 'b'], '.', 'b'],
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`a[](c[].d='a2').b`, function () {
    const out = [
      '.',
      'a',
      '[]',
      ['()', [['.', 'c', '[]', ['.', 'd']], '=', 'a2'], '.', 'b'],
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('a[0,2].b', function () {
    let out = ['.', 'a', '[_,]', [[0, 2], '.', 'b']]
    assert.deepEqual(JSONway.parse(this.test.title), out)

    let input = 'a[0,2,].b'
    assert.deepEqual(JSONway.parse(input), out)

    input = 'a[15,2466,1].b'
    out = ['.', 'a', '[_,]', [[15, 2466, 1], '.', 'b']]
    assert.deepEqual(JSONway.parse(input), out)
  })

  it('a[ 0 , 2 ].b', function () {
    const out = ['.', 'a', '[_,]', [[0, 2], '.', 'b']]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('a[0,2,a].b', function () {
    const out = ['.', 'a', '[,]', [[0, 2, ['.', 'a']], '.', 'b']]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('[foo.bar,baz.gee][0]', function () {
    const out = [
      '[,]',
      [
        [
          ['.', 'foo', '.', 'bar'],
          ['.', 'baz', '.', 'gee'],
        ],
        '1',
        0,
      ],
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('[ foo.bar , baz.gee ] [1]', function () {
    const out = [
      '[,]',
      [
        [
          ['.', 'foo', '.', 'bar'],
          ['.', 'baz', '.', 'gee'],
        ],
        '1',
        1,
      ],
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('[foo.bar[],baz[*].gee]', function () {
    const out = [
      '[,]',
      [
        [
          ['.', 'foo', '.', 'bar', '[]', []],
          ['.', 'baz', '[*]', ['.', 'gee']],
        ],
      ],
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`a[](cc='yy'&&dd!='x][&x').b`, function () {
    const out = [
      '.',
      'a',
      '[]',
      [
        '()',
        [['.', 'cc'], '=', 'yy', '&&', '(', [['.', 'dd'], '!=', 'x][&x']],
        '.',
        'b',
      ],
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`a[](cc='yy'&&dd!='x')(e='z').b`, function () {
    const out = [
      '.',
      'a',
      '[]',
      [
        '()',
        [['.', 'cc'], '=', 'yy', '&&', '(', [['.', 'dd'], '!=', 'x']],
        '()',
        [['.', 'e'], '=', 'z'],
        '.',
        'b',
      ],
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it.skip(`a[](c[~&d!][>][2]='y').b`, function () {
    let out = [
      '.',
      'a',
      '[]',
      ['()', [['.', 'c', '.', '~&d!', '.', '>', '1', 2], '=', 'y'], '.', 'b'],
    ]

    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('a[](cc=yy||dd!=xx).b', function () {
    const out = [
      '.',
      'a',
      '[]',
      [
        '()',
        [
          ['.', 'cc'],
          '=',
          ['.', 'yy'],
          '||',
          '(',
          [['.', 'dd'], '!=', ['.', 'xx']],
        ],
        '.',
        'b',
      ],
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`a[](cc='yy'||dd!='xx'&&ee!='zz').b`, function () {
    const out = [
      '.',
      'a',
      '[]',
      [
        '()',
        [
          ['.', 'cc'],
          '=',
          'yy',
          '||',
          '(',
          [['.', 'dd'], '!=', 'xx'],
          '&&',
          '(',
          [['.', 'ee'], '!=', 'zz'],
        ],
        '.',
        'b',
      ],
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`aa.bb?[0]['(cc.dd = [102,100,foo,''baz''])']`, function () {
    // prettier-ignore
    const out = ['.', 'aa', '.', 'bb?', '1', 0, '.', "(cc.dd = [102,100,foo,'baz'])"]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('handles new lines and spaces', function () {
    const path = `
      foo[]
        .bar( x = 'z'){
          aa[*] ,
          bb.5[4] =  15  ,

        }

        ['aa[*]']
    `

    const out = [
      '.',
      'foo',
      '[]',
      [
        '.',
        'bar',
        '()',
        [['.', 'x'], '=', 'z'],
        '{}',
        [
          ['aa[*]', ['.', 'aa', '[*]', []]],
          ['bb.5[4]', ['.', 'bb', '.', '5', '1', 4], 15],
        ],
        '.',
        'aa[*]',
      ],
    ]

    assert.deepEqual(JSONway.parse(path), out)
  })

  it(`body[].expression(callee.name='describe').arguments[](type='ArrowFunctionExpression').body.body[](expression.callee.name='it').expression.arguments[0].raw`, function () {
    const out = [
      '.',
      'body',
      '[]',
      [
        '.',
        'expression',
        '()',
        [['.', 'callee', '.', 'name'], '=', 'describe'],
        '.',
        'arguments',
        '[]',
        [
          '()',
          [['.', 'type'], '=', 'ArrowFunctionExpression'],
          '.',
          'body',
          '.',
          'body',
          '[]',
          [
            '()',
            [['.', 'expression', '.', 'callee', '.', 'name'], '=', 'it'],
            '.',
            'expression',
            '.',
            'arguments',
            '1',
            0,
            '.',
            'raw',
          ],
        ],
      ],
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
