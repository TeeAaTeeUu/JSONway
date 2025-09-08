import { assert } from 'chai'

import JSONway from '../index.js'

describe('parser', () => {
  it('foo', function () {
    const out = ['.', 'foo']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('3', function () {
    const out = ['.', '3']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('[3]', function () {
    const out = ['1', 3]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('-5', function () {
    const out = ['.', '-5']
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('[-5]', function () {
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
  })

  it('foo{bar}', function () {
    const out = ['.', 'foo', '{}', [['bar', ['.', 'bar'], undefined, [false]]]]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo{bar,baz}', function () {
    const out = [
      '.',
      'foo',
      '{}',
      [
        ['bar', ['.', 'bar'], undefined, [false]],
        ['baz', ['.', 'baz'], undefined, [false]],
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
        ['bar', ['.', 'gee'], undefined, [true]],
        ['baz', ['.', 'baz'], undefined, [false]],
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
        ['bar[1,2]', ['.', 'bar', '[_,]', [[1, 2]]], undefined, [false]],
        [`[baz:]['id,[]']`, ['.', 'baz:', '.', 'id,[]'], undefined, [false]],
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
        ['bar', ['.', 'bar'], undefined, [false]],
        ['baz', ['.', 'baz'], 'test', [false]],
        ['gee', ['.', 'gee'], undefined, [false]],
        ['yee', ['.', 'yee'], 345, [false]],
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
        ['bar', ['.', 'bar'], 'a', [false]],
        ['baz', ['.', 'baz'], 5, [false]],
      ],
      '{}',
      [
        ['bb', ['.', 'bb'], undefined, [false]],
        ['cc', ['.', 'cc'], undefined, [false]],
      ],
    ]

    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it(`foo{ [' bar= '] = 124 }`, function () {
    const out = [
      '.',
      'foo',
      '{}',
      [[`[' bar= ']`, ['.', ' bar= '], 124, [false]]],
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo{bar,baz}.bar', function () {
    const out = [
      '.',
      'foo',
      '{}',
      [
        ['bar', ['.', 'bar'], undefined, [false]],
        ['baz', ['.', 'baz'], undefined, [false]],
      ],
      '.',
      'bar',
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo{bar}.bar', function () {
    const out = [
      '.',
      'foo',
      '{}',
      [['bar', ['.', 'bar'], undefined, [false]]],
      '.',
      'bar',
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('{bar,baz}', function () {
    const out = [
      '{}',
      [
        ['bar', ['.', 'bar'], undefined, [false]],
        ['baz', ['.', 'baz'], undefined, [false]],
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
          ['id', ['.', 'id'], undefined, [false]],
          ['name', ['.', 'name'], undefined, [false]],
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
          ['id', ['.', 'id'], undefined, [false]],
          ['list[]', ['.', 'list', '[]', []], undefined, [false]],
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
        ['bar.id', ['.', 'bar', '.', 'id'], undefined, [false]],
        [
          'baz[].value.max',
          ['.', 'baz', '[]', ['.', 'value', '.', 'max']],
          undefined,
          [false],
        ],
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
        ['id', ['.', 'id'], undefined, [false]],
        ['bar.id', ['.', 'bar', '.', 'id'], undefined, [false]],
        ['baz[]', ['.', 'baz', '[]', []], undefined, [false]],
        ['qee[].id', ['.', 'qee', '[]', ['.', 'id']], undefined, [false]],
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
        ['id', ['.', 'id', '.', 'key'], undefined, [true]],
        ['foo', ['.', 'foo'], undefined, [false]],
        ['bur', ['.', 'bar', '.', 'bur'], undefined, [true]],
      ],
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo[{bar.bur[*].b, foo, bar.bur[].a}].dd', function () {
    const out = [
      '.',
      'foo',
      '[{}]',
      [
        [
          'bar.bur[0].b',
          ['.', 'bar', '.', 'bur', '[*]', ['.', 'b']],
          undefined,
          [false, true, [0, 0]],
        ],
        ['foo', ['.', 'foo'], undefined, [false, false, [0, 0]]],
        [
          'bar.bur[0].a',
          ['.', 'bar', '.', 'bur', '[]', ['.', 'a']],
          undefined,
          [false, false, [0, 1]],
        ],
      ],
      '.',
      'dd',
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
        [
          'bar.bur[0].a',
          ['.', 'bar', '.', 'bur', '[*]', ['.', 'a']],
          undefined,
          [false, true, [0, 0]],
        ],
        ['bur', ['.', 'foo'], undefined, [true, false, [0, 0]]],
        [
          'bar[=].b',
          ['.', 'bar', '.', 'bur', '[]', ['.', 'b']],
          undefined,
          [true, false, [0, 1]],
        ],
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
        [
          'a.b[].g',
          ['.', 'a', '.', 'b', '[]', ['.', 'g']],
          undefined,
          [false, false, [0, 0]],
        ],
        [
          'a.b[].c[].e[]',
          ['.', 'a', '.', 'b', '[]', ['.', 'c', '[]', ['.', 'e', '[]', []]]],
          undefined,
          [false, false, [0, 0]],
        ],
        [
          'a.d[].g',
          ['.', 'a', '.', 'd', '[]', ['.', 'g']],
          undefined,
          [false, false, [0, 0]],
        ],
        [
          'a.d[].c[].f',
          ['.', 'a', '.', 'd', '[]', ['.', 'c', '[]', ['.', 'f']]],
          undefined,
          [false, false, [0, 0]],
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
              ['c', ['.', 'c'], undefined, [false]],
              ['d', ['.', 'd'], undefined, [false]],
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
          ['id', ['.', 'id'], undefined, [false]],
          ['name', ['.', 'name'], undefined, [false]],
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

  it('bar[:#].foo[].id', function () {
    const out = ['.', 'bar', '[:#]', ['.', 'foo', '[]', ['.', 'id']]]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('bar[#:].id', function () {
    const out = ['.', 'bar', '[:#]', ['.', 'id']]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('bar[][=]{id,,,,}', function () {
    const out = [
      '.',
      'bar',
      '[]',
      ['[=]', ['{}', [['id', ['.', 'id'], undefined, [false]]]]],
    ]
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
              ['value', ['.', 'value'], undefined, [false]],
              ['name', ['.', 'name'], undefined, [false]],
            ],
          ],
          undefined,
          [false],
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
      [
        [
          'id{value}',
          ['.', 'id', '{}', [['value', ['.', 'value'], undefined, [false]]]],
          undefined,
          [false],
        ],
      ],
    ]
    assert.deepEqual(JSONway.parse(this.test.title), out)
  })

  it('foo{name,id{value}}', function () {
    const out = [
      '.',
      'foo',
      '{}',
      [
        ['name', ['.', 'name'], undefined, [false]],
        [
          'id{value}',
          ['.', 'id', '{}', [['value', ['.', 'value'], undefined, [false]]]],
          undefined,
          [false],
        ],
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
        [
          'name{value}',
          ['.', 'name', '{}', [['value', ['.', 'value'], undefined, [false]]]],
          undefined,
          [false],
        ],
        ['id', ['.', 'id'], undefined, [false]],
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

  it(`a[](c[~&d!][>][2]='y').b`, function () {
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
          zz:
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
          ['zz', ['.', 'aa', '[*]', []], undefined, [true]],
          ['bb.5[4]', ['.', 'bb', '.', '5', '1', 4], 15, [false]],
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
