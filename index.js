import { analyze } from './lib/analyzer.js'
import { expand, expandAll } from './lib/expander.js'
import { parseExpression } from './lib/expression-parser.js'
import { calculateExpression } from './lib/expression-processor.js'
import { flatten } from './lib/flattener.js'
import { get, has } from './lib/getter.js'
import { parse } from './lib/parser.js'
import { set } from './lib/setter.js'
import { stringifyPath as stringify } from './lib/path-stringifier.js'

export { analyze }
export { expand }
export { expandAll }
export { parseExpression }
export { calculateExpression }
export { flatten }
export { get }
export { has }
export { parse }
export { set }
export { stringify }

export default {
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
  stringify,
}
