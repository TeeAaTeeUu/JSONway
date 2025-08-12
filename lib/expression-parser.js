import { _safe, parse } from './parser.js'
import { cast } from './value-parser.js'

export const AND = '&&'
const OR = '||'
export const OPEN_PARENTHESIS = '('
export const OPEN_LIST = '['
export const EQUAL = '='
const NOT_EQUAL = '!='
const LIKE = '~='
const EXISTS = '?'
const LARGER = '>'
const SMALLER = '<'
const LARGER_EQUAL = '>='
const SMALLER_EQUAL = '<='
const PLUS = '+'
const MINUS = '-'
const DIVIDE = '/'
const MULTIPLY = '*'
const REMAINDER = '%'
const NEGATION = '!'
const PLACEHOLDER = '$'

const FUNCTION_PROPERTY = 'func'
const ESCAPED_ARRAY_OR_OBJECT_KEY = '.'

export function parseExpression(current, currentIndex = 0) {
  const returnExpression = []
  let expression = returnExpression
  const nestedStack = [expression]
  let potentialNestingNeeded = false
  let startI = currentIndex
  let i = startI
  let len = current.length
  let temp = ''
  let nestedBrackets = 0
  let end = false

  for (; i < len && !end; i++) {
    switch (current[i]) {
      case "'":
        temp = ''
        startI = ++i
        while (i < len && current[i] !== "'") i++
        expression.push(_safe(current.slice(startI, i)))

        break
      case ' ':
        break
      case '(':
        if (temp) {
          expression.push({ [FUNCTION_PROPERTY]: _safe(temp) })
          temp = ''
        }
        expression.push(OPEN_PARENTHESIS)
        expression.push([])
        expression = expression.at(-1)
        nestedStack.push(expression)
        break
      case ')':
        if (temp) {
          expression.push(_parseTemp(temp))
          temp = ''
        }
        if (nestedStack.length === 1) {
          end = true
          i--
          break
        }
        nestedStack.pop()
        expression = nestedStack.at(-1)
        break
      case '.':
        if (temp) {
          temp += current[i]
          break
        }
        expression.push(ESCAPED_ARRAY_OR_OBJECT_KEY) // TODO: need to solve this
        break
      case '[':
        if (temp) {
          temp += current[i]
          break
        }

        startI = ++i
        nestedBrackets = 1
        for (; i < len; i++) {
          if (current[i] === '[') nestedBrackets++
          else if (current[i] === ']') if (--nestedBrackets === 0) break
        }

        temp = _parseList(current.slice(startI, i))

        if (temp.length === 1) {
          if (typeof temp[0] === 'number' || typeof temp[0] === 'string') {
            expression.push(temp[0])
            temp = ''
            break
          }
        }

        expression.push(OPEN_LIST, temp)
        temp = ''
        break
      case '=':
      case '?':
      case '!':
      case '>':
      case '<':
      case '~':
      case '&':
      case '|':
      case '+':
      case '-':
      case '*':
      case '/':
        if (temp) {
          expression.push(_parseTemp(temp))
          temp = ''
        }

        switch (current[i + 1]) {
          case '=':
            switch (current[i]) {
              case '!':
                expression.push(NOT_EQUAL)
                i++
                continue
              case '~':
                expression.push(LIKE)
                i++
                continue
              case '>':
                expression.push(LARGER_EQUAL)
                i++
                continue
              case '<':
                expression.push(SMALLER_EQUAL)
                i++
                continue
            }
            break
          case '&':
            if (current[i] === '&') {
              expression.push(AND)
              potentialNestingNeeded = true
              i++
              continue
            }
            break
          case '|':
            if (current[i] === '|') {
              expression.push(OR)
              potentialNestingNeeded = true
              i++
              continue
            }
        }

        switch (current[i]) {
          case '&':
            expression.push(AND)
            potentialNestingNeeded = true
            break
          case '|':
            expression.push(OR)
            potentialNestingNeeded = true
            break
          case '=':
            expression.push(EQUAL)
            break
          case '?':
            expression.push(EXISTS)
            break
          case '!':
            expression.push(NEGATION)
            break
          case '>':
            expression.push(LARGER)
            break
          case '<':
            expression.push(SMALLER)
            break
          case '+':
            expression.push(PLUS)
            break
          case '-':
            expression.push(MINUS)
            break
          case '*':
            expression.push(MULTIPLY)
            break
          case '/':
            expression.push(DIVIDE)
            break
          case '%':
            expression.push(REMAINDER)
        }

        break
      case '$':
        expression.push(PLACEHOLDER)
        break
      default:
        temp += current[i]
    }
  }

  if (temp) expression.push(_parseTemp(temp))
  if (i > len) i = len
  if (potentialNestingNeeded) _doPotentialNesting(returnExpression)

  return [returnExpression, i]
}

function _parseTemp(temp) {
  const casted = cast(temp)
  return typeof casted !== 'string' ? casted : parse(temp)
}

function _parseList(temp) {
  if (!temp) return []
  return temp.split(',').map(x => parseExpression(x)[0][0])
}

// TODO: https://en.wikipedia.org/wiki/Reverse_Polish_notation
function _doPotentialNesting(returnExpression) {
  let potentialNestIndex = -1

  for (let i = 0; i <= returnExpression.length; i++) {
    if (returnExpression[i] === OPEN_PARENTHESIS) {
      if (Array.isArray(returnExpression[i + 1])) {
        _doPotentialNesting(returnExpression[i + 1])
        i++
        continue
      }
    }

    if (
      returnExpression[i] !== AND &&
      returnExpression[i] !== OR &&
      returnExpression[i] !== undefined
    )
      continue

    if (potentialNestIndex < 0) {
      potentialNestIndex = i + 1
      continue
    }

    if (i - potentialNestIndex === 2) {
      if (returnExpression[potentialNestIndex] === OPEN_PARENTHESIS) {
        potentialNestIndex = i + 1
        continue
      }
    }

    if (i - potentialNestIndex > 1) {
      const toBeNested = returnExpression.slice(potentialNestIndex, i)

      returnExpression.splice(
        potentialNestIndex,
        i - potentialNestIndex,
        OPEN_PARENTHESIS,
        toBeNested,
      )

      i -= toBeNested.length - 2
    }

    potentialNestIndex = i + 1
  }

  return returnExpression
}

export default {
  parseExpression,
  AND,
  OR,
  OPEN_PARENTHESIS,
  OPEN_LIST,
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
}
