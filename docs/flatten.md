# Flatten nested JSON to a single object

If wanting to have each nested values within a JSON with their corresponding path, `JSONway.flatten` can be used. This does traversal of the JSON, and returns an object of key-value pairs, where the key is the path to the value within the nested JSON. Especially useful when done to each individual object within a JSON list, to reduce the nestedness and to return more readable list of objects.

The opposite transformation back to nested JSON is `JSONway.expand`.

```js
const flatObject = JSONway.flatten(complexNested)
```

```js
{
  aa: 'aa1',
  'bb[0].cc': 'cc1',
  'bb[0].dd': 'dd1',
  'bb[0].ee[0].cc': 'cc2',
  'bb[0].ee[0].dd': 'dd2',
  'bb[0].ee[0].ff[].gg[]': [ [ '01', '11' ], [ '02', '12' ] ],
  'bb[0].ee[0].hh[0]{cc,dd,ii.cc,ii.dd}': [ 'cc3', 'dd3', 'cc4', 'dd4' ],
  'bb[0].ee[0].hh[1]{cc,dd,ii.cc,ii.dd}': [ 'cc5', 'dd5', 'cc6', 'dd6' ],
  'bb[0].ee[1].cc': 'cc7',
  'bb[0].ee[1].dd': 'dd7',
  'bb[0].ee[1].ff[].gg[]': [ [ '03', '13' ] ],
  'bb[0].ee[1].hh[0]{cc,dd,ii.cc,ii.dd}': [ 'cc8', 'dd8', 'cc9', 'dd9' ],
  'bb[0].ee[1].hh[1].cc': 'cc10',
  'bb[0].ee[1].hh[1].dd': 'dd10',
  'bb[0].ee[1].hh[1].ii.cc': 'cc11',
  'bb[0].ee[1].hh[1].ii.dd': 'dd11',
  'bb[1].cc': 'cc12',
  'bb[1].dd': 'dd12',
  'bb[1].ee[0].cc': 'cc13',
  'bb[1].ee[0].dd': 'dd13',
  'bb[1].ee[0].hh[0].cc': 'cc14',
  'bb[1].ee[0].hh[0].dd': 'dd14',
  'bb[1].ee[0].hh[0].ii.cc': 'cc15',
  'bb[1].ee[0].hh[0].ii.dd': 'dd15',
  'bb[1].ee[0].hh[1].cc': 'cc16',
  'bb[1].ee[0].hh[1].dd': 'dd16',
  'bb[1].ee[0].hh[1].ii.cc': 'cc17',
  'bb[1].ee[0].hh[1].ii.dd': 'dd17',
  'bb[1].ee[1].cc': 'cc18',
  'bb[1].ee[1].dd': 'dd18',
  'bb[1].ee[1].ff[].gg[]': [ [ '04', '14' ] ],
  'bb[1].ee[1].hh[0].cc': 'cc19',
  'bb[1].ee[1].hh[0].dd': 'dd19',
  'bb[1].ee[1].hh[0].ii.cc': 'cc20',
  'bb[1].ee[1].hh[0].ii.dd': 'dd20',
  'bb[1].ee[1].hh[1].cc': 'cc21',
  'bb[1].ee[1].hh[1].dd': 'dd21',
  'bb[1].ee[1].hh[1].ii.cc': 'cc22',
  'bb[1].ee[1].hh[1].ii.dd': 'dd22'
}
```
