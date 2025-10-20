# Pre-parse path

Paths can also be parsed before they are used, for caching them for repeated use, for further inspection or even modifications. At the moment no guarantee is given about internal syntax and format of the parsed path from `JSONway.parse`.

```js
const path = JSONway.parse('{aa.bb.cc, dd.2.0, gg[:5]}')

const result = JSONway.get(myObject, path)
```
