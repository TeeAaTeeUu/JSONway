import { assert } from 'chai'

import { parseFunction, processFunction } from '../lib/function-processor.js'

describe('function-processor', () => {
  it('size', function () {
    let result = [4, 2, 7, 3]
    let output = 4

    let pipe = parseFunction(this.test.title)
    assert.deepEqual(processFunction(result, pipe), output)

    pipe = parseFunction('len')
    assert.deepEqual(processFunction(result, pipe), output)

    pipe = parseFunction('length')
    assert.deepEqual(processFunction(result, pipe), output)

    pipe = parseFunction('count')
    assert.deepEqual(processFunction(result, pipe), output)

    result = 10
    assert.deepEqual(processFunction(result, pipe), result)

    result = { b: 10 }
    assert.deepEqual(processFunction(result, pipe), result)
  })

  it('max', function () {
    let result = [4, 2, 7, 3]
    let output = 7

    const pipe = parseFunction(this.test.title)
    assert.deepEqual(processFunction(result, pipe), output)

    result = 10
    assert.deepEqual(processFunction(result, pipe), result)

    result = 'foo'
    assert.deepEqual(processFunction(result, pipe), result)
  })

  it('min', function () {
    let result = [4, 2, 7, 3]
    let output = 2

    const pipe = parseFunction(this.test.title)
    assert.deepEqual(processFunction(result, pipe), output)

    result = 10
    assert.deepEqual(processFunction(result, pipe), result)

    result = 'foo'
    assert.deepEqual(processFunction(result, pipe), result)
  })

  it('floor', function () {
    let result = 15.7
    let output = 15

    const pipe = parseFunction(this.test.title)
    assert.deepEqual(processFunction(result, pipe), output)

    result = -15.7
    output = -16
    assert.deepEqual(processFunction(result, pipe), output)

    result = 'foo'
    assert.deepEqual(processFunction(result, pipe), result)
  })

  it('ceil', function () {
    let result = 15.7
    let output = 16

    const pipe = parseFunction(this.test.title)
    assert.deepEqual(processFunction(result, pipe), output)

    result = -15.7
    output = -15
    assert.deepEqual(processFunction(result, pipe), output)

    result = 'foo'
    assert.deepEqual(processFunction(result, pipe), result)
  })

  it('trunc', function () {
    let result = 15.7
    let output = 15

    const pipe = parseFunction(this.test.title)
    assert.deepEqual(processFunction(result, pipe), output)

    result = -15.7
    output = -15
    assert.deepEqual(processFunction(result, pipe), output)

    result = 'foo'
    assert.deepEqual(processFunction(result, pipe), result)
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

    result = 'foo'
    assert.deepEqual(processFunction(result, pipe), result)
  })

  it('avg', function () {
    let result = [4, 2, 7, 3]
    const output = 4

    let pipe = parseFunction(this.test.title)
    assert.deepEqual(processFunction(result, pipe), output)

    pipe = parseFunction('average')
    assert.deepEqual(processFunction(result, pipe), output)

    result = 'foo'
    assert.deepEqual(processFunction(result, pipe), result)
  })

  it('sort', function () {
    let result = [4, 2, 'bc', 7, 'ab', 3, true, false, [], [3], { a: 5 }, {}]
    let output = [[], 2, 3, [3], 4, 7, { a: 5 }, {}, 'ab', 'bc', false, true]

    const pipe = parseFunction(this.test.title)
    assert.deepEqual(processFunction(result, pipe), output)

    result = ['cd', 'ab', 'de', 'cd']
    output = ['ab', 'cd', 'cd', 'de']
    assert.deepEqual(processFunction(result, pipe), output)

    result = 'foo'
    assert.deepEqual(processFunction(result, pipe), result)
  })

  it('reverse', function () {
    let result = [4, 2, 'bc', 7, 'ab', 3, true, false, [], [3], { a: 5 }, {}]
    const output = [{}, { a: 5 }, [3], [], false, true, 3, 'ab', 7, 'bc', 2, 4]

    const pipe = parseFunction(this.test.title)
    assert.deepEqual(processFunction(result, pipe), output)

    result = 'foo'
    assert.deepEqual(processFunction(result, pipe), result)
  })

  it('split._', function () {
    const result = 'a_b_c_d_e_f_g_h'
    const output = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

    const pipe = parseFunction(this.test.title)
    assert.deepEqual(processFunction(result, pipe), output)
  })

  it('split.0', function () {
    const result = 'a_b_c_d_e_f_g_h'

    const pipe = parseFunction(this.test.title)
    assert.deepEqual(processFunction(result, pipe), result)
  })

  it('split._.5', function () {
    let result = 'a_b_c_d_e_f_g_h'
    let output = 'f'

    let pipe = parseFunction(this.test.title)
    assert.deepEqual(processFunction(result, pipe), output)

    pipe = parseFunction('split._.-5')
    output = 'd'
    assert.deepEqual(processFunction(result, pipe), output)

    pipe = parseFunction('split._.()')
    output = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    assert.deepEqual(processFunction(result, pipe), output)

    result = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    pipe = parseFunction(this.test.title)
    output = 'f'
    assert.deepEqual(processFunction(result, pipe), output)
  })
})
