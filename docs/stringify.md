# Stringify parsed paths

Especially when some modifications to the parsed path have been done, it might be useful to turn that back into the query language format. Can also be used to confirm the normalized parsing of the given path. This tries to add helpful spacing to the lists, objects, and expressions when needed.

```js
const path = JSONway.parse("a(c='y').b")

const query = JSONway.stringify(path)
// a(c = 'y').b
```
