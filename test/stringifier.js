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
    assert.deepEqual(JSONway.stringify(false), out)
  })

  it('true', function () {
    const out = 'true'
    assert.deepEqual(JSONway.stringify(true), out)
  })

  it('null', function () {
    const out = 'null'
    assert.deepEqual(JSONway.stringify(null), out)
    assert.deepEqual(JSONway.stringify(this.test.title), out)
  })

  it('undefined', function () {
    let out = ''
    assert.deepEqual(JSONway.stringify(undefined), out)

    out = 'undefined'
    assert.deepEqual(JSONway.stringify(this.test.title), out)
  })

  it('12345', function () {
    const out = '12345'
    assert.deepEqual(JSONway.stringify(12345), out)
    assert.deepEqual(JSONway.stringify(this.test.title), out)
  })

  it('12345678901234567', function () {
    let out = '12345678901234568'
    // eslint-disable-next-line no-loss-of-precision
    assert.deepEqual(JSONway.stringify(12345678901234567), out)

    out = '12345678901234567'
    assert.deepEqual(JSONway.stringify(this.test.title), out)
  })

  it('foo', function () {
    const out = 'foo'
    assert.deepEqual(JSONway.stringify(this.test.title), out)
  })

  it(`fo'o`, function () {
    const out = `'fo''o'`
    assert.deepEqual(JSONway.stringify(this.test.title), out)
  })

  it('fo\to', function () {
    let out = 'fo\to'
    assert.deepEqual(JSONway.stringify(this.test.title), out)

    let input = '\tfoo'
    out = `'\tfoo'`
    assert.deepEqual(JSONway.stringify(input), out)

    input = 'foo\t'
    out = `'foo\t'`
    assert.deepEqual(JSONway.stringify(input), out)
  })

  it('fo\ro', function () {
    const out = `'fo\ro'`
    assert.deepEqual(JSONway.stringify(this.test.title), out)
  })

  it(`fo

    o`, function () {
    const out = `'fo

    o'`
    assert.deepEqual(JSONway.stringify(this.test.title), out)
  })

  it('Symbol()', function () {
    assert.equal(JSONway.stringify(Symbol('foo')), '')
  })
})
