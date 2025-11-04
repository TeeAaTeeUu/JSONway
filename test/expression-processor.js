import { assert } from 'chai'

import JSONway from '../index.js'

describe('expression-processor', () => {
  it(`ab.cd='foo'`, function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)

    let input = { ab: { cd: 'foo' } }
    assert.isTrue(JSONway.calculateExpression(this.test.title, input))
    assert.isTrue(JSONway.calculateExpression(parsedExpression, input))

    input = { ab: { cd: 'bar' } }
    assert.isFalse(JSONway.calculateExpression(this.test.title, input))
    assert.isFalse(JSONway.calculateExpression(parsedExpression, input))

    input = { ab: { ce: 'foo' } }
    assert.isFalse(JSONway.calculateExpression(parsedExpression, input))

    input = { cd: { ab: 'foo' } }
    assert.isFalse(JSONway.calculateExpression(parsedExpression, input))
  })

  it(`7 + 10 - 2 > 12`, function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)

    assert.isTrue(JSONway.calculateExpression(parsedExpression, {}))
  })

  it(`15 % 4 = 3`, function () {
    assert.isTrue(JSONway.calculateExpression(this.test.title))
  })

  it(`7 + 10 - 2 < 12`, function () {
    assert.isFalse(JSONway.calculateExpression(this.test.title))
  })

  it(`(7 + 10 - 2) > (12 + 5)`, function () {
    assert.isFalse(JSONway.calculateExpression(this.test.title))
  })

  it.skip(`7 + 10 - 2 > 12 + 5`, function () {
    assert.isFalse(JSONway.calculateExpression(this.test.title))
  })

  it.skip(`7 > 5 > 3`, function () {
    assert.isTrue(JSONway.calculateExpression(this.test.title))
  })

  it.skip(`7 > 5 < 3`, function () {
    assert.isFalse(JSONway.calculateExpression(this.test.title))
  })

  it('15 - 10 -', function () {
    assert.equal(JSONway.calculateExpression(this.test.title), 5)
  })

  it(`7 + 10`, function () {
    assert.deepEqual(JSONway.calculateExpression(this.test.title), 17)
  })

  it(`7 + 10 - 5`, function () {
    assert.deepEqual(JSONway.calculateExpression(this.test.title), 12)
  })

  it(`7 + 10 - 5 + 1 + (-5 - 3 + 1) + 3`, function () {
    assert.deepEqual(JSONway.calculateExpression(this.test.title), 9)
  })

  it('true && true', function () {
    assert.isTrue(JSONway.calculateExpression(this.test.title))
  })

  it('false || true', function () {
    assert.isTrue(JSONway.calculateExpression(this.test.title))
  })

  it('false && true', function () {
    assert.isFalse(JSONway.calculateExpression(this.test.title))
  })

  it('true && false', function () {
    assert.isFalse(JSONway.calculateExpression(this.test.title))
  })

  it(`ab.cd='foo'&&x>10`, function () {
    let input = { ab: { cd: 'foo' }, x: 12 }
    assert.isTrue(JSONway.calculateExpression(this.test.title, input))

    input = { ab: { cd: 'bar' }, x: 12 }
    assert.isFalse(JSONway.calculateExpression(this.test.title, input))

    input = { ab: { cd: 'foo' }, x: 10 }
    assert.isFalse(JSONway.calculateExpression(this.test.title, input))
  })

  it(`ab.cd = 'foo' && ( x>10 || y?)`, function () {
    let input = { ab: { cd: 'foo' }, x: 12 }
    assert.isTrue(JSONway.calculateExpression(this.test.title, input))

    input = { ab: { cd: 'foo' }, x: 10, y: 7 }
    assert.isTrue(JSONway.calculateExpression(this.test.title, input))

    input = { ab: { cd: 'foo' }, x: 10 }
    assert.isFalse(JSONway.calculateExpression(this.test.title, input))
  })

  it(`x>10 || y? || x=7`, function () {
    let input = { x: 12 }
    assert.isTrue(JSONway.calculateExpression(this.test.title, input))

    input = { x: 10, y: 7 }
    assert.isTrue(JSONway.calculateExpression(this.test.title, input))

    input = { x: 7 }
    assert.isTrue(JSONway.calculateExpression(this.test.title, input))

    input = {}
    assert.isFalse(JSONway.calculateExpression(this.test.title, input))

    input = { x: 6 }
    assert.isFalse(JSONway.calculateExpression(this.test.title, input))
  })

  it(`x>10 || (y?) || (x=7)`, function () {
    let input = { x: 12 }
    assert.isTrue(JSONway.calculateExpression(this.test.title, input))

    input = { x: 10, y: 7 }
    assert.isTrue(JSONway.calculateExpression(this.test.title, input))

    input = { x: 7 }
    assert.isTrue(JSONway.calculateExpression(this.test.title, input))

    input = {}
    assert.isFalse(JSONway.calculateExpression(this.test.title, input))

    input = { x: 6 }
    assert.isFalse(JSONway.calculateExpression(this.test.title, input))
  })

  it(`ab.cd = 'foo' && ( x>10 || y?) || (ab? && x=10)`, function () {
    let input = { ab: { cd: 'foo' }, x: 12 }
    assert.isTrue(JSONway.calculateExpression(this.test.title, input))

    input = { ab: { cd: 'foo' }, x: 10, y: 7 }
    assert.isTrue(JSONway.calculateExpression(this.test.title, input))

    input = { ab: { cd: 'foo' }, x: 10 }
    assert.isTrue(JSONway.calculateExpression(this.test.title, input))

    input = { ab: { cd: 'foo' } }
    assert.isFalse(JSONway.calculateExpression(this.test.title, input))

    input = { ab: { cd: 'bar' }, x: 11 }
    assert.isFalse(JSONway.calculateExpression(this.test.title, input))
  })

  it(`(ab.cd='foo' && (((ab?))))`, function () {
    let input = { ab: { cd: 'foo' } }
    assert.isTrue(JSONway.calculateExpression(this.test.title, input))

    input = { ab: true }
    assert.isFalse(JSONway.calculateExpression(this.test.title, input))
  })

  it(`x~='bar'`, function () {
    let input = { x: 'foobarbaz' }
    assert.isTrue(JSONway.calculateExpression(this.test.title, input))

    input = { x: 'bar' }
    assert.isTrue(JSONway.calculateExpression(this.test.title, input))

    input = { x: 'foobaz' }
    assert.isFalse(JSONway.calculateExpression(this.test.title, input))

    input = { x: 10 }
    assert.isFalse(JSONway.calculateExpression(this.test.title, input))

    input = { y: 'bar' }
    assert.isFalse(JSONway.calculateExpression(this.test.title, input))
  })

  it(`bb ~= 'foo' && bb != ['foo', 'foobar']`, function () {
    const input = { bb: 'footer' }
    assert.isTrue(JSONway.calculateExpression(this.test.title, input))

    input.bb = 'foobar'
    assert.isFalse(JSONway.calculateExpression(this.test.title, input))

    input.bb = 'foo'
    assert.isFalse(JSONway.calculateExpression(this.test.title, input))

    input.bb = 'bar'
    assert.isFalse(JSONway.calculateExpression(this.test.title, input))

    input.bb = 'barfoo'
    assert.isTrue(JSONway.calculateExpression(this.test.title, input))
  })

  it(`~= 'foo' && != ['foo', 'foobar']`, function () {
    let input = 'footer'
    assert.isTrue(JSONway.calculateExpression(this.test.title, input))

    input = 'foobar'
    assert.isFalse(JSONway.calculateExpression(this.test.title, input))

    input = 'foo'
    assert.isFalse(JSONway.calculateExpression(this.test.title, input))

    input = 'bar'
    assert.isFalse(JSONway.calculateExpression(this.test.title, input))

    input = 'barfoo'
    assert.isTrue(JSONway.calculateExpression(this.test.title, input))
  })

  it('x = $', function () {
    let input = { x: 'baz' }
    let values = ['foo', 'baz', 'bar']
    assert.isTrue(JSONway.calculateExpression(this.test.title, input, values))
    assert.isTrue(JSONway.calculateExpression(this.test.title, input, 'baz'))

    values = ['foo', 'bar']
    assert.isFalse(JSONway.calculateExpression(this.test.title, input, values))

    assert.isFalse(JSONway.calculateExpression(this.test.title, input, 'bar'))
  })

  it('x=$ || y=$', function () {
    let input = { x: 'baz', y: 'foo' }
    let values = ['foo', 'baz', 'bar']
    assert.isTrue(JSONway.calculateExpression(this.test.title, input, values))

    assert.isTrue(JSONway.calculateExpression(this.test.title, input, 'baz'))
    assert.isTrue(JSONway.calculateExpression(this.test.title, input, 'foo'))

    input = { y: 'foo' }
    assert.isTrue(JSONway.calculateExpression(this.test.title, input, 'foo'))

    input = { x: 'baz', y: 'foo' }
    values = ['bar']
    assert.isFalse(JSONway.calculateExpression(this.test.title, input, values))

    assert.isFalse(JSONway.calculateExpression(this.test.title, input, 'bar'))
  })

  it('!x', function () {
    let input = { x: true, y: 'foo' }
    assert.isFalse(JSONway.calculateExpression(this.test.title, input))

    input = { x: 'baz', y: 'foo' }
    assert.isFalse(JSONway.calculateExpression(this.test.title, input))

    input = { x: false, y: 'foo' }
    assert.isTrue(JSONway.calculateExpression(this.test.title, input))

    input = { y: 'foo' }
    assert.isTrue(JSONway.calculateExpression(this.test.title, input))
  })

  it('ab + 2', function () {
    let input = { ab: 5 }
    assert.deepEqual(JSONway.calculateExpression(this.test.title, input), 7)

    input = { ab: 'foo' }
    assert.equal(JSONway.calculateExpression(this.test.title, input), 2)
  })

  it('ab - 2', function () {
    let input = { ab: 5 }
    assert.deepEqual(JSONway.calculateExpression(this.test.title, input), 3)

    input = { ab: 'foo' }
    assert.deepEqual(JSONway.calculateExpression(this.test.title, input), -2)
  })

  it('2 - ab', function () {
    let input = { ab: 5 }
    assert.deepEqual(JSONway.calculateExpression(this.test.title, input), -3)

    input = { ab: 'foo' }
    assert.deepEqual(JSONway.calculateExpression(this.test.title, input), 2)
  })

  it('ab / 2', function () {
    let input = { ab: 5 }
    assert.deepEqual(JSONway.calculateExpression(this.test.title, input), 2.5)

    input = { ab: 'foo' }
    assert.isNull(JSONway.calculateExpression(this.test.title, input))
  })

  it('ab * 2', function () {
    let input = { ab: 5 }
    assert.deepEqual(JSONway.calculateExpression(this.test.title, input), 10)

    input = { ab: 'foo' }
    assert.isNull(JSONway.calculateExpression(this.test.title, input))
  })

  it('ab + cd', function () {
    let input = { ab: 5, cd: 10 }
    assert.deepEqual(JSONway.calculateExpression(this.test.title, input), 15)

    input = { ab: 'foo', cd: 'bar' }
    assert.isNull(JSONway.calculateExpression(this.test.title, input))

    input = { ab: 'foo', cd: 10 }
    assert.deepEqual(JSONway.calculateExpression(this.test.title, input), 10)

    input = { ab: 5, cd: 'bar' }
    assert.deepEqual(JSONway.calculateExpression(this.test.title, input), 5)
  })

  it('ab - cd', function () {
    let input = { ab: 5, cd: 10 }
    assert.deepEqual(JSONway.calculateExpression(this.test.title, input), -5)

    input = { ab: 'foo', cd: 'bar' }
    assert.isNull(JSONway.calculateExpression(this.test.title, input))

    input = { ab: 'foo', cd: 10 }
    assert.deepEqual(JSONway.calculateExpression(this.test.title, input), -10)

    input = { ab: 5, cd: 'bar' }
    assert.deepEqual(JSONway.calculateExpression(this.test.title, input), 5)
  })

  it('<15', function () {
    let input = 5
    assert.isTrue(JSONway.calculateExpression(this.test.title, input))

    input = 15
    assert.isFalse(JSONway.calculateExpression(this.test.title, input))

    input = 25
    assert.isFalse(JSONway.calculateExpression(this.test.title, input))
  })

  it('>15', function () {
    let input = 5
    assert.isFalse(JSONway.calculateExpression(this.test.title, input))

    input = 15
    assert.isFalse(JSONway.calculateExpression(this.test.title, input))

    input = 25
    assert.isTrue(JSONway.calculateExpression(this.test.title, input))
  })

  it('>=15', function () {
    let input = 5
    assert.isFalse(JSONway.calculateExpression(this.test.title, input))

    input = 15
    assert.isTrue(JSONway.calculateExpression(this.test.title, input))

    input = 25
    assert.isTrue(JSONway.calculateExpression(this.test.title, input))
  })

  it('<=15', function () {
    let input = 5
    assert.isTrue(JSONway.calculateExpression(this.test.title, input))

    input = 15
    assert.isTrue(JSONway.calculateExpression(this.test.title, input))

    input = 25
    assert.isFalse(JSONway.calculateExpression(this.test.title, input))
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

  it('aa * [bb, cc]', function () {
    let input = { aa: 10, bb: 5, cc: 3 }
    assert.equal(JSONway.calculateExpression(this.test.title, input), 150)

    input = { aa: 10, bb: 'bar', cc: 3 }
    assert.equal(JSONway.calculateExpression(this.test.title, input), 30)

    input = { aa: 10, bb: 5, cc: 'baz' }
    assert.equal(JSONway.calculateExpression(this.test.title, input), 50)

    input = { aa: 10, bb: 'bar', cc: 'baz' }
    assert.equal(JSONway.calculateExpression(this.test.title, input), 10)

    input = { aa: 'foo', bb: 'bar', cc: 'baz' }
    assert.isNull(JSONway.calculateExpression(this.test.title, input))

    input = { aa: 'foo', bb: 5, cc: 3 }
    assert.isNull(JSONway.calculateExpression(this.test.title, input))
  })

  it('aa / [bb, cc]', function () {
    let input = { aa: 150, bb: 5, cc: 3 }
    assert.equal(JSONway.calculateExpression(this.test.title, input), 10)

    input = { aa: 150, bb: 'bar', cc: 3 }
    assert.equal(JSONway.calculateExpression(this.test.title, input), 50)

    input = { aa: 150, bb: 5, cc: 'baz' }
    assert.equal(JSONway.calculateExpression(this.test.title, input), 30)

    input = { aa: 150, bb: 'bar', cc: 'baz' }
    assert.equal(JSONway.calculateExpression(this.test.title, input), 150)

    input = { aa: 'foo', bb: 'bar', cc: 'baz' }
    assert.isNull(JSONway.calculateExpression(this.test.title, input))

    input = { aa: 'foo', bb: 5, cc: 3 }
    assert.isNull(JSONway.calculateExpression(this.test.title, input))
  })

  it('5 # 15', function () {
    let input = 5
    assert.isUndefined(JSONway.calculateExpression(this.test.title, input))
  })

  it('ab.cd >= 20 && (ab.cd / 2)', function () {
    let input = { ab: { cd: 30 } }
    assert.deepEqual(JSONway.calculateExpression(this.test.title, input), 15)

    input = { ab: { cd: 15 } }
    assert.deepEqual(JSONway.calculateExpression(this.test.title, input), false)
  })

  it('(ab.cd >= 20 && (ab.cd / 2)) || (ab.cd >= 10 && (ab.cd+0)) || 10', function () {
    let input = { ab: { cd: 30 } }
    assert.deepEqual(JSONway.calculateExpression(this.test.title, input), 15)

    input = { ab: { cd: 14 } }
    assert.deepEqual(JSONway.calculateExpression(this.test.title, input), 14)

    input = { ab: { cd: 7 } }
    assert.deepEqual(JSONway.calculateExpression(this.test.title, input), 10)
  })

  it('ab + 2 + cd.ab - cd.ef', function () {
    let input = { ab: 10, cd: { ab: 5, ef: 11 } }
    assert.deepEqual(JSONway.calculateExpression(this.test.title, input), 6)

    input = { ab: 2, cd: { ab: 5, ef: 11 } }
    assert.deepEqual(JSONway.calculateExpression(this.test.title, input), -2)

    input = { ab: 10, cd: { ab: 7 } }
    assert.deepEqual(JSONway.calculateExpression(this.test.title, input), 19)

    input = { ab: 10, cd: { ef: 7 } }
    assert.deepEqual(JSONway.calculateExpression(this.test.title, input), 5)
  })

  it(`'x'?`, function () {
    assert.isTrue(JSONway.calculateExpression(this.test.title))
  })

  it(`0?`, function () {
    assert.isTrue(JSONway.calculateExpression(this.test.title))
  })

  it(`7 = [1,2,3,4]`, function () {
    assert.isFalse(JSONway.calculateExpression(this.test.title))
  })

  it(`c[].d='a2'`, function () {
    let data = { c: [{ d: 'a1' }, { d: 'a3' }] }
    assert.isFalse(JSONway.calculateExpression(this.test.title, data))

    data = { c: [{ d: 'a1' }, { d: 'a2' }, { d: 'a3' }] }
    assert.isTrue(JSONway.calculateExpression(this.test.title, data))
  })

  it(`[0]='xx'`, function () {
    assert.isTrue(JSONway.calculateExpression(this.test.title, ['xx', 'yy']))

    assert.isFalse(JSONway.calculateExpression(this.test.title, ['yy', 'xx']))
  })

  it('5 + 2 = [1,7,3,4]', function () {
    assert.isTrue(JSONway.calculateExpression(this.test.title))
  })

  it('5 + 1 = [1,7,3,4]', function () {
    assert.isFalse(JSONway.calculateExpression(this.test.title))
  })

  it(`5 + [1,2,3,4]`, function () {
    assert.deepEqual(JSONway.calculateExpression(this.test.title), 15)
  })

  // TODO: find a syntax to support empty or 1-length list?
  it.skip('? [2,]', function () {
    assert.isTrue(JSONway.calculateExpression(this.test.title))
    assert.isFalse(JSONway.calculateExpression('? []'))
    assert.isTrue(JSONway.calculateExpression('? [null]'))
  })

  it('? [1,3]', function () {
    assert.isTrue(JSONway.calculateExpression(this.test.title))
  })

  it('? [undefined,1,2]', function () {
    assert.isTrue(JSONway.calculateExpression(this.test.title))
  })

  it('? [undefined,undefined]', function () {
    assert.isFalse(JSONway.calculateExpression(this.test.title))
  })

  it('? [undefined,null]', function () {
    assert.isFalse(JSONway.calculateExpression(this.test.title))
  })

  it('a?', function () {
    let object = { a: 10 }
    assert.isTrue(JSONway.calculateExpression(this.test.title, object))

    object = { a: 0 }
    assert.isTrue(JSONway.calculateExpression(this.test.title, object))

    object = { a: 'false' }
    assert.isTrue(JSONway.calculateExpression(this.test.title, object))

    object = { a: false }
    assert.isTrue(JSONway.calculateExpression(this.test.title, object))

    object = { a: null }
    assert.isFalse(JSONway.calculateExpression(this.test.title, object))
  })

  it(`20 - [1,2,3,true,4]`, function () {
    assert.deepEqual(JSONway.calculateExpression(this.test.title), 10)
  })

  it(`10 + [1,2,ab.cd,null,true,4]`, function () {
    let input = { ab: { cd: 10 } }
    assert.deepEqual(JSONway.calculateExpression(this.test.title, input), 27)

    input = { ab: { ef: 10 } }
    assert.deepEqual(JSONway.calculateExpression(this.test.title, input), 17)
  })

  it('aa ?| bb |? cc ?? 15', function () {
    const parsedExpression = JSONway.parseExpression(this.test.title)[1]

    let object = { bb: 'x' }
    assert.deepEqual(JSONway.calculateExpression(parsedExpression, object), 'x')

    object = { aa: 34, b: 'x' }
    assert.deepEqual(JSONway.calculateExpression(parsedExpression, object), 34)

    object = { aa: undefined }
    assert.deepEqual(JSONway.calculateExpression(parsedExpression, object), 15)
  })

  it('20 - 20 || 10', function () {
    let object = { aa: false }
    assert.deepEqual(JSONway.calculateExpression(this.test.title, object), 10)
  })

  it('20 - 20 ?| 10', function () {
    let object = { aa: false }
    assert.deepEqual(JSONway.calculateExpression(this.test.title, object), 0)
  })

  it(`'bfoor' ~= 'foo'`, function () {
    assert.isTrue(JSONway.calculateExpression(this.test.title))
  })

  it(`'bfoor' ~= ['baz', 'bar']`, function () {
    assert.isFalse(JSONway.calculateExpression(this.test.title))
  })

  it(`'bfoor' ~= ['baz', 'bar', 'foo']`, function () {
    assert.isTrue(JSONway.calculateExpression(this.test.title))
  })

  it(`$ >= 20`, function () {
    let values = 20
    assert.isTrue(JSONway.calculateExpression(this.test.title, {}, values))

    values = 25
    assert.isTrue(JSONway.calculateExpression(this.test.title, {}, values))

    values = 15
    assert.isFalse(JSONway.calculateExpression(this.test.title, {}, values))
  })

  it('> $, != 22', function () {
    const values = 20
    let data = 15
    assert.isFalse(JSONway.calculateExpression(this.test.title, data, values))

    data = 20
    assert.isFalse(JSONway.calculateExpression(this.test.title, data, values))

    data = 22
    assert.isFalse(JSONway.calculateExpression(this.test.title, data, values))

    data = 25
    assert.isTrue(JSONway.calculateExpression(this.test.title, data, values))
  })

  it(`20 <= $`, function () {
    let values = 20
    assert.isTrue(JSONway.calculateExpression(this.test.title, {}, values))

    values = 25
    assert.isTrue(JSONway.calculateExpression(this.test.title, {}, values))

    values = 15
    assert.isFalse(JSONway.calculateExpression(this.test.title, {}, values))
  })

  it('a => max / b =| min * a |> size', function () {
    let input = { a: [5, 6, 7], b: [4, 2, 3, 5] }
    assert.deepEqual(JSONway.calculateExpression(this.test.title, input), 10.5)
  })

  it('a => sum / b =| avg.floor * a |> sort.reverse.0', function () {
    let input = { a: [5, 6, 7], b: [4, 2, 3, 5] }
    assert.deepEqual(JSONway.calculateExpression(this.test.title, input), 42)
  })
})
