import { assert } from 'chai'

import JSONway from '../index.js'

describe('path-analyzer', () => {
  it('empty', function () {
    assert.isNull(JSONway.pathDepth(''))
  })

  it('foo.bar.baz', function () {
    assert.deepEqual(JSONway.pathDepth(this.test.title), 0)
  })

  it('foo[3]', function () {
    assert.deepEqual(JSONway.pathDepth(this.test.title), 0)
  })

  it('[]', function () {
    assert.deepEqual(JSONway.pathDepth(this.test.title), 1)
  })

  it('foo.bar[]', function () {
    assert.deepEqual(JSONway.pathDepth(this.test.title), 1)
  })

  it(`foo['bar'][].baz`, function () {
    assert.deepEqual(JSONway.pathDepth(this.test.title), 1)
  })

  it(`foo.bar[].baz[].gee`, function () {
    assert.deepEqual(JSONway.pathDepth(this.test.title), 1)
  })

  it(`foo.bar[:].baz[].gee`, function () {
    assert.deepEqual(JSONway.pathDepth(this.test.title), 2)
  })

  it('foo[].bar{bee,gee}', function () {
    assert.deepEqual(JSONway.pathDepth(this.test.title), 2)
  })

  it('foo[].bar[]{bee,gee}', function () {
    assert.deepEqual(JSONway.pathDepth(this.test.title), 2)
  })

  it('foo[:].bar[]{bee,gee}', function () {
    assert.deepEqual(JSONway.pathDepth(this.test.title), 3)
  })
})
