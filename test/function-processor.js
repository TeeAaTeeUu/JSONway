import { assert } from 'chai'

import { processFunction } from '../lib/function-processor.js'
import JSONway from '../index.js'

describe('function-processor', () => {
  it('size', function () {
    const result = [4, 2, 7, 3]
    const output = 4

    const pipe = JSONway.parse(this.test.title)
    assert.deepEqual(processFunction(result, pipe), output)
  })

  it('max', function () {
    const result = [4, 2, 7, 3]
    const output = 7

    const pipe = JSONway.parse(this.test.title)
    assert.deepEqual(processFunction(result, pipe), output)
  })

  it('min', function () {
    const result = [4, 2, 7, 3]
    const output = 2

    const pipe = JSONway.parse(this.test.title)
    assert.deepEqual(processFunction(result, pipe), output)
  })

  it('floor', function () {
    let result = 15.7
    let output = 15

    const pipe = JSONway.parse(this.test.title)
    assert.deepEqual(processFunction(result, pipe), output)

    result = -15.7
    output = -16
    assert.deepEqual(processFunction(result, pipe), output)
  })

  it('ceil', function () {
    let result = 15.7
    let output = 16

    const pipe = JSONway.parse(this.test.title)
    assert.deepEqual(processFunction(result, pipe), output)

    result = -15.7
    output = -15
    assert.deepEqual(processFunction(result, pipe), output)
  })

  it('trunc', function () {
    let result = 15.7
    let output = 15

    const pipe = JSONway.parse(this.test.title)
    assert.deepEqual(processFunction(result, pipe), output)

    result = -15.7
    output = -15
    assert.deepEqual(processFunction(result, pipe), output)
  })

  it('round', function () {
    let result = 15.7
    let output = 16

    const pipe = JSONway.parse(this.test.title)
    assert.deepEqual(processFunction(result, pipe), output)

    result = 15.4
    output = 15
    assert.deepEqual(processFunction(result, pipe), output)

    result = -15.7
    output = -16
    assert.deepEqual(processFunction(result, pipe), output)

    result = -15.3
    output = -15
    assert.deepEqual(processFunction(result, pipe), output)
  })
})
