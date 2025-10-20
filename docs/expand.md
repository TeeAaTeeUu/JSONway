# Expand to nested JSON

When given an object of paths as the keys and their corresponding values, `JSONway.expand` will create a nested JSON according to the given paths. Paths are assumed to be compatible with `JSONway.set`.

The opposite transformation back to flattened object with paths is `JSONway.flatten`, although `JSONway.expand` also supports the full syntax capabilities of `JSONway.set` like array push `[+]` syntax, which isn't used at the moment within `JSONway.flatten` outputs.

```js
const flatten = {
  'aa': 'aa1',
  'bb[0].dd': 'dd12',
  'bb[0].ee[0].dd': 'dd13',
  'bb[0].ee[0].hh[0].dd': 'dd16',
  'bb[0].ee[0].hh[0].ii.dd': 'dd17',
  'bb[0].cc': 'cc12',
}

const expanded = JSONway.expand(flatten)
```

```js
{
  aa: 'aa1',
  bb: [
    {
      dd: 'dd12',
      ee: [
        {
          dd: 'dd13',
          hh: [ { dd: 'dd16', ii: { dd: 'dd17' } } ]
        }
      ],
      cc: 'cc12'
    }
  ]
}
```
