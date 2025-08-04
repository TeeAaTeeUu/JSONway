import analyzer from './lib/analyzer.js'
import expander from './lib/expander.js'
import expressionParser from './lib/expression-parser.js'
import expressionProcessor from './lib/expression-processor.js'
import expressionStringifier from './lib/expression-stringifier.js'
import flattener from './lib/flattener.js'
import getter from './lib/getter.js'
import parser from './lib/parser.js'
import pathAnalyzer from './lib/path-analyzer.js'
import pathStringifier from './lib/path-stringifier.js'
import setter from './lib/setter.js'
import stringifier from './lib/stringifier.js'

export default {
  analyze: analyzer.analyze,
  calculateExpression: expressionProcessor.calculateExpression,
  expand: expander.expand,
  expandAll: expander.expandAll,
  flatten: flattener.flatten,
  get: getter.get,
  has: getter.has,
  parse: parser.parse,
  parseExpression: expressionParser.parseExpression,
  pathDepth: pathAnalyzer.pathDepth,
  set: setter.set,
  stringify: stringifier.stringify,
  stringifyExpression: expressionStringifier.stringifyExpression,
  stringifyPath: pathStringifier.stringifyPath,
}
