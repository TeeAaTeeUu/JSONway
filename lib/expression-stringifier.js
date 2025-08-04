import pathStringifier from './path-stringifier.js'
import expressionParser from './expression-parser.js'
import stringifier from './stringifier.js'

export function stringifyExpression(parsedExpression) {
  if (parsedExpression === null) return 'null'
  if (!Array.isArray(parsedExpression)) return parsedExpression

  const stringified = []
  let nextIsParenthesis = false
  let nextIsList = false

  for (const token of parsedExpression) {
    if (Array.isArray(token) && nextIsList) {
      stringified.push(
        token
          .map(subToken => {
            if (Array.isArray(subToken))
              return pathStringifier.stringifyPath(subToken)

            if (typeof subToken === 'string') return `'${subToken}'`
            return stringifier.stringify(subToken)
          })
          .join(', '),
        ']',
      )
      nextIsList = false
      continue
    }

    if (Array.isArray(token) && !nextIsParenthesis) {
      stringified.push(pathStringifier.stringifyPath(token))
      continue
    }

    nextIsParenthesis = false
    nextIsList = false

    switch (typeof token) {
      case 'number':
        stringified.push(token)
        break
      case 'string':
        switch (token) {
          case expressionParser.OPEN_PARENTHESIS:
            stringified.push(token)
            nextIsParenthesis = true
            break
          case expressionParser.OPEN_LIST:
            stringified.push(token)
            nextIsList = true
            break
          case expressionParser.AND:
          case expressionParser.OR:
          case expressionParser.EQUAL:
          case expressionParser.NOT_EQUAL:
          case expressionParser.LIKE:
          case expressionParser.EXISTS:
          case expressionParser.LARGER:
          case expressionParser.SMALLER:
          case expressionParser.LARGER_EQUAL:
          case expressionParser.SMALLER_EQUAL:
          case expressionParser.PLUS:
          case expressionParser.MINUS:
          case expressionParser.DIVIDE:
          case expressionParser.MULTIPLY:
          case expressionParser.REMAINDER:
          case expressionParser.NEGATION:
          case expressionParser.PLACEHOLDER:
            stringified.push(token)
            break
          default:
            stringified.push(`'${token}'`)
            break
        }
        break
      case 'object':
        stringified.push(stringifyExpression(token), ')')
        break
    }
  }

  // TODO: fix me the right way
  return stringified
    .join(' ')
    .replaceAll('( ', '(')
    .replaceAll(' )', ')')
    .replaceAll('[ ', '[')
    .replaceAll(' ]', ']')
}

export default {
  stringifyExpression,
}
