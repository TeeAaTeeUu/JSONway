# Get values from nested JSON

With getter, you can query values from JSON objects and arrays. We'll use an example JSON object below. Let's go through all features, capabilities, and syntax one by one.

In general queries will do an early exit and return `undefined`, in case the indicated path in the query doesn't exist, or for example an array was expected but some other JSON value was found instead.

<details>

<summary>Example JSON</summary>

```js
{
  aa: { bb: { cc: 'nested object path' }},
  dd: ['zz', 'yy', ['xx1', 'xx2', 'xx3']],
  ff: [['z1', 'z2'], ['z2', 'z3'], ['z4', 'z4']],
  gg: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
}
```

</details>


## `.` Nested object paths

At its simplest when no escaping is needed, properties only need to be separated by `.` period:

```js
aa.bb.cc
```

Same can also be written in following different ways, all equivalent and resulting same, regardless of the spacing or syntax used:

```js
aa[bb][cc]
```

```js
aa.[ bb ].cc
```

```js
[ 'aa' ]["bb"].cc
```

```js
aa . bb [cc]
```

```js
aa
 .bb .
  cc
```

As long as the property name can't be misunderstood to be a syntax for something else, escaping with square brackets `[]` or with quoted square brackets `['']` isn't needed. If the name contains any of the following characters, it needs to be escaped: `[`, `]`, `,`, `"`, `'`, `.`, or any empty spaces or new line characters.

If some part of the path doesn't exist, then `undefined` is returned instead:

```js
aa.missing.bb
```

<details>

<summary>example usage</summary>

```js
JSONway.get(myObject, 'aa.bb.cc')
// 'nested object path'

JSONway.get(myObject, 'aa.bb')
// { cc: 'nested object path' }

JSONway.get(myObject, 'aa[ bb ]\n. cc')
// 'nested object path'

JSONway.get(myObject, 'aa.missing.cc')
// undefined
```

</details>

## `[0]` - Nested indexed array paths

When only one index is wanted from an array, those paths can be defined either as escaped with `[0]` or only with `.0` in the query. Indexing starts from zero. Similarly empty spaces and new line characters can be used as wanted for more clear formatting.

```js
dd[0]
```

```js
dd.0
```

```js
dd[2][1]
```

```js
dd.2.1
```

The first two and the last two of the above are equivalent to each other.

When wanting to start the indexing from the end of the array list, use negative numbers instead (starting from `-1`):

```js
dd[-2]
```

```js
dd.-1
```

```js
dd[-1][0]
```

```js
dd.-1.0
```

In case of trying to select a non-existing index from the array list, `undefined` is returned instead.

<details>

<summary>example usage</summary>

```js
JSONway.get(myObject, 'dd[0]')
// 'zz'

JSONway.get(myObject, 'dd.0')
// 'zz'

JSONway.get(myObject, 'dd[2][1]')
// 'xx2'

JSONway.get(myObject, 'dd.2.1')
// 'xx2'


JSONway.get(myObject, 'dd[-2]')
// 'yy'

JSONway.get(myObject, 'dd.-1')
// ['xx1', 'xx2', 'xx3']

JSONway.get(myObject, 'dd[-1][1]')
// 'xx2'

JSONway.get(myObject, 'dd.-1.1')
// 'xx2'

JSONway.get(myObject, 'dd.101')
// undefined
```

</details>

## Nested array paths

If wanted to get the whole array one way or another, there are many different ways to do that. The remaining path of the query is processed for each of the array values, allowing to select more deeply nested values within arrays.

For example `ff[].0` would select from a list of lists the first value within all of the latter nested lists.

### `[]` - Flattening nested arrays

When only one `[]` is used in the path, this syntax doesn't do anything special, apart from selecting the whole array as it is:

```js
ff[0][]
```

```js
ff[0]
```

```js
ff[].0
```

But when there are multiple of `[]` in the path, then all the results are flattened. This means that all the values that were found, are within a single non-nested array of values.

```js
ff[][]
```

In case some of the nested values indicated in the path to be arrays with `[]` selector either aren't lists or don't exist, those are skipped and not included in the returned values. As long as at least the first indicated array existed, then the query is guaranteed to return at least an empty array. If even the first array isn't an array, then `undefined` is returned.

<details>

<summary>example usage</summary>

```js
JSONway.get(myObject, 'ff[0][]')
// ['z1', 'z2']

JSONway.get(myObject, 'ff[0]')
// ['z1', 'z2']

JSONway.get(myObject, 'ff[][]')
// ['z1', 'z2', 'z2', 'z3', 'z4', 'z4']

JSONway.get(myObject, 'ff[].0')
// ['z1', 'z2', 'z4']

JSONway.get(myObject, 'aa[]')
// undefined
```

