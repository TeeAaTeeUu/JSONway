import { assert } from 'chai'

import JSONway from '../index.js'
import { _getJsonAsync, _arrayOfObjects } from './_utils.js'

describe('expander', () => {
  it('{"a":"b","c":false,"d":5}', function () {
    const out = { a: 'b', c: false, d: 5 }
    assert.deepEqual(JSONway.expand(JSON.parse(this.test.title)), out)
  })

  it('{"aa[]":["bb","cc","dd","ee"]}', function () {
    const out = { aa: ['bb', 'cc', 'dd', 'ee'] }
    assert.deepEqual(JSONway.expand(JSON.parse(this.test.title)), out)
  })

  it('{"aa[][]":[["bb","cc"],["dd","ee"]]}', function () {
    const out = {
      aa: [
        ['bb', 'cc'],
        ['dd', 'ee'],
      ],
    }
    assert.deepEqual(JSONway.expand(JSON.parse(this.test.title)), out)
  })

  it('{"aa[][]":[["bb"],["cc","dd"],["ee"]]}', function () {
    const out = { aa: [['bb'], ['cc', 'dd'], ['ee']] }
    assert.deepEqual(JSONway.expand(JSON.parse(this.test.title)), out)
  })

  it('{"aa[][]":[["bb"],["cc","dd"],["ee"],["hh"],["ii"]]}', function () {
    const out = { aa: [['bb'], ['cc', 'dd'], ['ee'], ['hh'], ['ii']] }
    assert.deepEqual(JSONway.expand(JSON.parse(this.test.title)), out)
  })

  it('{"a.e":"b","c[]":false,"[d.f]":5}', function () {
    const out = { a: { e: 'b' }, c: [false], 'd.f': 5 }
    assert.deepEqual(JSONway.expand(JSON.parse(this.test.title)), out)

    const paths = {}
    Object.keys(JSON.parse(this.test.title)).forEach((value, key) => {
      paths[key] = JSONway.parse(key)
    })

    assert.deepEqual(JSONway.expand(JSON.parse(this.test.title), paths), out)
  })

  it('{"aa[].bb":["cc","ff"]}', function () {
    const out = { aa: [{ bb: 'cc' }, { bb: 'ff' }] }
    assert.deepEqual(JSONway.expand(JSON.parse(this.test.title)), out)
  })

  it('{"aa[0].bb":"cc","aa[1].dd":"ff"}', function () {
    const out = { aa: [{ bb: 'cc' }, { dd: 'ff' }] }
    assert.deepEqual(JSONway.expand(JSON.parse(this.test.title)), out)
  })

  it('{"aa[0].bb":"cc","aa[0].dd":"ff"}', function () {
    const out = { aa: [{ bb: 'cc', dd: 'ff' }] }
    assert.deepEqual(JSONway.expand(JSON.parse(this.test.title)), out)
  })

  // TODO: this override might not be what we want
  it('{"aa[].bb":"cc","aa[].dd":"ff"}', function () {
    const out = { aa: [{ dd: 'ff' }] }
    assert.deepEqual(JSONway.expand(JSON.parse(this.test.title)), out)
  })

  it('{"aa[].bb":"cc","aa[*].dd":"ff"}', function () {
    const out = { aa: [{ bb: 'cc', dd: 'ff' }] }
    assert.deepEqual(JSONway.expand(JSON.parse(this.test.title)), out)
  })

  it(`{"aa.bb?[0]['cc.dd = true || cc.ff = [100,101]']": "?"}`, function () {
    const out = {
      aa: {
        'bb?': [{ 'cc.dd = true || cc.ff = [100,101]': '?' }],
      },
    }
    assert.deepEqual(JSONway.expand(JSON.parse(this.test.title)), out)
  })

  it('more real objects', () => {
    let object = {
      'aa.bb[0].cc[0].dd': '11',
      'aa.bb[0].cc[0].ee': 'a',
      'aa.bb[0].cc[0].ff': 'z',
      'aa.bb[1].cc[0].dd': '21',
      'aa.bb[1].cc[0].ee': 'b',
      'aa.bb[1].cc[0].ff': 'y',
      'aa.bb[1].cc[1].dd': '31',
      'aa.bb[1].cc[1].ee': 'c',
      'aa.bb[1].cc[1].ff': 'x',
      'aa.bb[2].cc[0].dd': 51,
      'aa.bb[2].cc[0].ee': 'e',
      'aa.bb[2].cc[0].ff': 'v',
      'aa.bb[3].cc[0].dd': '61',
      'aa.bb[3].cc[0].ee': 'g',
      'aa.bb[3].cc[0].ff': 'u',
      'aa.bb[3].cc[1].dd': 71,
      'aa.bb[3].cc[1].ee': 'h',
      'aa.bb[3].cc[1].ff': 't',
    }
    let out = {
      aa: {
        bb: [
          { cc: [{ dd: '11', ee: 'a', ff: 'z' }] },
          {
            cc: [
              { dd: '21', ee: 'b', ff: 'y' },
              { ff: 'x', dd: '31', ee: 'c' },
            ],
          },
          { cc: [{ dd: 51, ee: 'e', ff: 'v' }] },
          {
            cc: [
              { dd: '61', ee: 'g', ff: 'u' },
              { dd: 71, ee: 'h', ff: 't' },
            ],
          },
        ],
      },
    }
    assert.deepEqual(JSONway.expand(object), out)

    object = {
      'a[0].c[0]': '11',
      'a[0][b.b][0]': 'f',
      'a[1].d': '21',
      'a[1][b.b]': 'g',
      'a[2].j[0]': '31',
      'a[2][b.b][0]': 'k',
      'a[2][j.j][0]': '41',
      'a[3].j[0]': 61,
      'a[3].k[0]': '51',
      'a[3][b.b][0]': 'h',
      'a[4].e[0]': '71',
      'a[4][b.b]': 'i',
    }
    out = {
      a: [
        { 'b.b': ['f'], c: ['11'] },
        { 'b.b': 'g', d: '21' },
        { 'b.b': ['k'], j: ['31'], 'j.j': ['41'] },
        { 'b.b': ['h'], k: ['51'], j: [61] },
        { 'b.b': 'i', e: ['71'] },
      ],
    }
    assert.deepEqual(JSONway.expand(object), out)
  })

  it('expandAll', () => {
    const input = _arrayOfObjects([
      [
        'foo.aa',
        'bar.bb',
        'baz',
        'cc.gg',
        'cc.id',
        'cc.dd',
        'cc.ee[]',
        'cc.ff[:][]',
      ],
      ['a', undefined, 'c', 'foo', 1, 10, undefined, undefined],
      [
        undefined,
        'e',
        'c',
        'bar',
        2,
        10,
        [1, 3],
        [
          ['foo@20', 3],
          ['foo@10', 1],
        ],
      ],
      ['g', undefined, 'i', 'foo', 3, 20, [1, 4], [['bar@20', 4]]],
      [undefined, 'h', 'i', 'bar', 4, 20, undefined, undefined],
    ])

    const out = [
      {
        foo: { aa: 'a' },
        baz: 'c',
        cc: { gg: 'foo', id: 1, dd: 10 },
      },
      {
        bar: { bb: 'e' },
        baz: 'c',
        cc: {
          gg: 'bar',
          id: 2,
          dd: 10,
          ee: [1, 3],
          ff: [
            ['foo@20', 3],
            ['foo@10', 1],
          ],
        },
      },
      {
        foo: { aa: 'g' },
        baz: 'i',
        cc: {
          gg: 'foo',
          id: 3,
          dd: 20,
          ee: [1, 4],
          ff: [['bar@20', 4]],
        },
      },
      {
        bar: { bb: 'h' },
        baz: 'i',
        cc: { gg: 'bar', id: 4, dd: 20 },
      },
    ]

    assert.deepEqual(JSONway.expandAll(input), out)
  })

  it('expand tabletized output', () => {
    const input = _arrayOfObjects([
      [
        'aa[0].gg',
        'aa[0].bb[0].gg',
        'aa[0].bb[0].cc[0].gg',
        'aa[0].bb[0].cc[0].ff.gg',
        'ww_id',
        'aa[0].id',
      ],
      ['aa_1', 'bb_1', 'dd_1', 'ff_1', 'z1', 'a1'],
      ['aa_1', 'bb_1', 'dd_2', 'ff_2', 'z1', 'a1'],
      ['aa_1', 'bb_2', 'dd_3', 'ff_3', 'z1', 'a1'],
      ['aa_1', 'bb_2', 'dd_4', 'ff_4', 'z1', 'a1'],
      ['aa_2', 'bb_3', 'dd_5', 'ff_5', 'z1', 'a2'],
      ['aa_2', 'bb_3', 'dd_6', 'ff_6', 'z1', 'a2'],
      ['aa_2', 'bb_4', 'dd_7', 'ff_7', 'z1', 'a2'],
      ['aa_2', 'bb_4', 'dd_8', 'ff_8', 'z1', 'a2'],
    ])

    const out = [
      {
        aa: [
          {
            gg: 'aa_1',
            bb: [
              {
                gg: 'bb_1',
                cc: [{ gg: 'dd_1', ff: { gg: 'ff_1' } }],
              },
            ],
            id: 'a1',
          },
        ],
        ww_id: 'z1',
      },
      {
        aa: [
          {
            gg: 'aa_1',
            bb: [
              {
                gg: 'bb_1',
                cc: [{ gg: 'dd_2', ff: { gg: 'ff_2' } }],
              },
            ],
            id: 'a1',
          },
        ],
        ww_id: 'z1',
      },
      {
        aa: [
          {
            gg: 'aa_1',
            bb: [
              {
                gg: 'bb_2',
                cc: [{ gg: 'dd_3', ff: { gg: 'ff_3' } }],
              },
            ],
            id: 'a1',
          },
        ],
        ww_id: 'z1',
      },
      {
        aa: [
          {
            gg: 'aa_1',
            bb: [
              {
                gg: 'bb_2',
                cc: [{ gg: 'dd_4', ff: { gg: 'ff_4' } }],
              },
            ],
            id: 'a1',
          },
        ],
        ww_id: 'z1',
      },
      {
        aa: [
          {
            gg: 'aa_2',
            bb: [
              {
                gg: 'bb_3',
                cc: [{ gg: 'dd_5', ff: { gg: 'ff_5' } }],
              },
            ],
            id: 'a2',
          },
        ],
        ww_id: 'z1',
      },
      {
        aa: [
          {
            gg: 'aa_2',
            bb: [
              {
                gg: 'bb_3',
                cc: [{ gg: 'dd_6', ff: { gg: 'ff_6' } }],
              },
            ],
            id: 'a2',
          },
        ],
        ww_id: 'z1',
      },
      {
        aa: [
          {
            gg: 'aa_2',
            bb: [
              {
                gg: 'bb_4',
                cc: [{ gg: 'dd_7', ff: { gg: 'ff_7' } }],
              },
            ],
            id: 'a2',
          },
        ],
        ww_id: 'z1',
      },
      {
        aa: [
          {
            gg: 'aa_2',
            bb: [
              {
                gg: 'bb_4',
                cc: [{ gg: 'dd_8', ff: { gg: 'ff_8' } }],
              },
            ],
            id: 'a2',
          },
        ],
        ww_id: 'z1',
      },
    ]

    assert.deepEqual(JSONway.expandAll(input), out)
  })

  it('multi-column', () => {
    const input = {
      foo: 'x',
      "bar.baz(woo.gee='z'){wee,more[],less[].best}": ['y', 3, ['a', 'b']],
    }
    const out = {
      foo: 'x',
      bar: {
        baz: {
          wee: 'y',
          woo: { gee: 'z' },
          more: [3],
          less: [{ best: 'a' }, { best: 'b' }],
        },
      },
    }

    assert.deepEqual(JSONway.expand(input), out)
  })

  it('multi-column in a list', () => {
    const input = {
      foo: 'x',
      "bar.baz[](woo.gee='z'){wee,more[],less[].best}": [['y', 3, ['a', 'b']]],
    }
    const out = {
      foo: 'x',
      bar: {
        baz: [
          {
            wee: 'y',
            woo: { gee: 'z' },
            more: [3],
            less: [{ best: 'a' }, { best: 'b' }],
          },
        ],
      },
    }

    assert.deepEqual(JSONway.expand(input), out)
  })

  it('nested real example', () => {
    const input = {
      aa: 'a1',
      cc: 'c1',
      bb: 'X',
      'dd.ff.gg': 'gg1',
      'dd.ff.hh[0].ii[]': ['d1', 'd2'],
      'dd.ff.hh[0].ff': 3,
      'dd.ff.hh[0].jj.gg': 'gg1',
      'dd.ff.hh[0].jj.kk[0].gg': 'gg2',
      'dd.ff.hh[0].jj.kk[0].ll': 'Z',
      'dd.ff.hh[0].jj.kk[0].mm': 'mm1',
      'dd.ff.hh[0].jj.kk[1]{ll,gg,mm}': ['G', 'gg2', 'WW'],
      'dd.ff.hh[1].ii[]': ['d3', 'd4'],
      'dd.ff.hh[1].ff': 4,
      'dd.ff.hh[1].jj.gg': 'AND',
      'dd.ff.hh[1].jj.kk[0]{ll,gg,mm}': ['P', 'gg2', 'VV'],
      'dd.ff.hh[1].jj.kk[1]{ll,gg,mm}': ['J', 'gg2', 'FF'],
    }

    const out = {
      aa: 'a1',
      cc: 'c1',
      bb: 'X',
      dd: {
        ff: {
          gg: 'gg1',
          hh: [
            {
              ii: ['d1', 'd2'],
              ff: 3,
              jj: {
                gg: 'gg1',
                kk: [
                  {
                    ll: 'Z',
                    gg: 'gg2',
                    mm: 'mm1',
                  },
                  {
                    ll: 'G',
                    gg: 'gg2',
                    mm: 'WW',
                  },
                ],
              },
            },
            {
              ii: ['d3', 'd4'],
              ff: 4,
              jj: {
                gg: 'AND',
                kk: [
                  {
                    ll: 'P',
                    gg: 'gg2',
                    mm: 'VV',
                  },
                  {
                    ll: 'J',
                    gg: 'gg2',
                    mm: 'FF',
                  },
                ],
              },
            },
          ],
        },
      },
    }

    assert.deepEqual(JSONway.expand(input), out)
  })

  it('former', () => {
    const object = {
      bar: 'best',
      baz: 'x',
      'gee[].hee.hii[].bee': [[15, 10], [12]],
      'boo[]{aa,bb}': [['aa', 7], [5], [undefined, 'bb']],
    }

    const out = {
      bar: 'best',
      baz: 'x',
      gee: [
        {
          hee: { hii: [{ bee: 15 }, { bee: 10 }] },
        },
        {
          hee: { hii: [{ bee: 12 }] },
        },
      ],
      boo: [{ aa: 'aa', bb: 7 }, { aa: 5 }, { bb: 'bb' }],
    }

    assert.deepEqual(JSONway.expand(object), out)
  })

  it('saas-example-response-cc.json', async () => {
    const object = await _getJsonAsync(
      './fixtures/saas-example-response-cc-flattened.json',
    )
    const out = await _getJsonAsync('./fixtures/saas-example-response-cc.json')

    assert.deepEqual(JSONway.expand(object), out)
  })

  it('saas-example-response-aa-expanded.json', async () => {
    const object = await _getJsonAsync(
      './fixtures/saas-example-response-aa-flattened.json',
    )
    const out = await _getJsonAsync(
      './fixtures/saas-example-response-aa-expanded.json',
    )

    assert.deepEqual(JSONway.expand(object), out)
  })

  it('saas-example-response-aa-expanded.json .ee', async () => {
    const object = await _getJsonAsync(
      './fixtures/saas-example-response-bb-flattened.json',
    )
    const out = await _getJsonAsync(
      './fixtures/saas-example-response-aa-expanded.json',
    )

    assert.deepEqual(JSONway.expand(object), out.ee)
  })

  it('nested-list-response.json', async () => {
    const object = await _getJsonAsync(
      './fixtures/nested-list-response-flattened.json',
    )
    const out = await _getJsonAsync('./fixtures/nested-list-response.json')

    assert.deepEqual(JSONway.expand(object), out)
  })
})
