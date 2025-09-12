import { assert } from 'chai'

import { parseFunction, processFunction } from '../lib/function-processor.js'

describe('function-processor', () => {
  it('size', function () {
    const result = [4, 2, 7, 3]
    const output = 4

    let pipe = parseFunction(this.test.title)
    assert.deepEqual(processFunction(result, pipe), output)

    pipe = parseFunction('len')
    assert.deepEqual(processFunction(result, pipe), output)

    pipe = parseFunction('length')
    assert.deepEqual(processFunction(result, pipe), output)

    pipe = parseFunction('count')
    assert.deepEqual(processFunction(result, pipe), output)
  })

  it('max', function () {
    const result = [4, 2, 7, 3]
    const output = 7

    const pipe = parseFunction(this.test.title)
    assert.deepEqual(processFunction(result, pipe), output)
  })

  it('min', function () {
    const result = [4, 2, 7, 3]
    const output = 2

    const pipe = parseFunction(this.test.title)
    assert.deepEqual(processFunction(result, pipe), output)
  })

  it('floor', function () {
    let result = 15.7
    let output = 15

    const pipe = parseFunction(this.test.title)
    assert.deepEqual(processFunction(result, pipe), output)

    result = -15.7
    output = -16
    assert.deepEqual(processFunction(result, pipe), output)
  })

  it('ceil', function () {
    let result = 15.7
    let output = 16

    const pipe = parseFunction(this.test.title)
    assert.deepEqual(processFunction(result, pipe), output)

    result = -15.7
    output = -15
    assert.deepEqual(processFunction(result, pipe), output)
  })

  it('trunc', function () {
    let result = 15.7
    let output = 15

    const pipe = parseFunction(this.test.title)
    assert.deepEqual(processFunction(result, pipe), output)

    result = -15.7
    output = -15
    assert.deepEqual(processFunction(result, pipe), output)
  })

  it('round', function () {
    let result = 15.7
    let output = 16

    const pipe = parseFunction(this.test.title)
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

  it('avg', function () {
    const result = [4, 2, 7, 3]
    const output = 4

    let pipe = parseFunction(this.test.title)
    assert.deepEqual(processFunction(result, pipe), output)

    pipe = parseFunction('average')
    assert.deepEqual(processFunction(result, pipe), output)
  })

  it('sort', function () {
    const result = [4, 2, 'bc', 7, 'ab', 3, true, false, [], [3], { a: 5 }, {}]
    const output = [[], 2, 3, [3], 4, 7, { a: 5 }, {}, 'ab', 'bc', false, true]

    const pipe = parseFunction(this.test.title)
    assert.deepEqual(processFunction(result, pipe), output)
  })

  it('reverse', function () {
    const result = [4, 2, 'bc', 7, 'ab', 3, true, false, [], [3], { a: 5 }, {}]
    const output = [{}, { a: 5 }, [3], [], false, true, 3, 'ab', 7, 'bc', 2, 4]

    const pipe = parseFunction(this.test.title)
    assert.deepEqual(processFunction(result, pipe), output)
  })
})
