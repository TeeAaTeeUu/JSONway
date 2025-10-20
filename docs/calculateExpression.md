# Logical Expressions

JSONway expressions generally evaluate into either `true` or `false` values. It's also possible to return e.g. numeric results, which can be especially useful as sub-expressions. Logic works very similarly to Javascript expressions, and similarly supports expressions without space characters between operands and operators.

Expressions can be used either on their own, or as part of a path in the query for `JSONway.get`.

```js
JSONway.calculateExpression('(a >= 5)', { a: 10 })
// true
```

## Available operators and syntax

- `=` for equality *(also `===`, `==`, `:`)*
- `&&` for AND operator *(also `&`, `,`)*
- `||` for OR operator *(also `|`)*
- `!=` for not equals *(also `!==`)*
- `~=` for text contains
- `?` for exists and not `undefined`
- `>` for larger than
- `<` for smaller than
- `>=` for larger or equal to
- `<=` for smaller or equal to
- `+` for addition
- `-` for subtraction
- `/` for division
- `*` for multiplication
- `%` for division remainder
- `!` for boolean negation, not
- `(` and `)` for nested grouping of sub-expressions

Both the left and right right side of the operations can be either pure JSON-value, sub-expression, or a JSONway path. In the below example, `a` and `bb` are taken to be paths within the given context. Evaluation of the expression is done from left to right, and stops and returns as early as possible when the end result is not going to change anymore.

```js
(a >= 5)
```

```js
(bb = 'test' || (bb ~= 'foo' && bb != ['foo', 'foobar']))
```

```js
JSONway.calculateExpression('10 + 5 - 3')
// 12

JSONway.calculateExpression('(a >= 5)', { a: 10 })
// true

JSONway.calculateExpression('(a >= 5)', { a: 3 })
// false
```

One of the ways how `JSONway.calculateExpression` differs from Javascript, is that JSONway doesn't do type-casting. Meaning that regardless if the equality is checked with `=` or `==`, it will always return `false` for `5 = '5'` and `true` for `5 != '5'`.

## Convenience assumptions

Expression syntax reduces repetition in the query language itself, and let's go through those convenience syntaxes next.

### Left assumed to be context

Left operand is assumed to be the current JSON-value as the context, if not specifically given in the query.

```js
(<0)
```

```js
(= 'test' || (~= 'foo' && != ['foo', 'foobar']))
```

### List of repeated right operands

When for example wanting to compare if text is any of the ones listed, comparison is done one by one with the same syntax. Below examples are practically the same:

```js
(bb = 'foo' || bb = 'bar')
```

```js
(bb = ['foo', 'bar'])
```

When comparing the left operand is a list itself, at the moment there might not be an easy way to check that it is equal to another list without checking the indexes one by one separately.

### Object-like syntax for multiple equals

Alternative syntax for more lengthy `=` and `&&` condition, is to imitate object-like syntax with `:` and `,` respectively. Meaning that all below expressions are doing the same matching:

```js
(aa.bb = 'bar' && cc = 15 && dd.ee = ['foo', 'baz'])
```

```js
(aa.bb: 'bar', cc: 15, dd.ee: ['foo', 'baz'])
```

```js
(
  aa.bb: 'bar',
  cc = 15,
  dd.ee: ['foo', 'baz'],
)
```

Meaning they are both checking if `aa.bb` is equal to `'bar'`, that `cc` is `15`, and that `dd.ee` is either `foo` or `baz`.

## `$` - placeholder for extra context

In some cases there might be both the JSON value to be checked against, as well as an extra changing context to be evaluated against. In such cases `$` placeholder can be used, which is given as the 3rd parameter for `JSONway.calculateExpression`. Placeholder can be used multiple times in the same expression.

```js
JSONway.calculateExpression('a >= $', { a: 10 }, 5)
// true

JSONway.calculateExpression('a >= $', { a: 10 }, 15)
// false

JSONway.calculateExpression('a >= $ && $ < 20', { a: 30 }, 15)
// true

JSONway.calculateExpression('a >= $ && $ < 20', { a: 30 }, 25)
// false
```
