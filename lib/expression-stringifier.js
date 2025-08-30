import { stringifyPath } from './path-stringifier.js'
import {
  AND,
  OR,
  OPEN_LIST,
  OPEN_PARENTHESIS,
  EQUAL,
  NOT_EQUAL,
  LIKE,
  EXISTS,
  LARGER,
  SMALLER,
  LARGER_EQUAL,
  SMALLER_EQUAL,
  PLUS,
  MINUS,
  DIVIDE,
  MULTIPLY,
  REMAINDER,
  NEGATION,
  PLACEHOLDER,
} from './expression-parser.js'
import { stringify } from './stringifier.js'

export function stringifyExpression(parsedExpression) {
  if (!Array.isArray(parsedExpression)) return parsedExpression

  const stringified = []
  let nextIsParenthesis = false
  let nextIsList = false

  for (const token of parsedExpression) {
    if (Array.isArray(token) && nextIsList) {
      stringified.push(
        token
          .map(subToken => {
            if (Array.isArray(subToken)) return stringifyPath(subToken)

            if (typeof subToken === 'string') return `'${subToken}'`
            return stringify(subToken)
          })
          .join(', '),
        ']',
      )
      nextIsList = false
      continue
    }

    if (Array.isArray(token) && !nextIsParenthesis) {
      stringified.push(stringifyPath(token))
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
          case OPEN_PARENTHESIS:
            stringified.push(token)
            nextIsParenthesis = true
            break
          case OPEN_LIST:
            stringified.push(token)
            nextIsList = true
            break
          case AND:
          case OR:
          case EQUAL:
          case NOT_EQUAL:
          case LIKE:
          case EXISTS:
          case LARGER:
          case SMALLER:
          case LARGER_EQUAL:
          case SMALLER_EQUAL:
          case PLUS:
          case MINUS:
          case DIVIDE:
          case MULTIPLY:
          case REMAINDER:
          case NEGATION:
          case PLACEHOLDER:
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