</details>

### `[#]` - Unique flatten values in nested arrays

Otherwise the same as `[]`, but only unique values are returned. Order of the values is the same as they first appeared in the JSON.

```js
ff[2][#]
```

```js
ff[#][#]
```

```js
ff[#][]
```

<details>

<summary>example usage</summary>

```js
JSONway.get(myObject, 'ff[2][#]')
// ['z4']

JSONway.get(myObject, 'ff[#][#]')
// ['z1', 'z2', 'z3', 'z4']

JSONway.get(myObject, 'ff[#][]')
// ['z1', 'z2', 'z3', 'z4']
```

</details>

### `[:]` - Unflatten values in nested arrays

Otherwise same as `[]`, but without flattening, meaning the structure of nested arrays is kept.

```js
ff[:].0
```

```js
ff[:][]
```

<details>

<summary>example usage</summary>

```js
JSONway.get(myObject, 'ff[:].0')
// [['z1'], ['z2'], ['z4']]

JSONway.get(myObject, 'ff[:][]')
// [['z1', 'z2'], ['z2', 'z3'], ['z4', 'z4']]
```

</details>

### `[:#]` - Unique unflatten values in nested arrays

Combining unflatten `[:]` and `[#]` in a same single projection, `[:#]`. Can be also written as `[#:]`. Nested lists are compared to each other, and if same, only the first is included in the result.

```js
ff[:#][:#]
```

### `[0,2]` - List of indexes

Selecting multiple indexes from array, allowing both positive and negative indexes, is done similarly to how single indexed array paths are used. If the path until the array has existed, a result array is always returned. If one of the selected indexes doesn't exist, `undefined` will be returned in its place to keep the order of the list otherwise the same. Allows selecting as many indexes as needed.

```js
dd[0,1]
```

```js
ff[0,-1].1
```

<details>

<summary>example usage</summary>

```js
JSONway.get(myObject, 'dd[0,1]')
// ['zz', 'yy']

JSONway.get(myObject, 'ff[0,-1].1')
// ['z2', 'z4']
```

</details>

### `[0:2]` - Array slices

Convenience syntax for the earlier mentioned list of indexes, when wanting to e.g. select first 5 or last 3 from array. Full syntax is `[start : stop : step]`, where `0`, the end of the array, and `1` are assumed as defaults if not specified. Meaning that `[:5]` means the first 5, and `[-3:]` returns the last 3.

```js
gg[:10:2]
```

<details>

<summary>example usage</summary>

```js
JSONway.get(myObject, 'gg[:5]')
// ['a', 'b', 'c', 'd', 'e']

JSONway.get(myObject, 'gg[-3:]')
// ['f', 'g', 'h']

JSONway.get(myObject, 'gg[gg[1:7:2]]')
// ['b', 'd', 'f']
```

</details>

## `[**]` - Deep search

Allows to find properties and values regardless where those are in the JSON, without needing to know the exact path. Either `**` or `[**]` syntax can be used. If the path until the search exists, at least an empty array is returned. Deep search comes with the performance cost of needing to traverse the JSON for each of its paths and values. Traversal search is done as Breadth First Search.

```js
**.cc
```

```js
ff[**][0]
```

<details>

<summary>example usage</summary>

```js
JSONway.get(myObject, '**.cc')
// ['nested object path']

JSONway.get(myObject, 'ff[**][0]')
// ff: [['z1', 'z2'], 'z1', 'z2', 'z4'],
```

</details>

## Multiple paths together

Sometimes multiple different paths are wanted to be queried within a single group query. Depending on the need, there are a few different options to do that.

### `[...]` - List of paths and values

When an array is wanted to be returned, multiple paths can be listed as comma `,` separated list, surrounded within square brackets `[` `]`. Regular JSON values can also be used within the list, if needed.

```js
[aa.bb.cc, dd.2.0, 'filler', gg[:5]]
```

```js
[
  aa.bb.cc,
  dd.2.0,
  'filler',
  gg[:5],
]
```

Path until the list of paths can be also applied, which will narrow down the paths, and reduce repetition. In case of selecting only by an index, `[0]` escaped syntax is required to distinguish from plain numbers as JSON values.

```js
dd[
  [0],
  0,
  2.1,
]
```

If path returns a list, it can be spread out and flatten with `...` syntax.

```js
[
  aa.bb.cc,
  dd.2.0,
  'filler',
  ...gg[:5],
]
```

<details>

<summary>example usage</summary>

