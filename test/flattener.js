import { assert } from 'chai'

import JSONway from '../index.js'
import { _getJsonAsync } from './_utils.js'

describe('flattener', () => {
  it('{"a":"b","c":false,"d":5}', function () {
    const out = { a: 'b', c: false, d: 5 }
    assert.deepEqual(JSONway.flatten(JSON.parse(this.test.title)), out)
  })

  it('{"aa":"bb","cc":{"dd":55},"ee":"ff"}', function () {
    const out = { aa: 'bb', 'cc.dd': 55, ee: 'ff' }
    assert.deepEqual(JSONway.flatten(JSON.parse(this.test.title)), out)
  })

  it('{"aa":"bb","c.c":{"dd":55},"e.e":"ff"}', function () {
    const out = { aa: 'bb', '[c.c].dd': 55, '[e.e]': 'ff' }
    assert.deepEqual(JSONway.flatten(JSON.parse(this.test.title)), out)
  })

  it('{"aa":["bb","cc","dd","ee"]}', function () {
    const out = { 'aa[]': ['bb', 'cc', 'dd', 'ee'] }
    assert.deepEqual(JSONway.flatten(JSON.parse(this.test.title)), out)
  })

  it('{"aa":[["bb","cc"],["dd","ee"]]}', function () {
    const out = {
      'aa[][]': [
        ['bb', 'cc'],
        ['dd', 'ee'],
      ],
    }
    assert.deepEqual(JSONway.flatten(JSON.parse(this.test.title)), out)
  })

  it('{"aa":["bb",["cc","dd"],"ee"]}', function () {
    const out = { 'aa[][]': ['bb', ['cc', 'dd'], 'ee'] }
    assert.deepEqual(JSONway.flatten(JSON.parse(this.test.title)), out)
  })

  it('{"aa":["bb",["cc","dd"],"ee",["hh"],"ii"]}', function () {
    const out = { 'aa[][]': ['bb', ['cc', 'dd'], 'ee', ['hh'], 'ii'] }
    assert.deepEqual(JSONway.flatten(JSON.parse(this.test.title)), out)
  })

  it('{"aa":["bb",["cc","dd"],"ee",{"ff":"gg"},["hh"],"ii"]}', function () {
    const out = {
      'aa[0]': 'bb',
      'aa[1][]': ['cc', 'dd'],
      'aa[2]': 'ee',
      'aa[3].ff': 'gg',
      'aa[4][]': ['hh'],
      'aa[5]': 'ii',
    }
    assert.deepEqual(JSONway.flatten(JSON.parse(this.test.title)), out)
  })

  it('{"a":"b","c":{"d":{"e":"f","g,":{"h":"i"}},"j":{"k":"l"},"x":"y"},"m":-1}', function () {
    const out = {
      a: 'b',
      'c.d.e': 'f',
      "c.d['g,'].h": 'i',
      'c.j.k': 'l',
      'c.x': 'y',
      m: -1,
    }
    assert.deepEqual(JSONway.flatten(JSON.parse(this.test.title)), out)
  })

  it('{"a":"b","c":["ee","ff"],"d":5}', function () {
    const out = { a: 'b', 'c[]': ['ee', 'ff'], d: 5 }
    assert.deepEqual(JSONway.flatten(JSON.parse(this.test.title)), out)
  })

  it('{"aa":[{"bb":"cc"},{"bb":"dd"}],"ff":{"gg":"hh"}}', function () {
    const out = { 'aa[].bb': ['cc', 'dd'], 'ff.gg': 'hh' }
    assert.deepEqual(JSONway.flatten(JSON.parse(this.test.title)), out)
  })

  it('{"aa":[{"bb":"cc"},{"dd":"ee"}],"ff":{"gg":"hh"}}', function () {
    const out = { 'aa[0].bb': 'cc', 'aa[1].dd': 'ee', 'ff.gg': 'hh' }
    assert.deepEqual(JSONway.flatten(JSON.parse(this.test.title)), out)
  })

  it('{"aa":[{"bb":["cc","dd"]},{"bb":["ff","gg"]}]}', function () {
    const out = {
      'aa[].bb[]': [
        ['cc', 'dd'],
        ['ff', 'gg'],
      ],
    }
    assert.deepEqual(JSONway.flatten(JSON.parse(this.test.title)), out)
  })

  it('{"aa":[[{"bb":["cc","dd"]},{"bb":["ff","gg"]}]]}', function () {
    const out = {
      'aa[0][].bb[]': [
        ['cc', 'dd'],
        ['ff', 'gg'],
      ],
    }
    assert.deepEqual(JSONway.flatten(JSON.parse(this.test.title)), out)
  })

  it('{"aa":[["bb","cc"],{"dd":"ee"}]}', function () {
    const out = { 'aa[0][]': ['bb', 'cc'], 'aa[1].dd': 'ee' }
    assert.deepEqual(JSONway.flatten(JSON.parse(this.test.title)), out)
  })

  it('{"aa":[{"bb":"cc"},{"bb":"dd","ee":"ff"}],"gg":{"hh":"ii"}}', function () {
    const out = {
      'aa[0].bb': 'cc',
      'aa[1]{bb,ee}': ['dd', 'ff'],
      'gg.hh': 'ii',
    }
    assert.deepEqual(JSONway.flatten(JSON.parse(this.test.title)), out)
  })

  it('{"aa":[{"bb":"cc","dd":"ee"},{"bb":"ff","dd":"gg"}]}', function () {
    const out = {
      'aa[0]{bb,dd}': ['cc', 'ee'],
      'aa[1]{bb,dd}': ['ff', 'gg'],
    }
    assert.deepEqual(JSONway.flatten(JSON.parse(this.test.title)), out)
  })

  it('{"a":["bb","cc",[["dd",{"ee":"123","gg":{}}],"ff"]]}', function () {
    const out = {
      'a[0]': 'bb',
      'a[1]': 'cc',
      'a[2][0][0]': 'dd',
      'a[2][0][1].ee': '123',
      'a[2][0][1].gg{}': '',
      'a[2][1]': 'ff',
    }
    assert.deepEqual(JSONway.flatten(JSON.parse(this.test.title)), out)
  })

  it('{"aa":[{"bb":"cc"},{"bb":"ff"}]}', function () {
    const out = {
      'aa[].bb': ['cc', 'ff'],
    }
    assert.deepEqual(JSONway.flatten(JSON.parse(this.test.title)), out)
  })

  it('{"aa":[{"bb":"cc"},{"dd":"ff"}]}', function () {
    const out = {
      'aa[0].bb': 'cc',
      'aa[1].dd': 'ff',
    }
    assert.deepEqual(JSONway.flatten(JSON.parse(this.test.title)), out)
  })

  it('{"aa":[{"bb":"cc","dd":"ff"}]}', function () {
    const out = {
      'aa[0]{bb,dd}': ['cc', 'ff'],
    }
    assert.deepEqual(JSONway.flatten(JSON.parse(this.test.title)), out)
  })

  it('{"a":"b","c":null}', function () {
    const out = { a: 'b', c: null }
    assert.deepEqual(JSONway.flatten(JSON.parse(this.test.title)), out)
  })

  it(`{"aa": {"bb?":[{"cc._ok = true && cc.dd = [101,100]": "?"}]}}`, function () {
    const out = {
      "aa.bb?[]['cc._ok = true && cc.dd = [101,100]']": ['?'],
    }

    assert.deepEqual(JSONway.flatten(JSON.parse(this.test.title)), out)
  })

  it('basic flattening', () => {
    const input = {
      bar: {
        baz: {
          wee: 'y',
          woo: { gee: 'z' },
          more: [3],
          less: [{ best: 'a' }, { best: 'b' }],
        },
      },
    }
    const out = {
      'bar.baz.wee': 'y',
      'bar.baz.woo.gee': 'z',
      'bar.baz.more[]': [3],
      'bar.baz.less[].best': ['a', 'b'],
    }

    assert.deepEqual(JSONway.flatten(input), out)
  })

  it('more real objects', () => {
    let object = {
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
    // TODO: maybe different output in the future?
    // let out = [{
    //     'aa.bb[*].cc[*].dd': '11',
    //     'aa.bb[*].cc[*].ee': 'a',
    //     'aa.bb[*].cc[*].ff': 'z'
    //   }, {
    //     'aa.bb[*].cc[*].dd': '11',
    //     'aa.bb[*].cc[*].ee': 'a',
    //     'aa.bb[*].cc[*].ff': 'z'
    //   }, {
    //     'aa.bb[*].cc[*].dd': '11',
    //     'aa.bb[*].cc[*].ee': 'a',
    //     'aa.bb[*].cc[*].ff': 'z'
    //   }, {
    //     'aa.bb[*].cc[*].dd': '11',
    //     'aa.bb[*].cc[*].ee': 'a',
    //     'aa.bb[*].cc[*].ff': 'z'
    //   }, {
    //     'aa.bb[*].cc[*].dd': '11',
    //     'aa.bb[*].cc[*].ee': 'a',
    //     'aa.bb[*].cc[*].ff': 'z'
    // }]
    let out = {
      'aa.bb[0].cc[0]{dd,ee,ff}': ['11', 'a', 'z'],
      'aa.bb[1].cc[0]{dd,ee,ff}': ['21', 'b', 'y'],
      'aa.bb[1].cc[1]{ff,dd,ee}': ['x', '31', 'c'],
      'aa.bb[2].cc[0]{dd,ee,ff}': [51, 'e', 'v'],
      'aa.bb[3].cc[0]{dd,ee,ff}': ['61', 'g', 'u'],
      'aa.bb[3].cc[1]{dd,ee,ff}': [71, 'h', 't'],
    }
    assert.deepEqual(JSONway.flatten(object), out)

    object = {
      a: [
        { 'b.b': ['f'], c: ['11'] },
        { 'b.b': 'g', d: '21' },
        { 'b.b': ['k'], j: ['31'], 'j.j': ['41'] },
        { 'b.b': ['h'], k: ['51'], j: [61] },
        { 'b.b': 'i', e: ['71'] },
      ],
    }
    out = {
      'a[0].c[]': ['11'],
      'a[0][b.b][]': ['f'],
      'a[1].d': '21',
      'a[1][b.b]': 'g',
      'a[2].j[]': ['31'],
      'a[2][b.b][]': ['k'],
      'a[2][j.j][]': ['41'],
      'a[3].j[]': [61],
      'a[3].k[]': ['51'],
      'a[3][b.b][]': ['h'],
      'a[4].e[]': ['71'],
      'a[4][b.b]': 'i',
    }
    assert.deepEqual(JSONway.flatten(object), out)
  })

  it('nested real example', () => {
    const input = {
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

    const out = {
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

    assert.deepEqual(JSONway.flatten(input), out)
  })

  it('saas-example-response-cc.json', async () => {
    const object = await _getJsonAsync(
      './fixtures/saas-example-response-cc.json',
    )
    const out = await _getJsonAsync(
      './fixtures/saas-example-response-cc-flattened.json',
    )

    assert.deepEqual(JSONway.flatten(object), out)
  })

  it('saas-example-response-aa-expanded.json', async () => {
    const object = await _getJsonAsync(
      './fixtures/saas-example-response-aa-expanded.json',
    )
    const out = await _getJsonAsync(
      './fixtures/saas-example-response-aa-flattened.json',
    )

    assert.deepEqual(JSONway.flatten(object), out)
  })

  it('saas-example-response-aa-expanded.json .ee', async () => {
    const object = await _getJsonAsync(
      './fixtures/saas-example-response-aa-expanded.json',
    )
    const out = await _getJsonAsync(
      './fixtures/saas-example-response-bb-flattened.json',
    )

    assert.deepEqual(JSONway.flatten(object.ee), out)
  })

  it('nested-list-response.json', async () => {
    const object = await _getJsonAsync('./fixtures/nested-list-response.json')
    const out = await _getJsonAsync(
      './fixtures/nested-list-response-flattened.json',
    )

    // TODO: should be with `bb[1].ee[1].ff[0].gg[]`
    assert.deepEqual(JSONway.flatten(object), out)
  })
})
