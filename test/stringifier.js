import { assert } from 'chai'

import JSONway from '../index.js'

describe('stringify', () => {
  it('a', function () {
    const out = 'a'
    assert.deepEqual(JSONway.stringify(this.test.title), out)
  })

  it('a;', function () {
    const out = 'a;'
    assert.deepEqual(JSONway.stringify(this.test.title), out)
  })

  it('a|', function () {
    const out = 'a|'
    assert.deepEqual(JSONway.stringify(this.test.title), out)
  })

  it('["a"]', function () {
    const out = '["a"]'
    assert.deepEqual(JSONway.stringify(JSON.parse(this.test.title)), out)
  })

  it('false', function () {
    const out = 'false'
    assert.deepEqual(JSONway.stringify(this.test.title), out)
  })

  it('true', function () {
    const out = 'true'
    assert.deepEqual(JSONway.stringify(this.test.title), out)
  })

  it('null', function () {
    const out = 'null'
    assert.deepEqual(JSONway.stringify(this.test.title), out)
  })

  it('12345', function () {
    const out = '12345'
    assert.deepEqual(JSONway.stringify(this.test.title), out)
  })

  it('123456789012345678901234567890', function () {
    const out = '123456789012345678901234567890'
    assert.deepEqual(JSONway.stringify(this.test.title), out)
  })
})
