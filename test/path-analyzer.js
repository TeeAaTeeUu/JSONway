import { assert } from 'chai'

import { pathDepth } from '../lib/path-analyzer.js'

describe('path-analyzer', () => {
  it('empty', function () {
    assert.isNull(pathDepth(''))
  })

  it('foo.bar.baz', function () {
    assert.deepEqual(pathDepth(this.test.title), 0)
  })

  it('foo[3]', function () {
    assert.deepEqual(pathDepth(this.test.title), 0)
  })

  it('[]', function () {
    assert.deepEqual(pathDepth(this.test.title), 1)
  })

  it('foo.bar[]', function () {
    assert.deepEqual(pathDepth(this.test.title), 1)
  })

  it('foo.bar[1,3].baz', function () {
    assert.deepEqual(pathDepth(this.test.title), 1)
  })

  it(`foo['bar'][].baz`, function () {
    assert.deepEqual(pathDepth(this.test.title), 1)
  })

  it(`foo.bar[].baz[].gee`, function () {
    assert.deepEqual(pathDepth(this.test.title), 1)
  })

  it(`foo.bar[:].baz[].gee`, function () {
    assert.deepEqual(pathDepth(this.test.title), 2)
  })

  it(`foo.bar[:#].baz[].gee[]`, function () {
    assert.deepEqual(pathDepth(this.test.title), 2)
  })

  it('foo[].bar{bee,gee}', function () {
    assert.deepEqual(pathDepth(this.test.title), 2)
  })

  it('foo[].bar[]{bee,gee}', function () {
    assert.deepEqual(pathDepth(this.test.title), 2)
  })

  it('foo[:].bar[]{bee,gee}', function () {
    assert.deepEqual(pathDepth(this.test.title), 3)
  })
})
