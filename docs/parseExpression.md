# Pre-parse expression

Expressions can also be parsed before they are used, similarly to `JSONway.parse`. This can be done for caching them for a repeated use, for further inspection or even modifications. At the moment no guarantees are given about the internal syntax and format of the expressions from `JSONway.parseExpression`.

```js
const expression = JSONway.parseExpression('(a >= 5)')

const result = JSONway.calculateExpression(myObject, expression)
```
