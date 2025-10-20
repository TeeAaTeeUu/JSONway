# Set values into or create a nested JSON

`JSONway.set` uses almost the same syntax as `JSONway.get`, but for creating the path into the given object if missing or not matching, and placing the given value at the end of the nested path. This is what `JSONway.expand` uses internally.

Setter path can be cached and reused with `JSONway.parse`, if desired.

```js
const myObject = {}

JSONway.set(myObject, 'a.b.c', 'nested value')
// { a: { b: { c: 'nested value' } } }

JSONway.set(myObject, 'a.d', ['x', 'y'])
// { a: { b: { c: 'nested value' }, d: [ 'x', 'y' ] } }

JSONway.set(myObject, 'a.d.1', { z: 'override' })
// { a: { b: { c: 'nested value' }, d: [ 'x', { z: 'override' } ] } }

JSONway.set(myObject, 'a.d[]e', true)
// { a: { b: { c: 'nested value' }, d: [ { e: true } ] } }
```

```js
// myObject
{
  a: {
    b: {
      c: "nested value"
    },
    d: [{ e: true }]
  }
}
```

## Setter specific syntax

There are some key differences in how `JSONway.set` handles paths compared to `JSONway.get`, especially with arrays. Let's go through them.

### `[]` - Create array or add to it

Paths like `a.b.c[]` will first check if the `a.b.c` path exists, and create it with an empty array for `c` within `a.b` if it doesn't exist or was not an array. After that one the given value is added to the end of the array, which in case when array was just created will also be its only value.

This means that repeated setter calls will be appending to that same list one after another.

```js
const myObject = {}

JSONway.set(myObject, 'a.b.c[]', 'first')
// { a: { b: { c: [ 'first' ] } } }

JSONway.set(myObject, 'a.b.c[]', 'second')
// { a: { b: { c: [ 'first', 'second' ] } } }

JSONway.set(myObject, 'a.b.c[]', 3)
// { a: { b: { c: [ 'first', 'second', 3 ] } } }
```

In case of multiple nested `[]` in the path, the first `[]` is already doing the appending to the end of that array, so the rest of the path doesn't yet exist, so it's created as a new.

```js
const myObject = {}

JSONway.set(myObject, 'a.b[].c[]', 'first')
// { a: { b: [ { c: [ 'first' ] } ] } }

JSONway.set(myObject, 'a.b[].c[]', 'second')
// { a: { b: [ { c: [ 'first' ] }, { c: [ 'second' ] } ] } }

JSONway.set(myObject, 'a.b[].c[]', 3)
// {
//   a: {
//     b: [
//       { c: [ 'first' ] },
//       { c: [ 'second' ] },
//       { c: [ 3 ] },
//     ]
//   }
// }
```

### `[*]` - For each value in the array path

Unlike with `[]`, with `[*]` the path isn't created if it didn't exist or didn't match to expected types. This will do an early exit in such cases when none was found. In case path was found and array had values, those will be replaced with the remaining path after the `[*]`. If the latter part of the path also has `[*]`, the same logic applies.

```js
const myObject = {}

JSONway.set(myObject, 'a.b.c[*]', 'first')
// {}

JSONway.set(myObject, 'a.b.c[]', ['second', 'third'])
// { a: { b: { c: [ 'second', third ] } } }

JSONway.set(myObject, 'a.b.c[*]', 3)
// { a: { b: { c: [ 3, 3 ] } } }

JSONway.set(myObject, 'a.b.c[*].d', 10)
// { a: { b: { c: [ { d: 10 }, { d: 10 } ] } } }
```

### `[=]` - Replace and override array

Effectively the same as `[]` for non-existing paths, but in case the array already existed it's always emptied before adding the given value.

```js
const myObject = {}

JSONway.set(myObject, 'a.b.c[=]', 'first')
// { a: { b: { c: [ 'first' ] } } }

JSONway.set(myObject, 'a.b.c[=]', 'second')
// { a: { b: { c: [ 'second' ] } } }

JSONway.set(myObject, 'a.b.c[=]', 3)
// { a: { b: { c: [ 3 ] } } }

JSONway.set(myObject, 'a.b.c[=].d', 'new value')
// { a: { b: { c: [ { d: 'new value' } ] } } }
```

### `()` - Set path-given values

In addition to the given value to be set, path can also include other nested values to be set, too. This makes it easier to for example set some nested objects that will always have the same 'boilerplate' values needed, too. Context and the JSON-value being operated is the current JSON value in the path thus far.

Syntax is the same as with `JSONway.calculateExpression` for multiple `=` operations, but also an object-like imitation syntax is available. Any empty space is ignored similarly like with `JSONway.get` and `JSONway.calculateExpression`, meaning that any formatting that feels appropriate can be used.

```js
a(b:10, c:'foo').e
```

```js
const myObject = {}
const setPath = JSONway.parse("a(b:10, c:'foo').e")

JSONway.set(myObject, setPath, 'first')
// { a: { b: 10, c: 'foo', e: 'first' } }
```

### `{}` - Set multiple values at the same time

Similarly to `()` syntax, but with `{}` we can set values given as the 3rd parameter. Values can be given either as an ordered list, or as an object with the same sub-paths as the keys.

```js
a{ b, c.d, e[] }
```

```js
const myObject = {}

JSONway.set(myObject, 'a{ b, c.d, e[] }', ['first', 'second', 3])
// { a: { b: 'first', c: { d: 'second' }, e: [ 3 ] } }
```

If wanted, the same paths can be also defined in the object given as the set value, which will be then used as the input per each sub-path in the multi-set path.

```js
const anotherObject = {}
const setPath = `
  a {
    b,
    c.d,
    e[]
  }
  `
const setObject = {
    b: 'first',
    'c.d': 'second',
    'e[]': 3,
  }

JSONway.set(anotherObject, setPath, setObject)
// { a: { b: 'first', c: { d: 'second' }, e: [ 3 ] } }
```

If a given set value doesn't have a key with the sub-path, it won't be set and, effectively skipped and ignored.

### `{:}` Expand given paths

Similarly to `{}` syntax with an object set value, but all the paths are set and expanded without needing to have matching sub-paths in the main path. Behaves very similarly to `JSONway.expand`, except allowing having `{:}` after some prefix nested path to reduce repetition on the given sub-paths.

```js
const myObject = {}
const setObject = {
    b: 'first',
    'c.d': 'second',
    'e[]': 3,
  }

JSONway.set(myObject, 'a{:}', setObject)
// { a: { b: 'first', c: { d: 'second' }, e: [ 3 ] } }

const anotherObject = {}

JSONway.set(anotherObject, 'a[]', [1, 2])
// { a: [ 1, 2 ] }
JSONway.set(anotherObject, 'a[*]{:}', setObject)
// {
//   a: [
//     { b: 'first', c: { d: 'second' }, e: [ 3 ] },
//     { b: 'first', c: { d: 'second' }, e: [ 3 ] }
//   ]
// }
```
