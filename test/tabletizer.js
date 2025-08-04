import { assert } from 'chai'

import JSONway from '../index.js'
import { _getJsonAsync, _arrayOfObjects } from './_utils.js'

const nestedListResponse = await _getJsonAsync(
  './fixtures/nested-list-response.json',
)

describe('tabletizer', () => {
  it('nested-list-response.json flat', () => {
    const object = JSON.parse(JSON.stringify(nestedListResponse))
    const path = `[{
      bb[*].dd,
      bb[].ee[*].dd,
      bb[].ee[].hh[*].dd,
      bb[].ee[].hh[].ii.dd,
      aa,
      bb[].cc,
    }]`

    const out = _arrayOfObjects([
      [
        'bb[0].dd',
        'bb[0].ee[0].dd',
        'bb[0].ee[0].hh[0].dd',
        'bb[0].ee[0].hh[0].ii.dd',
        'aa',
        'bb[0].cc',
      ],
      ['dd1', 'dd2', 'dd3', 'dd4', 'aa1', 'cc1'],
      ['dd1', 'dd2', 'dd5', 'dd6', 'aa1', 'cc1'],
      ['dd1', 'dd7', 'dd8', 'dd9', 'aa1', 'cc1'],
      ['dd1', 'dd7', 'dd10', 'dd11', 'aa1', 'cc1'],
      ['dd12', 'dd13', 'dd14', 'dd15', 'aa1', 'cc12'],
      ['dd12', 'dd13', 'dd16', 'dd17', 'aa1', 'cc12'],
      ['dd12', 'dd18', 'dd19', 'dd20', 'aa1', 'cc12'],
      ['dd12', 'dd18', 'dd21', 'dd22', 'aa1', 'cc12'],
    ])

    assert.deepEqual(JSONway.get(object, path), out)

    object.bb.push(JSON.parse(JSON.stringify(object.bb[0])))
    out.push(...JSON.parse(JSON.stringify(out.slice(0, 4))))
    assert.deepEqual(JSONway.get(object, path), out)
  })

  it('nested-list-response.json lists', () => {
    const object = nestedListResponse
    const path = `[{
      bb[*].dd,
      bb[].ee[*].dd,
      bb[].ee[].hh[].ii.dd,
      aa,
      bb[].ee[].hh[].dd,
      bb[].cc,
    }]`

    // prettier-ignore
    const out = _arrayOfObjects([
      [
        'bb[0].dd',
        'bb[0].ee[0].dd',
        'bb[0].ee[0].hh[].dd',
        'bb[0].ee[0].hh[].ii.dd',
        'aa',
        'bb[0].cc',
      ],
      ['dd1', 'dd2', ['dd3', 'dd5'], ['dd4', 'dd6'], 'aa1', 'cc1'],
      ['dd1', 'dd7', ['dd8', 'dd10'], ['dd9', 'dd11'], 'aa1', 'cc1'],
      ['dd12', 'dd13', ['dd14', 'dd16'], ['dd15', 'dd17'], 'aa1', 'cc12'],
      ['dd12', 'dd18', ['dd19', 'dd21'], ['dd20', 'dd22'], 'aa1', 'cc12'],
    ])

    assert.deepEqual(JSONway.get(object, path), out)
  })

  it('nested-list-response.json deep group, shallow fields', () => {
    const object = nestedListResponse
    const path = `[{
      bb[].ee[].hh[*].ii.dd,
      aa,
      bb[].cc,
      bb[].ee[].cc,
      bb[].ee[].hh[].dd,
    }]`

    const out = _arrayOfObjects([
      [
        'bb[0].ee[0].hh[0].ii.dd',
        'aa',
        'bb[0].cc',
        'bb[0].ee[0].cc',
        'bb[0].ee[0].hh[0].dd',
      ],
      ['dd4', 'aa1', 'cc1', 'cc2', 'dd3'],
      ['dd6', 'aa1', 'cc1', 'cc2', 'dd5'],
      ['dd9', 'aa1', 'cc1', 'cc7', 'dd8'],
      ['dd11', 'aa1', 'cc1', 'cc7', 'dd10'],
      ['dd15', 'aa1', 'cc12', 'cc13', 'dd14'],
      ['dd17', 'aa1', 'cc12', 'cc13', 'dd16'],
      ['dd20', 'aa1', 'cc12', 'cc18', 'dd19'],
      ['dd22', 'aa1', 'cc12', 'cc18', 'dd21'],
    ])

    assert.deepEqual(JSONway.get(object, path), out)
  })

  it('nested-list-response.json no group, deep fields', () => {
    const object = nestedListResponse
    let path = `[{
      aa,
      bb[].dd,
      bb[].ee[].cc,
      bb[].ee[].hh[].dd,
    }]`

    // prettier-ignore
    let out = [
      {
        aa: 'aa1',
        'bb[].dd': ['dd1', 'dd12'],
        'bb[].ee[].cc': ['cc2', 'cc7', 'cc13', 'cc18'],
        'bb[].ee[].hh[].dd': ['dd3', 'dd5', 'dd8', 'dd10', 'dd14', 'dd16', 'dd19', 'dd21'],
      },
    ]

    assert.deepEqual(JSONway.get(object, path), out)

    path = `{
      aa,
      bb[].dd,
      bb[].ee[].cc,
      bb[].ee[].hh[].dd,
    }`

    assert.deepEqual(JSONway.get(object, path), out[0])

    path = `[{
      aa,
      bb[].dd,
      bb[:].ee[].cc,
      bb[:].ee[:].hh[].dd,
    }]`

    out = [
      {
        aa: 'aa1',
        'bb[].dd': ['dd1', 'dd12'],
        'bb[:].ee[].cc': [
          ['cc2', 'cc7'],
          ['cc13', 'cc18'],
        ],
        'bb[:].ee[:].hh[].dd': [
          ['dd3', 'dd5'],
          ['dd8', 'dd10'],
          ['dd14', 'dd16'],
          ['dd19', 'dd21'],
        ],
      },
    ]

    assert.deepEqual(JSONway.get(object, path), out)
  })

  it('nested-list-response.json invalid un-nested field', () => {
    const object = nestedListResponse
    let path = `[{
      account_i,
      bb[].dd,
      bb[].ee[].cc,
      bb[].ee[].hh[].dd,
    }]`

    // prettier-ignore
    const out = [
      {
        'bb[].dd': ['dd1', 'dd12'],
        'bb[].ee[].cc': ['cc2', 'cc7', 'cc13', 'cc18'],
        'bb[].ee[].hh[].dd': ['dd3', 'dd5', 'dd8', 'dd10', 'dd14', 'dd16', 'dd19', 'dd21'],
      },
    ]

    assert.deepEqual(JSONway.get(object, path), out)

    path = `{
      account_i,
      bb[].dd,
      bb[].ee[].cc,
      bb[].ee[].hh[].dd,
    }`

    assert.deepEqual(JSONway.get(object, path), out[0])
  })

  it('nested-list-response.json invalid fields', () => {
    const object = nestedListResponse
    let path = `[{
      aa,
      bb[].dd,
      bb[].hhts[].cc
  }]`

    const out = [
      {
        aa: 'aa1',
        'bb[].dd': ['dd1', 'dd12'],
      },
    ]

    assert.deepEqual(JSONway.get(object, path), out)

    path = `{
      aa,
      bb[].dd,
      bb[].hhts[].cc
    }`

    out[0]['bb[].hhts[].cc'] = [] // multi-getter leaves it as empty list
    assert.deepEqual(JSONway.get(object, path), out[0])
  })

  it('nested-list-response.json lists with unmatching nested paths', () => {
    const object = nestedListResponse
    const path = `[{
      bb[*].dd,
      bb[].ee[*].dd,
      bb[].ee[].hh[].ii.dd,
      aa,
      bb[].ee[].hh[].dd,
      bb[].ee[].ff[].gg[],
      bb[].cc,
    }]`

    // prettier-ignore
    const out = _arrayOfObjects([
      [
        'bb[0].dd',
        'bb[0].ee[0].dd',
        'bb[0].ee[0].hh[].dd',
        'bb[0].ee[0].hh[].ii.dd',
        'bb[0].ee[0].ff[].gg[]',
        'aa',
        'bb[0].cc',
      ],
      ['dd1', 'dd2', ['dd3', 'dd5'], ['dd4', 'dd6'], ['01', '11', '02', '12'], 'aa1', 'cc1'],
      ['dd1', 'dd7', ['dd8', 'dd10'], ['dd9', 'dd11'], ['03', '13'], 'aa1', 'cc1'],
      ['dd12', 'dd13', ['dd14', 'dd16'], ['dd15', 'dd17'], undefined, 'aa1', 'cc12'],
      ['dd12', 'dd18', ['dd19', 'dd21'], ['dd20', 'dd22'], ['04', '14'], 'aa1', 'cc12'],
    ])

    assert.deepEqual(JSONway.get(object, path), out)

    // TODO: add unmatching-path tests for unflat, unique, and expanding
  })

  it('saas-example-response-aa-expanded.json', async () => {
    const object = await _getJsonAsync(
      './fixtures/saas-example-response-aa-expanded.json',
    )
    const path = `[{
      ee.mm[*].oo.jj,
      ee.av[*].aw.bb,
      ee.mm[].nn,
      ee.av[].aj.ee.ak.jj,
      ee.av[].aw.ee.ak.jj,
      ee.ax[].ap,
      ee.an.jj,
      ee.an.qq.uu,
      ee.af[].aj.dd,
      ee.bd.ba,
    }]`

    const out = [
      {
        'ee.af[].aj.dd': ['dd3'],
        'ee.an.jj': 'jj5',
        'ee.an.qq.uu': 'uu2',
        'ee.av[0].aw.bb': 'bb15',
        'ee.av[0].aw.ee.ak.jj': 'jj16',
        'ee.ax[].ap': ['ap1'],
        'ee.bd.ba': 2,
        'ee.mm[0].nn': 'nn1',
        'ee.mm[0].oo.jj': 'jj2',
        // 'ee.av[0].aj.ee.ak.jj': undefined,
      },
    ]

    assert.deepEqual(JSONway.get(object, path), out)
  })
})
