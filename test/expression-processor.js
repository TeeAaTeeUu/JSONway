import { assert } from 'chai'

import JSONway from '../index.js'

describe('expression-processor', () => {
  it(`ab.cd='foo'`, function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)[0]

    let input = { ab: { cd: 'foo' } }
    assert.isTrue(JSONway.calculateExpression(parsedExpression, null, input))

    input = { ab: { cd: 'bar' } }
    assert.isFalse(JSONway.calculateExpression(parsedExpression, null, input))

    input = { ab: { ce: 'foo' } }
    assert.isFalse(JSONway.calculateExpression(parsedExpression, null, input))

    input = { cd: { ab: 'foo' } }
    assert.isFalse(JSONway.calculateExpression(parsedExpression, null, input))
  })

  it(`7 + 10 - 2 > 12`, function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)[0]

    assert.isTrue(JSONway.calculateExpression(parsedExpression, null, {}))
  })

  it(`7 + 10 - 2 < 12`, function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)[0]

    assert.isFalse(JSONway.calculateExpression(parsedExpression, null, {}))
  })

  it(`(7 + 10 - 2) > (12 + 5)`, function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)[0]

    assert.isFalse(JSONway.calculateExpression(parsedExpression, null, {}))
  })

  it.skip(`7 + 10 - 2 > 12 + 5`, function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)[0]

    assert.isFalse(JSONway.calculateExpression(parsedExpression, null, {}))
  })

  it.skip(`7 > 5 > 3`, function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)[0]

    assert.isTrue(JSONway.calculateExpression(parsedExpression, null, {}))
  })

  it.skip(`7 > 5 < 3`, function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)[0]

    assert.isFalse(JSONway.calculateExpression(parsedExpression, null, {}))
  })

  it(`7 + 10`, function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)[0]

    assert.deepEqual(
      JSONway.calculateExpression(parsedExpression, null, {}),
      17,
    )
  })

  it(`7 + 10 - 5`, function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)[0]
    assert.deepEqual(
      JSONway.calculateExpression(parsedExpression, null, {}),
      12,
    )
  })

  it(`7 + 10 - 5 + 1 + (-5 - 3 + 1) + 3`, function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)[0]
    assert.deepEqual(JSONway.calculateExpression(parsedExpression, null, {}), 9)
  })

  it(`ab.cd='foo'&&x>10`, function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)[0]

    let input = { ab: { cd: 'foo' }, x: 12 }
    assert.isTrue(JSONway.calculateExpression(parsedExpression, null, input))

    input = { ab: { cd: 'bar' }, x: 12 }
    assert.isFalse(JSONway.calculateExpression(parsedExpression, null, input))

    input = { ab: { cd: 'foo' }, x: 10 }
    assert.isFalse(JSONway.calculateExpression(parsedExpression, null, input))
  })

  it(`ab.cd = 'foo' && ( x>10 || y?)`, function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)[0]

    let input = { ab: { cd: 'foo' }, x: 12 }
    assert.isTrue(JSONway.calculateExpression(parsedExpression, null, input))

    input = { ab: { cd: 'foo' }, x: 10, y: 7 }
    assert.isTrue(JSONway.calculateExpression(parsedExpression, null, input))

    input = { ab: { cd: 'foo' }, x: 10 }
    assert.isFalse(JSONway.calculateExpression(parsedExpression, null, input))
  })

  it(`x>10 || y? || x=7`, function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)[0]

    let input = { x: 12 }
    assert.isTrue(JSONway.calculateExpression(parsedExpression, null, input))

    input = { x: 10, y: 7 }
    assert.isTrue(JSONway.calculateExpression(parsedExpression, null, input))

    input = { x: 7 }
    assert.isTrue(JSONway.calculateExpression(parsedExpression, null, input))

    input = {}
    assert.isFalse(JSONway.calculateExpression(parsedExpression, null, input))

    input = { x: 6 }
    assert.isFalse(JSONway.calculateExpression(parsedExpression, null, input))
  })

  it(`x>10 || (y?) || (x=7)`, function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)[0]

    let input = { x: 12 }
    assert.isTrue(JSONway.calculateExpression(parsedExpression, null, input))

    input = { x: 10, y: 7 }
    assert.isTrue(JSONway.calculateExpression(parsedExpression, null, input))

    input = { x: 7 }
    assert.isTrue(JSONway.calculateExpression(parsedExpression, null, input))

    input = {}
    assert.isFalse(JSONway.calculateExpression(parsedExpression, null, input))

    input = { x: 6 }
    assert.isFalse(JSONway.calculateExpression(parsedExpression, null, input))
  })

  it(`ab.cd = 'foo' && ( x>10 || y?) || (ab? && x=10)`, function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)[0]

    let input = { ab: { cd: 'foo' }, x: 12 }
    assert.isTrue(JSONway.calculateExpression(parsedExpression, null, input))

    input = { ab: { cd: 'foo' }, x: 10, y: 7 }
    assert.isTrue(JSONway.calculateExpression(parsedExpression, null, input))

    input = { ab: { cd: 'foo' }, x: 10 }
    assert.isTrue(JSONway.calculateExpression(parsedExpression, null, input))

    input = { ab: { cd: 'foo' } }
    assert.isFalse(JSONway.calculateExpression(parsedExpression, null, input))

    input = { ab: { cd: 'bar' }, x: 11 }
    assert.isFalse(JSONway.calculateExpression(parsedExpression, null, input))
  })

  it(`(ab.cd='foo' && (((ab?))))`, function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)[0]

    let input = { ab: { cd: 'foo' } }
    assert.isTrue(JSONway.calculateExpression(parsedExpression, null, input))

    input = { ab: true }
    assert.isFalse(JSONway.calculateExpression(parsedExpression, null, input))
  })

  it(`x~='bar'`, function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)[0]

    let input = { x: 'foobarbaz' }
    assert.isTrue(JSONway.calculateExpression(parsedExpression, null, input))

    input = { x: 'bar' }
    assert.isTrue(JSONway.calculateExpression(parsedExpression, null, input))

    input = { x: 'foobaz' }
    assert.isFalse(JSONway.calculateExpression(parsedExpression, null, input))

    input = { x: 10 }
    assert.isFalse(JSONway.calculateExpression(parsedExpression, null, input))

    input = { y: 'bar' }
    assert.isFalse(JSONway.calculateExpression(parsedExpression, null, input))
  })

  it('x = $', function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)[0]

    let input = { x: 'baz' }
    let values = ['foo', 'baz', 'bar']
    assert.isTrue(JSONway.calculateExpression(parsedExpression, values, input))
    assert.isTrue(JSONway.calculateExpression(parsedExpression, 'baz', input))

    values = ['foo', 'bar']
    assert.isFalse(JSONway.calculateExpression(parsedExpression, values, input))

    assert.isFalse(JSONway.calculateExpression(parsedExpression, 'bar', input))
  })

  it('x=$ || y=$', function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)[0]

    let input = { x: 'baz', y: 'foo' }
    let values = ['foo', 'baz', 'bar']
    assert.isTrue(JSONway.calculateExpression(parsedExpression, values, input))

    assert.isTrue(JSONway.calculateExpression(parsedExpression, 'baz', input))
    assert.isTrue(JSONway.calculateExpression(parsedExpression, 'foo', input))

    input = { y: 'foo' }
    assert.isTrue(JSONway.calculateExpression(parsedExpression, 'foo', input))

    input = { x: 'baz', y: 'foo' }
    values = ['bar']
    assert.isFalse(JSONway.calculateExpression(parsedExpression, values, input))

    assert.isFalse(JSONway.calculateExpression(parsedExpression, 'bar', input))
  })

  it('!x', function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)[0]

    let input = { x: true, y: 'foo' }
    assert.isFalse(JSONway.calculateExpression(parsedExpression, [], input))

    input = { x: 'baz', y: 'foo' }
    assert.isFalse(JSONway.calculateExpression(parsedExpression, [], input))

    input = { x: false, y: 'foo' }
    assert.isTrue(JSONway.calculateExpression(parsedExpression, [], input))

    input = { y: 'foo' }
    assert.isTrue(JSONway.calculateExpression(parsedExpression, [], input))
  })

  it('ab + 2', function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)[0]

    let input = { ab: 5 }
    assert.deepEqual(
      JSONway.calculateExpression(parsedExpression, null, input),
      7,
    )

    input = { ab: 'foo' }
    assert.deepEqual(
      JSONway.calculateExpression(parsedExpression, null, input),
      'foo2',
    )
  })

  it('ab - 2', function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)[0]

    let input = { ab: 5 }
    assert.deepEqual(
      JSONway.calculateExpression(parsedExpression, null, input),
      3,
    )

    input = { ab: 'foo' }
    assert.deepEqual(
      JSONway.calculateExpression(parsedExpression, null, input),
      null,
    )
  })

  it('ab / 2', function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)[0]

    let input = { ab: 5 }
    assert.deepEqual(
      JSONway.calculateExpression(parsedExpression, null, input),
      2.5,
    )

    input = { ab: 'foo' }
    assert.deepEqual(
      JSONway.calculateExpression(parsedExpression, null, input),
      null,
    )
  })

  it('ab * 2', function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)[0]

    let input = { ab: 5 }
    assert.deepEqual(
      JSONway.calculateExpression(parsedExpression, null, input),
      10,
    )

    input = { ab: 'foo' }
    assert.deepEqual(
      JSONway.calculateExpression(parsedExpression, null, input),
      null,
    )
  })

  it('ab.cd >= 20 && (ab.cd / 2)', function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)[0]

    let input = { ab: { cd: 30 } }
    assert.deepEqual(
      JSONway.calculateExpression(parsedExpression, null, input),
      15,
    )

    input = { ab: { cd: 15 } }
    assert.deepEqual(
      JSONway.calculateExpression(parsedExpression, null, input),
      false,
    )
  })

  it('(ab.cd >= 20 && (ab.cd / 2)) || (ab.cd >= 10 && (ab.cd+0)) || 10', function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)[0]

    let input = { ab: { cd: 30 } }
    assert.deepEqual(
      JSONway.calculateExpression(parsedExpression, null, input),
      15,
    )

    input = { ab: { cd: 14 } }
    assert.deepEqual(
      JSONway.calculateExpression(parsedExpression, null, input),
      14,
    )

    input = { ab: { cd: 7 } }
    assert.deepEqual(
      JSONway.calculateExpression(parsedExpression, null, input),
      10,
    )
  })

  it('ab + 2 + cd.ab - cd.ef', function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)[0]

    let input = { ab: 10, cd: { ab: 5, ef: 11 } }
    assert.deepEqual(
      JSONway.calculateExpression(parsedExpression, null, input),
      6,
    )

    input = { ab: 2, cd: { ab: 5, ef: 11 } }
    assert.deepEqual(
      JSONway.calculateExpression(parsedExpression, null, input),
      -2,
    )

    input = { ab: 10, cd: { ab: 7 } }
    assert.deepEqual(
      JSONway.calculateExpression(parsedExpression, null, input),
      19,
    )

    input = { ab: 10, cd: { ef: 7 } }
    assert.deepEqual(
      JSONway.calculateExpression(parsedExpression, null, input),
      5,
    )
  })

  it(`7 = [1,2,3,4]`, function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)[0]

    assert.isFalse(JSONway.calculateExpression(parsedExpression, null, {}))
  })

  it(`c[].d='a2'`, function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)[0]

    let data = { c: [{ d: 'a1' }, { d: 'a3' }] }
    assert.isFalse(JSONway.calculateExpression(parsedExpression, null, data))

    data = { c: [{ d: 'a1' }, { d: 'a2' }, { d: 'a3' }] }
    assert.isTrue(JSONway.calculateExpression(parsedExpression, null, data))
  })

  it(`.[0]='xx'`, function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)[0]

    assert.isTrue(
      JSONway.calculateExpression(parsedExpression, null, ['xx', 'yy']),
    )

    assert.isFalse(
      JSONway.calculateExpression(parsedExpression, null, ['yy', 'xx']),
    )
  })

  it(`7 = [1,2,7,3,4]`, function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)[0]

    assert.isTrue(JSONway.calculateExpression(parsedExpression, null, {}))
  })

  it(`5 + [1,2,3,4]`, function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)[0]

    assert.deepEqual(
      JSONway.calculateExpression(parsedExpression, null, {}),
      15,
    )
  })

  it(`20 - [1,2,3,true,4]`, function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)[0]

    assert.deepEqual(JSONway.calculateExpression(parsedExpression, null, {}), 9)
  })

  it(`10 + [1,2,ab.cd,null,true,4]`, function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)[0]

    let input = { ab: { cd: 10 } }
    assert.deepEqual(
      JSONway.calculateExpression(parsedExpression, null, input),
      28,
    )

    input = { ab: { ef: 10 } }
    assert.deepEqual(
      JSONway.calculateExpression(parsedExpression, null, input),
      18,
    )
  })

  it(`$ >= 20`, function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)[0]

    let values = 20
    assert.isTrue(JSONway.calculateExpression(parsedExpression, values, {}))

    values = 25
    assert.isTrue(JSONway.calculateExpression(parsedExpression, values, {}))

    values = 15
    assert.isFalse(JSONway.calculateExpression(parsedExpression, values, {}))
  })

  it(`20 <= $`, function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)[0]

    let values = 20
    assert.isTrue(JSONway.calculateExpression(parsedExpression, values, {}))

    values = 25
    assert.isTrue(JSONway.calculateExpression(parsedExpression, values, {}))

    values = 15
    assert.isFalse(JSONway.calculateExpression(parsedExpression, values, {}))
  })
})
