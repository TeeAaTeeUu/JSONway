# Return query paths found in the JSON

If wanting to know paths that exist in the JSON, this can be used to return a list of valid query paths. Useful when wanting to know the structure of the JSON without the values of the nested lists, or the lengths of those arrays.

```js
const queries = JSONway.analyze(myObject)
```

```js
[
  'aa.bb.cc',
  'dd[]',
  'dd[][]',
  'ff[][]',
  'gg[]'
]
```
