import { assert } from 'chai'

import JSONway from '../index.js'

describe('expression-processor', () => {
  it(`ab.cd='foo'`, function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)

    let input = { ab: { cd: 'foo' } }
    assert.isTrue(JSONway.calculateExpression(this.test.title, null, input))
    assert.isTrue(JSONway.calculateExpression(parsedExpression, null, input))

    input = { ab: { cd: 'bar' } }
    assert.isFalse(JSONway.calculateExpression(this.test.title, null, input))
    assert.isFalse(JSONway.calculateExpression(parsedExpression, null, input))

    input = { ab: { ce: 'foo' } }
    assert.isFalse(JSONway.calculateExpression(parsedExpression, null, input))

    input = { cd: { ab: 'foo' } }
    assert.isFalse(JSONway.calculateExpression(parsedExpression, null, input))
  })

  it(`7 + 10 - 2 > 12`, function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)

    assert.isTrue(JSONway.calculateExpression(parsedExpression, null, {}))
  })

  it(`15 % 4 = 3`, function () {
    assert.isTrue(JSONway.calculateExpression(this.test.title, null, {}))
  })

  it(`7 + 10 - 2 < 12`, function () {
    assert.isFalse(JSONway.calculateExpression(this.test.title, null, {}))
  })

  it(`(7 + 10 - 2) > (12 + 5)`, function () {
    assert.isFalse(JSONway.calculateExpression(this.test.title, null, {}))
  })

  it.skip(`7 + 10 - 2 > 12 + 5`, function () {
    assert.isFalse(JSONway.calculateExpression(this.test.title, null, {}))
  })

  it.skip(`7 > 5 > 3`, function () {
    assert.isTrue(JSONway.calculateExpression(this.test.title, null, {}))
  })

  it.skip(`7 > 5 < 3`, function () {
    assert.isFalse(JSONway.calculateExpression(this.test.title, null, {}))
  })

  it('15 - 10 -', function () {
    assert.equal(JSONway.calculateExpression(this.test.title, null, {}), 5)
  })

  it(`7 + 10`, function () {
    assert.deepEqual(JSONway.calculateExpression(this.test.title, null, {}), 17)
  })

  it(`7 + 10 - 5`, function () {
    assert.deepEqual(JSONway.calculateExpression(this.test.title, null, {}), 12)
  })

  it(`7 + 10 - 5 + 1 + (-5 - 3 + 1) + 3`, function () {
    assert.deepEqual(JSONway.calculateExpression(this.test.title, null, {}), 9)
  })

  it('true && true', function () {
    assert.isTrue(JSONway.calculateExpression(this.test.title, null, {}))
  })

  it('false || true', function () {
    assert.isTrue(JSONway.calculateExpression(this.test.title, null, {}))
  })

  it('false && true', function () {
    assert.isFalse(JSONway.calculateExpression(this.test.title, null, {}))
  })

  it('true && false', function () {
    assert.isFalse(JSONway.calculateExpression(this.test.title, null, {}))
  })

  it(`ab.cd='foo'&&x>10`, function () {
    let input = { ab: { cd: 'foo' }, x: 12 }
    assert.isTrue(JSONway.calculateExpression(this.test.title, null, input))

    input = { ab: { cd: 'bar' }, x: 12 }
    assert.isFalse(JSONway.calculateExpression(this.test.title, null, input))

    input = { ab: { cd: 'foo' }, x: 10 }
    assert.isFalse(JSONway.calculateExpression(this.test.title, null, input))
  })

  it(`ab.cd = 'foo' && ( x>10 || y?)`, function () {
    let input = { ab: { cd: 'foo' }, x: 12 }
    assert.isTrue(JSONway.calculateExpression(this.test.title, null, input))

    input = { ab: { cd: 'foo' }, x: 10, y: 7 }
    assert.isTrue(JSONway.calculateExpression(this.test.title, null, input))

    input = { ab: { cd: 'foo' }, x: 10 }
    assert.isFalse(JSONway.calculateExpression(this.test.title, null, input))
  })

  it(`x>10 || y? || x=7`, function () {
    let input = { x: 12 }
    assert.isTrue(JSONway.calculateExpression(this.test.title, null, input))

    input = { x: 10, y: 7 }
    assert.isTrue(JSONway.calculateExpression(this.test.title, null, input))

    input = { x: 7 }
    assert.isTrue(JSONway.calculateExpression(this.test.title, null, input))

    input = {}
    assert.isFalse(JSONway.calculateExpression(this.test.title, null, input))

    input = { x: 6 }
    assert.isFalse(JSONway.calculateExpression(this.test.title, null, input))
  })

  it(`x>10 || (y?) || (x=7)`, function () {
    let input = { x: 12 }
    assert.isTrue(JSONway.calculateExpression(this.test.title, null, input))

    input = { x: 10, y: 7 }
    assert.isTrue(JSONway.calculateExpression(this.test.title, null, input))

    input = { x: 7 }
    assert.isTrue(JSONway.calculateExpression(this.test.title, null, input))

    input = {}
    assert.isFalse(JSONway.calculateExpression(this.test.title, null, input))

    input = { x: 6 }
    assert.isFalse(JSONway.calculateExpression(this.test.title, null, input))
  })

  it(`ab.cd = 'foo' && ( x>10 || y?) || (ab? && x=10)`, function () {
    let input = { ab: { cd: 'foo' }, x: 12 }
    assert.isTrue(JSONway.calculateExpression(this.test.title, null, input))

    input = { ab: { cd: 'foo' }, x: 10, y: 7 }
    assert.isTrue(JSONway.calculateExpression(this.test.title, null, input))

    input = { ab: { cd: 'foo' }, x: 10 }
    assert.isTrue(JSONway.calculateExpression(this.test.title, null, input))

    input = { ab: { cd: 'foo' } }
    assert.isFalse(JSONway.calculateExpression(this.test.title, null, input))

    input = { ab: { cd: 'bar' }, x: 11 }
    assert.isFalse(JSONway.calculateExpression(this.test.title, null, input))
  })

  it(`(ab.cd='foo' && (((ab?))))`, function () {
    let input = { ab: { cd: 'foo' } }
    assert.isTrue(JSONway.calculateExpression(this.test.title, null, input))

    input = { ab: true }
    assert.isFalse(JSONway.calculateExpression(this.test.title, null, input))
  })

  it(`x~='bar'`, function () {
    let input = { x: 'foobarbaz' }
    assert.isTrue(JSONway.calculateExpression(this.test.title, null, input))

    input = { x: 'bar' }
    assert.isTrue(JSONway.calculateExpression(this.test.title, null, input))

    input = { x: 'foobaz' }
    assert.isFalse(JSONway.calculateExpression(this.test.title, null, input))

    input = { x: 10 }
    assert.isFalse(JSONway.calculateExpression(this.test.title, null, input))

    input = { y: 'bar' }
    assert.isFalse(JSONway.calculateExpression(this.test.title, null, input))
  })

  it('x = $', function () {
    let input = { x: 'baz' }
    let values = ['foo', 'baz', 'bar']
    assert.isTrue(JSONway.calculateExpression(this.test.title, values, input))
    assert.isTrue(JSONway.calculateExpression(this.test.title, 'baz', input))

    values = ['foo', 'bar']
    assert.isFalse(JSONway.calculateExpression(this.test.title, values, input))

    assert.isFalse(JSONway.calculateExpression(this.test.title, 'bar', input))
  })

  it('x=$ || y=$', function () {
    let input = { x: 'baz', y: 'foo' }
    let values = ['foo', 'baz', 'bar']
    assert.isTrue(JSONway.calculateExpression(this.test.title, values, input))

    assert.isTrue(JSONway.calculateExpression(this.test.title, 'baz', input))
    assert.isTrue(JSONway.calculateExpression(this.test.title, 'foo', input))

    input = { y: 'foo' }
    assert.isTrue(JSONway.calculateExpression(this.test.title, 'foo', input))

    input = { x: 'baz', y: 'foo' }
    values = ['bar']
    assert.isFalse(JSONway.calculateExpression(this.test.title, values, input))

    assert.isFalse(JSONway.calculateExpression(this.test.title, 'bar', input))
  })

  it('!x', function () {
    let input = { x: true, y: 'foo' }
    assert.isFalse(JSONway.calculateExpression(this.test.title, [], input))

    input = { x: 'baz', y: 'foo' }
    assert.isFalse(JSONway.calculateExpression(this.test.title, [], input))

    input = { x: false, y: 'foo' }
    assert.isTrue(JSONway.calculateExpression(this.test.title, [], input))

    input = { y: 'foo' }
    assert.isTrue(JSONway.calculateExpression(this.test.title, [], input))
  })

  it('ab + 2', function () {
    let input = { ab: 5 }
    assert.deepEqual(
      JSONway.calculateExpression(this.test.title, null, input),
      7,
    )

    input = { ab: 'foo' }
    assert.equal(JSONway.calculateExpression(this.test.title, null, input), 2)
  })

  it('ab - 2', function () {
    let input = { ab: 5 }
    assert.deepEqual(
      JSONway.calculateExpression(this.test.title, null, input),
      3,
    )

    input = { ab: 'foo' }
    assert.deepEqual(
      JSONway.calculateExpression(this.test.title, null, input),
      -2,
    )
  })

  it('2 - ab', function () {
    let input = { ab: 5 }
    assert.deepEqual(
      JSONway.calculateExpression(this.test.title, null, input),
      -3,
    )

    input = { ab: 'foo' }
    assert.deepEqual(
      JSONway.calculateExpression(this.test.title, null, input),
      2,
    )
  })

  it('ab / 2', function () {
    let input = { ab: 5 }
    assert.deepEqual(
      JSONway.calculateExpression(this.test.title, null, input),
      2.5,
    )

    input = { ab: 'foo' }
    assert.deepEqual(
      JSONway.calculateExpression(this.test.title, null, input),
      null,
    )
  })

  it('ab * 2', function () {
    let input = { ab: 5 }
    assert.deepEqual(
      JSONway.calculateExpression(this.test.title, null, input),
      10,
    )

    input = { ab: 'foo' }
    assert.deepEqual(
      JSONway.calculateExpression(this.test.title, null, input),
      null,
    )
  })

  it('<15', function () {
    let input = 5
    assert.isTrue(JSONway.calculateExpression(this.test.title, null, input))

    input = 15
    assert.isFalse(JSONway.calculateExpression(this.test.title, null, input))

    input = 25
    assert.isFalse(JSONway.calculateExpression(this.test.title, null, input))
  })

  it('>15', function () {
    let input = 5
    assert.isFalse(JSONway.calculateExpression(this.test.title, null, input))

    input = 15
    assert.isFalse(JSONway.calculateExpression(this.test.title, null, input))

    input = 25
    assert.isTrue(JSONway.calculateExpression(this.test.title, null, input))
  })

  it('>=15', function () {
    let input = 5
    assert.isFalse(JSONway.calculateExpression(this.test.title, null, input))

    input = 15
    assert.isTrue(JSONway.calculateExpression(this.test.title, null, input))

    input = 25
    assert.isTrue(JSONway.calculateExpression(this.test.title, null, input))
  })

  it('<=15', function () {
    let input = 5
    assert.isTrue(JSONway.calculateExpression(this.test.title, null, input))

    input = 15
    assert.isTrue(JSONway.calculateExpression(this.test.title, null, input))

    input = 25
    assert.isFalse(JSONway.calculateExpression(this.test.title, null, input))
  })

  it('15 != [5,15,20]', function () {
    assert.isFalse(JSONway.calculateExpression(this.test.title))
  })

  it('15 != [5,16,20]', function () {
    assert.isTrue(JSONway.calculateExpression(this.test.title))
  })

  it('15 > [5,15,20]', function () {
    assert.isTrue(JSONway.calculateExpression(this.test.title))
  })

  it('15 > [15,17,20]', function () {
    assert.isFalse(JSONway.calculateExpression(this.test.title))
  })

  it('15 >= [11,17,20]', function () {
    assert.isTrue(JSONway.calculateExpression(this.test.title))
  })

  it('15 >= [16,17,20]', function () {
    assert.isFalse(JSONway.calculateExpression(this.test.title))
  })

  it('15 < [5, 10, 15]', function () {
    assert.isFalse(JSONway.calculateExpression(this.test.title))
  })

  it('15 < [5, 16, 14]', function () {
    assert.isTrue(JSONway.calculateExpression(this.test.title))
  })

  it('15 <= [5, 10, 14]', function () {
    assert.isFalse(JSONway.calculateExpression(this.test.title))
  })

  it('15 <= [5, 15, 14]', function () {
    assert.isTrue(JSONway.calculateExpression(this.test.title))
  })

  it('5 * [10, 2]', function () {
    assert.equal(JSONway.calculateExpression(this.test.title), 100)
  })

  it('220 / [10, 2]', function () {
    assert.equal(JSONway.calculateExpression(this.test.title), 11)
  })

  it('5 # 15', function () {
    let input = 5
    assert.isUndefined(
      JSONway.calculateExpression(this.test.title, null, input),
    )
  })

  it('ab.cd >= 20 && (ab.cd / 2)', function () {
    let input = { ab: { cd: 30 } }
    assert.deepEqual(
      JSONway.calculateExpression(this.test.title, null, input),
      15,
    )

    input = { ab: { cd: 15 } }
    assert.deepEqual(
      JSONway.calculateExpression(this.test.title, null, input),
      false,
    )
  })

  it('(ab.cd >= 20 && (ab.cd / 2)) || (ab.cd >= 10 && (ab.cd+0)) || 10', function () {
    let input = { ab: { cd: 30 } }
    assert.deepEqual(
      JSONway.calculateExpression(this.test.title, null, input),
      15,
    )

    input = { ab: { cd: 14 } }
    assert.deepEqual(
      JSONway.calculateExpression(this.test.title, null, input),
      14,
    )

    input = { ab: { cd: 7 } }
    assert.deepEqual(
      JSONway.calculateExpression(this.test.title, null, input),
      10,
    )
  })

  it('ab + 2 + cd.ab - cd.ef', function () {
    let input = { ab: 10, cd: { ab: 5, ef: 11 } }
    assert.deepEqual(
      JSONway.calculateExpression(this.test.title, null, input),
      6,
    )

    input = { ab: 2, cd: { ab: 5, ef: 11 } }
    assert.deepEqual(
      JSONway.calculateExpression(this.test.title, null, input),
      -2,
    )

    input = { ab: 10, cd: { ab: 7 } }
    assert.deepEqual(
      JSONway.calculateExpression(this.test.title, null, input),
      19,
    )

    input = { ab: 10, cd: { ef: 7 } }
    assert.deepEqual(
      JSONway.calculateExpression(this.test.title, null, input),
      5,
    )
  })

  it(`'x'?`, function () {
    assert.isTrue(JSONway.calculateExpression(this.test.title, null, {}))
  })

  it(`0?`, function () {
    assert.isTrue(JSONway.calculateExpression(this.test.title, null, {}))
  })

  it(`7 = [1,2,3,4]`, function () {
    assert.isFalse(JSONway.calculateExpression(this.test.title, null, {}))
  })

  it(`c[].d='a2'`, function () {
    let data = { c: [{ d: 'a1' }, { d: 'a3' }] }
    assert.isFalse(JSONway.calculateExpression(this.test.title, null, data))

    data = { c: [{ d: 'a1' }, { d: 'a2' }, { d: 'a3' }] }
    assert.isTrue(JSONway.calculateExpression(this.test.title, null, data))
  })

  it(`[0]='xx'`, function () {
    assert.isTrue(
      JSONway.calculateExpression(this.test.title, null, ['xx', 'yy']),
    )

    assert.isFalse(
      JSONway.calculateExpression(this.test.title, null, ['yy', 'xx']),
    )
  })

  it('5 + 2 = [1,7,3,4]', function () {
    assert.isTrue(JSONway.calculateExpression(this.test.title, null, {}))
  })

  it('5 + 1 = [1,7,3,4]', function () {
    assert.isFalse(JSONway.calculateExpression(this.test.title, null, {}))
  })

  it(`5 + [1,2,3,4]`, function () {
    assert.deepEqual(JSONway.calculateExpression(this.test.title, null, {}), 15)
  })

  // TODO: find a syntax to support empty or 1-length list?
  it.skip('? [2]', function () {
    assert.isTrue(JSONway.calculateExpression(this.test.title, null, {}))
    assert.isFalse(JSONway.calculateExpression('? []', null, {}))
    assert.isTrue(JSONway.calculateExpression('? [null]', null, {}))
  })

  it(`? [1,3]`, function () {
    assert.isTrue(JSONway.calculateExpression(this.test.title, null, {}))
  })

  it(`? [undefined,1,2]`, function () {
    assert.isTrue(JSONway.calculateExpression(this.test.title, null, {}))
  })

  it(`20 - [1,2,3,true,4]`, function () {
    assert.deepEqual(JSONway.calculateExpression(this.test.title, null, {}), 10)
  })

  it(`10 + [1,2,ab.cd,null,true,4]`, function () {
    let input = { ab: { cd: 10 } }
    assert.deepEqual(
      JSONway.calculateExpression(this.test.title, null, input),
      27,
    )

    input = { ab: { ef: 10 } }
    assert.deepEqual(
      JSONway.calculateExpression(this.test.title, null, input),
      17,
    )
  })

  it('aa ?| bb |? cc ?? 15', function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)[1]

    let object = { bb: 'x' }
    assert.deepEqual(
      JSONway.calculateExpression(parsedExpression, null, object),
      'x',
    )

    object = { aa: 34, b: 'x' }
    assert.deepEqual(
      JSONway.calculateExpression(parsedExpression, null, object),
      34,
    )

    object = { aa: undefined }
    assert.deepEqual(
      JSONway.calculateExpression(parsedExpression, null, object),
      15,
    )
  })

  it('20 - 20 || 10', function () {
    let object = { aa: false }
    assert.deepEqual(
      JSONway.calculateExpression(this.test.title, null, object),
      10,
    )
  })

  it('20 - 20 ?| 10', function () {
    let object = { aa: false }
    assert.deepEqual(
      JSONway.calculateExpression(this.test.title, null, object),
      0,
    )
  })

  it(`'bfoor' ~= 'foo'`, function () {
    assert.isTrue(JSONway.calculateExpression(this.test.title, null, {}))
  })

  it(`'bfoor' ~= ['baz', 'bar']`, function () {
    assert.isFalse(JSONway.calculateExpression(this.test.title, null, {}))
  })

  it(`'bfoor' ~= ['baz', 'bar', 'foo']`, function () {
    assert.isTrue(JSONway.calculateExpression(this.test.title, null, {}))
  })

  it(`$ >= 20`, function () {
    let values = 20
    assert.isTrue(JSONway.calculateExpression(this.test.title, values, {}))

    values = 25
    assert.isTrue(JSONway.calculateExpression(this.test.title, values, {}))

    values = 15
    assert.isFalse(JSONway.calculateExpression(this.test.title, values, {}))
  })

  it('> $, != 22', function () {
    const values = 20
    let data = 15
    assert.isFalse(JSONway.calculateExpression(this.test.title, values, data))

    data = 20
    assert.isFalse(JSONway.calculateExpression(this.test.title, values, data))

    data = 22
    assert.isFalse(JSONway.calculateExpression(this.test.title, values, data))

    data = 25
    assert.isTrue(JSONway.calculateExpression(this.test.title, values, data))
  })

  it(`20 <= $`, function () {
    let values = 20
    assert.isTrue(JSONway.calculateExpression(this.test.title, values, {}))

    values = 25
    assert.isTrue(JSONway.calculateExpression(this.test.title, values, {}))

    values = 15
    assert.isFalse(JSONway.calculateExpression(this.test.title, values, {}))
  })
})