```js
JSONway.get(myObject, "[aa.bb.cc, dd.2.0, 'filler', gg[:5]]")
// ['nested object path', 'xx1', 'filler', ['a', 'b', 'c', 'd', 'e']]

JSONway.get(
  myObject,
  `dd[
    [0],
    0,
    2.1,
  ]`
)
// ['zz', 0, 'xx2']

JSONway.get(
  myObject,
  `[
    aa.bb.cc,
    dd.2.0,
    'filler',
    ...gg[:5],
  ]`
)
// ['nested object path', 'xx1', 'filler', 'a', 'b', 'c', 'd', 'e']
```

</details>

### `{}` - Object of paths

When an object is wanted to be returned, multiple paths can be listed as comma `,` separated list, surrounded within curly brackets `{` `}`. By default the name for the key within the object will be the path itself, but can be overwritten by prefixing with `myName:`. Similarly default value can be set, in case path doesn't exist or returns `undefined`, with postfixing `= 'myValue'`. Also, the following aliases for the default value are accepted: `=`, `=?`, `||`.

```js
{aa.bb.cc, dd.2.0, gg[:5]}
```

```js
{
  cc: aa.bb.cc,
  myKey: dd.2.missing =? 'NA',
  top5: gg[:5],
}
```

<details>

<summary>example usage</summary>

```js
JSONway.get(myObject, '{aa.bb.cc, dd.2.0, gg[:5]}')
// {
//  'aa.bb.cc': 'nested object path',
//  'dd.2.0': 'xx1',
//  'gg[:5]': ['a', 'b', 'c', 'd', 'e']
// }

JSONway.get(
  myObject,
  `{
    cc: aa.bb.cc,
    myKey: dd.2.missing =? 'NA',
    top5: gg[:5],
  }`
)
// {
//  cc: 'nested object path',
//  myKey: 'NA',
//  top5: ['a', 'b', 'c', 'd', 'e']
// }
```

</details>

### `?|` - First existing or matching path

When not certain which of the different paths the wanted result is found from, a list of paths can be used to search the first matching one. The syntax is to separate a list of paths and values with `|?`, surrounded within parenthesis `(` `)`. Also following separators are accepted: `||`, `??`, `?|`.

```js
(aa.bb.dd |? dd.2.missing |? dd.2.0 |? 'default')
```

```js
(
  aa.bb.dd |?
  dd.2.missing |?
  dd.2.0 |?
  'default'
)
```

<details>

<summary>example usage</summary>

```js
JSONway.get(myObject, "(aa.bb.dd |? dd.2.missing |? dd.2.0 |? 'default')")
// 'xx1'
```

</details>

## `[*]` - Normalized table view

Especially if wanted to view a mix of interconnected and complex nested JSON objects and arrays, table or spreadsheet format is often useful. This can be achieved with `[*]` syntax within nested array paths, to indicate all the individual values should be expanded to their own rows. `[*]` is otherwise treated similarly to flattening `[]`. Other paths are then grouped by and spread out according to their relation to those expanded values. This might sound complicated, but when needed to be used, it will make more sense.

The syntax is otherwise the same as with the object of paths, but surrounded within `[{` and `}]`.

<details>

<summary>Example JSON</summary>

```js
{
 aa: 'aa1',
 bb: [
   {
     cc: 'cc1',
     dd: 'dd1',
     ee: [
       {
         cc: 'cc2',
         dd: 'dd2',
         ff: [ { gg: [ '01', '11' ] }, { gg: [ '02', '12' ] } ],
         hh: [
           { cc: 'cc3', dd: 'dd3', ii: { cc: 'cc4', dd: 'dd4' } },
           { cc: 'cc5', dd: 'dd5', ii: { cc: 'cc6', dd: 'dd6' } }
         ]
       },
       {
         cc: 'cc7',
         dd: 'dd7',
         ff: [ { gg: [ '03', '13' ] } ],
         hh: [
           { cc: 'cc8', dd: 'dd8', ii: { cc: 'cc9', dd: 'dd9' } },
           { cc: 'cc10', dd: 'dd10', ii: { cc: 'cc11', dd: 'dd11' } }
         ]
       }
     ]
   },
   {
     cc: 'cc12',
     dd: 'dd12',
     ee: [
       {
         cc: 'cc13',
         dd: 'dd13',
         hh: [
           { cc: 'cc14', dd: 'dd14', ii: { cc: 'cc15', dd: 'dd15' } },
           { cc: 'cc16', dd: 'dd16', ii: { cc: 'cc17', dd: 'dd17' } }
         ]
       },
       {
         cc: 'cc18',
         dd: 'dd18',
         ff: [ { gg: [ '04', '14' ] } ],
         hh: [
           { cc: 'cc19', dd: 'dd19', ii: { cc: 'cc20', dd: 'dd20' } },
           { cc: 'cc21', dd: 'dd21', ii: { cc: 'cc22', dd: 'dd22' } }
         ]
       }
     ]
   }
 ]
}
```

