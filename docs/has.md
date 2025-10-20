# Has value and path exists

If only the existence of a result is needed from `JSONway.get`, then `JSONway.has` can be used to check if the result is something else than `undefined` or an empty list or object.

```js
JSONway.has(myObject, 'aa.bb.cc')
// true

JSONway.has(myObject, 'aa.missing.bb')
// false
```
