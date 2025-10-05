# JSONway

Find and filter nested values from JSON using JSONway's concise syntax.

## Install

```shell
npm install jsonway
```

## Usage

```javascript
import JSONway from 'jsonway'

const myObject = {
  aa: { cc: { ff: 42, gg: true }, dd: 'value' },
  bb: [ { ff: 10 }, { ff: -5, gg: 'another' } ]
}

const result = JSONway.get(myObject, '**.ff(>=10)')
// [ 42, 10 ]

const tableQuery = `[{
  ff: bb[*].ff,
  aa.cc.ff,
  aa.dd,
}]
`
const table = JSONway.get(myObject, tableQuery)
// [
//   { ff: 10, 'aa.dd': 'value', 'aa.cc.ff': 42 },
//   { ff: -5, 'aa.dd': 'value', 'aa.cc.ff': 42 }
// ]
```

## Syntax

In general spaces and new lines are ignored and trimmed in the syntax, so that especially long paths don't need to be crammed into a one-liner.

### Overview

- `a.b.c` a value from nested objects.
- `a[].b` all the `b` properties within a list of objects.
- `a[].b[].c` all values of `c` as a flat list.
- `a[#]` unique values of list `a`.
- `a[#].b` unique values of `b`.
- `a[:].b[:].c` a list of lists of values of `c` *(keeping structure)*.
- `a[].b(>10)` all `b` values that are larger than `10`.
- `a[](b > 10 || c != 'foo').b` all `b` values where `c` also is not `"foo"`.
- `a[0]` first value from list `a`.
- `a[-1]` last value.
- `a[-2:]` last 2 values.
- `a[1:6]` first 5 values while skipping the first.
- `a[0,2,-1]` first, third, and last values in a list.
- `a.**.c` all `c` values regardless where they are nested under `a`.
- `{ a.b, d.e }` object with keys mathing their own query results.
- `{ myKey: a[].b }` keys can be renamed similarly like in JSON or Javascript.
- `[{ a[*].b, c.d }]` list of objects expanded by values of `b`.

When key name in a path needs to be escaped, it can be done like `a[b.c].d` or `a['b[]'].c`.

### Expressions

- `(?)` value isn't `undefined`.
- `(<0)` value is smaller than `0`.
- `(a >= 5)` where `a` is larger or equal to 5.
- `(a ~= 'foo' && a != ['foo', 'foobar'])` where `a` contains `"foo"` and isn't `"foo"` nor `"foobar"`.
- `(status? && (status = [401, 403] || status >= 500))` parenthesis can be used, too.

### Pipe modifiers

- `a[ # | size ].b` amount of unique `b` values within `a` list.
- `a[|> max].b` largest `b` value.
- `a.b.c |> split._.7` split value `c` by underscore `_`, and return it's 8th part.
- `a[ |> sort.reverse[0] ]` sort in descending order and take first value.
- `min`, `floor`, `ceil`, `round`, `trunc`, `avg`, also supported.

### Examples

Return a list of objects from a Babel AST of test file.

```javascript
program.body[]
  .expression(callee.name = 'describe')
  .arguments[](type = 'ArrowFunctionExpression')
  .body.body[](
    expression.callee.name = 'it' &&
    expression.arguments[0].type = [
      'TemplateLiteral',
      'StringLiteral',
    ]
  )
  .expression.arguments{
    path: [0].value,
    path: [0].quasis[0].value.cooked,
    vars: [1].body.body[](type = 'VariableDeclaration')
          .declarations[0].id.name,
  }
```

Which returns something like this from Babel parsed `test/setter.js` file:

```Javascript
[
  ...
  { path: 'a.b', vars: [ 'out' ] },
  { path: 'a.b.c', vars: [ 'object', 'out' ] },
  { path: 'a[0]', vars: [ 'object', 'out' ] },
  ...
]
```

Syntax allows us to go through step by step the JSON file, filtering further as we go more nested. Filter conditions always get the current value of list or object as the context, which reduces repeated syntax.

---

Another example, where a nested list of objects is expanded into a simpler list of objects:

```javascript
[{
  bb[*].dd,
  bb[].ee[*].dd: bb[].ee[*].dd (!='dd13'),
  bb[].ee[].hh[].ii.dd,
  bb[].ee[].hh[].dd,
  bb[].cc,
  aa,
}]
```

Returns list of objects separately for each value found with paths having `[*]` list expansion in them. Values above of the expanded paths are duplicated, while values for even further nested paths are aggregated.

```javascript
[
  ...
  {
    'aa': 'aa1',
    'bb[0].dd': 'dd1',
    'bb[0].ee[0].dd': 'dd7',
    'bb[0].ee[].hh[].dd': [ 'dd8', 'dd10' ],
    'bb[0].ee[].hh[].ii.dd': [ 'dd9', 'dd11' ]
    'bb[0].cc': 'cc1',
  },
  ...
]
```

### Other methods

Overall JSONway exposes following methods:

```javascript
{
  analyze,
  calculateExpression,
  expand,
  expandAll,
  flatten,
  get,
  has,
  parse,
  parseExpression,
  set,
  stringify
}
```

Comprehensive documentation and language syntax description still a work-in-progress. For further examples check `test/` folder.

## Why *(yet another)* JSON query language?

It's true that there are already many popular JSON query languages like JSONPath, JSONata, and JMESPath. I wanted to create my own syntax and language from scratch that was slightly different, while indeed inspired by those and many others.

Goals and guiding principles for JSONway has been to have concise but safety restricted syntax, imitating Javascript syntax and logic when possible, and zero dependencies. Creating table-like lists of objects from complex JSON structures, has been one of the main use cases JSONway has been trying to solve.

Writing your own parser and interpreter for your own query language are educational already on their own, and I would strongly recommend others to do the same. Deciding on a syntax and available capabilities for the language depends heavily on the use cases you have in mind, and I don't believe we will have *"one query language to rule them all"* in the future, either.

Hopefully JSONway can be the query language for your needs!

---

MIT licenced.
