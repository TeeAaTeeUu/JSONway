import { assert } from 'chai'

import JSONway from '../index.js'
import { _getJsonAsync } from './_utils.js'

describe('analyzer', () => {
  it('{}', function () {
    const out = []
    assert.deepEqual(JSONway.analyze(JSON.parse(this.test.title)), out)
  })

  it('5', function () {
    const out = []
    assert.deepEqual(JSONway.analyze(JSON.parse(this.test.title)), out)
  })

  it('{"a":"b","c":false,"d":5}', function () {
    const out = ['a', 'c', 'd']
    assert.deepEqual(JSONway.analyze(JSON.parse(this.test.title)), out)
  })

  it('{"aa":"bb","cc":{"dd":55},"ee":"ff"}', function () {
    const out = ['aa', 'cc.dd', 'ee']
    assert.deepEqual(JSONway.analyze(JSON.parse(this.test.title)), out)
  })

  it('{"aa":"bb","c.c":{"dd":55},"e.e":"ff","gg":{}}', function () {
    const out = ['aa', '[c.c].dd', '[e.e]', 'gg']
    assert.deepEqual(JSONway.analyze(JSON.parse(this.test.title)), out)
  })

  it('{"a":"b","c":{"d":{"e":"f","g,":{"h":"i"}},"j":{"k":"l"},"x":"y"},"m":-1}', function () {
    const out = ['a', 'c.d.e', `c.d['g,'].h`, 'c.j.k', 'c.x', 'm']
    assert.deepEqual(JSONway.analyze(JSON.parse(this.test.title)), out)
  })

  it('{"a":"b","c":["ee","ff"],"d":5}', function () {
    const out = ['a', 'c[]', 'd']
    assert.deepEqual(JSONway.analyze(JSON.parse(this.test.title)), out)
  })

  it('{"a":"b","c":{"dd":["ee","ff"]},"e":5}', function () {
    const out = ['a', 'c.dd[]', 'e']
    assert.deepEqual(JSONway.analyze(JSON.parse(this.test.title)), out)
  })

  it('{"a":["bb","cc",[["dd",{"ee":"123"}],"ff"]]}', function () {
    const out = ['a[]', 'a[][]', 'a[][][]', 'a[][][].ee']
    assert.deepEqual(JSONway.analyze(JSON.parse(this.test.title)), out)
  })

  it('{"a":["bb","cc",[[{"dd":"123"},{"dd":"321"}]]]}', function () {
    const out = ['a[]', 'a[][][].dd']
    assert.deepEqual(JSONway.analyze(JSON.parse(this.test.title)), out)
  })

  it('{"a":["bb","cc",{"gg":[["dd",{"ee":"123"}],"ff"]}]}', function () {
    const out = ['a[]', 'a[].gg[]', 'a[].gg[][]', 'a[].gg[][].ee']
    assert.deepEqual(JSONway.analyze(JSON.parse(this.test.title)), out)
  })

  it(`{"a":"b","c":null,"d.f":10,"f'h":5}`, function () {
    const out = ['a', 'c', '[d.f]', `['f''h']`]
    assert.deepEqual(JSONway.analyze(JSON.parse(this.test.title)), out)
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
          { cc: [{ dd: 51, ee: { gg: 'e' }, ff: 'v' }] },
          {
            cc: [
              { dd: '61', ee: 'g', ff: 'u' },
              { dd: 71, ee: 'h', ff: 't' },
            ],
          },
          { cc: 'hh' },
        ],
      },
    }
    let out = [
      'aa.bb[].cc',
      'aa.bb[].cc[].dd',
      'aa.bb[].cc[].ee',
      'aa.bb[].cc[].ee.gg',
      'aa.bb[].cc[].ff',
    ]
    assert.deepEqual(JSONway.analyze(object), out)

    object = {
      a: [
        { 'b.b': ['f'], c: ['11'] },
        { 'b.b': 'g', d: '21' },
        { 'b.b': ['k'], j: ['31'], 'j.j': ['41'] },
        { 'b.b': ['h'], k: ['51'], j: [61] },
        { 'b.b': 'i', e: ['71'] },
      ],
    }

    out = [
      'a[].c[]',
      'a[].d',
      'a[].e[]',
      'a[].j[]',
      'a[].k[]',
      'a[][b.b]',
      'a[][b.b][]',
      'a[][j.j][]',
    ]
    assert.deepEqual(JSONway.analyze(object), out)
  })

  it('nested-list-response.json', async () => {
    const object = await _getJsonAsync('./fixtures/nested-list-response.json')

    const out = [
      'aa',
      'bb[].cc',
      'bb[].dd',
      'bb[].ee[].cc',
      'bb[].ee[].dd',
      'bb[].ee[].ff[].gg[]',
      'bb[].ee[].hh[].cc',
      'bb[].ee[].hh[].dd',
      'bb[].ee[].hh[].ii.cc',
      'bb[].ee[].hh[].ii.dd',
    ]
    assert.deepEqual(JSONway.analyze(object), out)
  })

  it('saas-example-response-cc.json', async () => {
    const object = await _getJsonAsync(
      './fixtures/saas-example-response-cc.json',
    )

    const out = [
      'aa',
      'bb',
      'cc',
      'dd',
      'ee[].ff',
      'ee[].gg.hh',
      'ee[].gg.ii',
      'ee[].gg.oo',
      'ee[].jj',
      'ee[].kk',
      'ee[].ll',
      'ee[].mm',
      'ee[].nn[]',
      'ee[].pp[].jj',
      'ee[].pp[].qq',
      'ee[].pp[].rr',
      'ee[].pp[].ss',
      'ee[].pp[].tt',
      'ee[].pp[].uu',
      'ee[].pp[].vv',
    ]

    assert.deepEqual(JSONway.analyze(object), out)
  })

  it('saas-example-response-aa-expanded.json', async () => {
    const object = await _getJsonAsync(
      './fixtures/saas-example-response-aa-expanded.json',
    )

    const out = [
      'aa',
      'bb',
      'bi.af',
      'bi.am',
      'bi.an',
      'bi.ap',
      'bi.as',
      'bi.av',
      'bi.ax',
      'bi.bd',
      'bi.ff',
      'bi.mm',
      'cc',
      'dd',
      'ee.am',
      'ee.an.ao.am',
      'ee.an.ao.bb',
      'ee.an.ao.cc',
      'ee.an.ao.jj',
      'ee.an.bb',
      'ee.an.cc',
      'ee.an.dd',
      'ee.an.jj',
      'ee.an.qq.rr',
      'ee.an.qq.ss',
      'ee.an.qq.tt',
      'ee.an.qq.uu',
      'ee.as',
      'ee.bd.az',
      'ee.bd.ba',
      'ee.bd.be',
      'ee.bd.bf',
      'ee.bd.bg',
      'ee.bd.bh',
      'ee.ff.cc',
      'ee.ff.gg',
      'ee.ff.hh',
      'ee.af[].ag.ah',
      'ee.af[].ag.ai',
      'ee.af[].ag.bb',
      'ee.af[].ag.jj',
      'ee.af[].aj.bb',
      'ee.af[].aj.cc',
      'ee.af[].aj.dd',
      'ee.af[].aj.ee.ak.al',
      'ee.af[].aj.ee.ak.jj',
      'ee.af[].bb',
      'ee.ap[].aq',
      'ee.ap[].ar.cc',
      'ee.ap[].ar.jj',
      'ee.ap[].ar.kk',
      'ee.ap[].ar.ll',
      'ee.ap[].as',
      'ee.ap[].at.ag',
      'ee.ap[].at.au',
      'ee.ap[].bb',
      'ee.ap[].cc',
      'ee.ap[].oo.cc',
      'ee.ap[].oo.jj',
      'ee.ap[].oo.kk',
      'ee.ap[].oo.ll',
      'ee.ap[].zz',
      'ee.av[].ag.ah',
      'ee.av[].ag.ai',
      'ee.av[].ag.bb',
      'ee.av[].ag.jj',
      'ee.av[].aj.bb',
      'ee.av[].aj.cc',
      'ee.av[].aj.dd',
      'ee.av[].aj.ee.ak.al',
      'ee.av[].aj.ee.ak.jj',
      'ee.av[].aw.bb',
      'ee.av[].aw.cc',
      'ee.av[].aw.dd',
      'ee.av[].aw.ee.ak.al',
      'ee.av[].aw.ee.ak.jj',
      'ee.av[].bb',
      'ee.ax[].ap',
      'ee.ax[].ar.cc',
      'ee.ax[].ar.jj',
      'ee.ax[].ar.kk',
      'ee.ax[].ar.ll',
      'ee.ax[].as',
      'ee.ax[].at.ag',
      'ee.ax[].at.au',
      'ee.ax[].ay',
      'ee.ax[].az',
      'ee.ax[].ba',
      'ee.ax[].bb',
      'ee.ax[].bc',
      'ee.ax[].cc',
      'ee.ax[].oo.cc',
      'ee.ax[].oo.jj',
      'ee.ax[].oo.kk',
      'ee.ax[].oo.ll',
      'ee.ff.ii[].cc',
      'ee.ff.ii[].jj',
      'ee.ff.ii[].kk',
      'ee.ff.ii[].ll',
      'ee.mm[].ab',
      'ee.mm[].ac',
      'ee.mm[].ad',
      'ee.mm[].ae',
      'ee.mm[].cc',
      'ee.mm[].nn',
      'ee.mm[].oo.cc',
      'ee.mm[].oo.dd',
      'ee.mm[].oo.jj',
      'ee.mm[].oo.kk',
      'ee.mm[].oo.ll',
      'ee.mm[].oo.pp',
      'ee.mm[].oo.qq.rr',
      'ee.mm[].oo.qq.ss',
      'ee.mm[].oo.qq.tt',
      'ee.mm[].oo.qq.uu',
      'ee.mm[].oo.vv',
      'ee.mm[].oo.ww',
      'ee.mm[].oo.xx',
      'ee.mm[].oo.yy',
      'ee.mm[].zz',
    ]

    assert.deepEqual(JSONway.analyze(object), out)
  })
})