</details>

Syntax:

```js
[{
 bb[*].dd,
 bb[].ee[*].dd,
 bb[].ee[].hh[*].dd,
 bb[].ee[].hh[].ii.dd,
 aa,
 bb[].cc,
}]
```

<details>

<summary>example usage</summary>

```js
JSONway.get(
 myObject,
 `[{
   aa,
   bb_dd: bb[*].dd,
   ee_dd: bb[].ee[*].dd,
   hh_dd: bb[].ee[].hh[*].dd,
   ii_dd: bb[].ee[].hh[].ii.dd,
   bb_cc: bb[].cc,
 }]`
)
```

```js
[
  {
    aa: 'aa1',
    bb_dd: 'dd1',
    ee_dd: 'dd2',
    hh_dd: 'dd3',
    bb_cc: 'cc1',
    ii_dd: 'dd4'
  },
  {
    aa: 'aa1',
    bb_dd: 'dd1',
    ee_dd: 'dd2',
    hh_dd: 'dd5',
    bb_cc: 'cc1',
    ii_dd: 'dd6'
  },
  {
    aa: 'aa1',
    bb_dd: 'dd1',
    ee_dd: 'dd7',
    hh_dd: 'dd8',
    bb_cc: 'cc1',
    ii_dd: 'dd9'
  },
  {
    aa: 'aa1',
    bb_dd: 'dd1',
    ee_dd: 'dd7',
    hh_dd: 'dd10',
    bb_cc: 'cc1',
    ii_dd: 'dd11'
  },
  {
    aa: 'aa1',
    bb_dd: 'dd12',
    ee_dd: 'dd13',
    hh_dd: 'dd14',
    bb_cc: 'cc12',
    ii_dd: 'dd15'
  },
  {
    aa: 'aa1',
    bb_dd: 'dd12',
    ee_dd: 'dd13',
    hh_dd: 'dd16',
    bb_cc: 'cc12',
    ii_dd: 'dd17'
  },
  {
    aa: 'aa1',
    bb_dd: 'dd12',
    ee_dd: 'dd18',
    hh_dd: 'dd19',
    bb_cc: 'cc12',
    ii_dd: 'dd20'
  },
  {
    aa: 'aa1',
    bb_dd: 'dd12',
    ee_dd: 'dd18',
    hh_dd: 'dd21',
    bb_cc: 'cc12',
    ii_dd: 'dd22'
  }
]
```

</details>

## `|>` - Pipe modifiers

With pipe modifiers the results can be further processed, for example returning the size of the list instead of the list itself. These can be used either at the end of the path to modify the current value, or within array operators to work on the matched values as a list. Multiple pipe modifiers can be added in a chain, separated by period `.`. Also following pipe modifier indicators can be used: `||` and `=>`.

Following pipe modifiers are supported:
- `size` for the length of the list
 - Aliases: `length`, `len`, `count`
- `max` to return largest value
- `min` to return smallest value
- `sum` to do addition with all the numbers
- `floor` to round a number down
- `ceil` to round number up
- `trunc` to remove decimal value from a number
- `round` to round a number to closest integer
- `average` to calculate average of the numbers
 - Alias: `avg`
- `sort` to organize the list in ascending order
- `reverse` to turn around the direction of the list
- `split` to separate a text by a given delimiter
- takes one argument for the separator

```js
gg |> size
```

```js
ff[] |> len
```

```js
aa.bb.cc |> split[' '].2
```

```js
gg |> reverse.0
```

In case the modifier is not supported by the value given, the current value is passed to the next modifier in the pipe chain. If none match, value is returned as it would have been without any modifiers.

<details>

<summary>example usage</summary>

```js
JSONway.get(myObject, 'gg |> size')
// 8

JSONway.get(myObject, 'ff[] |> len')
// [ 2, 2, 2 ]

JSONway.get(myObject, "aa.bb.cc |> split[' '].2")
// 'path'

JSONway.get(myObject, 'gg |> reverse.0')
// 'h'
```

</details>

## `()` - expression conditions

Match rules and conditions can also be given within expressions, to further filter down matching results. These logical expressions are given within parenthesis `(` and `)`, and a full suite of different operators can be used.

A more comprehensive list of supported syntax is given at [calculateExpression](./calculateExpression.md).
