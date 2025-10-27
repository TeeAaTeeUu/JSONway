import { ARRAY_INDEXES, ARRAY_LIST, parseArray } from './array-parser.js'
import { parse } from './parser.js'
import {
  DOUBLE_QUOTE,
  SINGLE_QUOTE,
  cast,
  isInteger,
  unscape,
} from './value-parser.js'

export const RULE = '()'

export const AND = '&&'
export const OR = '||'
export const EXISTS_OR = '?|'
export const OPEN_PARENTHESIS = '('
export const OPEN_LIST = '['
export const EQUAL = '='
export const NOT_EQUAL = '!='
export const LIKE = '~='
export const EXISTS = '?'
export const LARGER = '>'
export const SMALLER = '<'
export const LARGER_EQUAL = '>='
export const SMALLER_EQUAL = '<='
export const PLUS = '+'
export const MINUS = '-'
export const DIVIDE = '/'
export const MULTIPLY = '*'
export const REMAINDER = '%'
export const NEGATION = '!'
export const PLACEHOLDER = '$'

export function parseExpression(current, currentIndex) {
  if (currentIndex === undefined) return _parseExpression(current)[0]
  return _parseExpression(current, currentIndex)
}

function _parseExpression(current, currentIndex = 0) {
  const returnExpression = []
  let expression = returnExpression
  const nestedStack = [expression]
  let potentialNestingNeeded = false
  let startI = currentIndex
  let i = startI
  let len = current.length
  let temp = ''
  let tempResult = []
  let end = false
  let singleEscaped = false
  let doubleEscaped = false

  for (; i < len && !end; i++) {
    switch (current[i]) {
      case '"':
      case "'":
        temp = ''
        startI = i

        for (; i < len; i++) {
          if (current[i] === SINGLE_QUOTE && !doubleEscaped)
            singleEscaped = !singleEscaped
          else if (current[i] === DOUBLE_QUOTE && !singleEscaped)
            doubleEscaped = !doubleEscaped
          else if (singleEscaped || doubleEscaped) continue
          else {
            i--
            break
          }
        }

        expression.push(unscape(current.slice(startI, i)))
        break
      case '\n':
      case '\t':
      case ' ':
        break
      case '(':
        if (temp.trim()) {
          expression.push(_parseTemp(temp))
          expression.push(AND) // TODO: check if this assumption is bad
        }
        temp = ''
        expression.push(OPEN_PARENTHESIS)
        expression.push([])
        expression = expression.at(-1)
        nestedStack.push(expression)
        break
      case ')':
        if (temp.trim()) expression.push(_parseTemp(temp))
        temp = ''
        if (nestedStack.length === 1) {
          end = true
          i--
          break
        }
        nestedStack.pop()
        expression = nestedStack.at(-1)
        break
      case '[':
        startI = i
        ;[tempResult, i] = parseArray(current, ++i)

        if (temp) {
          temp += current.slice(startI, i + 1)
          break
        }

        if (tempResult[0] === ARRAY_LIST || tempResult[0] === ARRAY_INDEXES) {
          expression.push(OPEN_LIST, tempResult[1][0])
          temp = ''
          break
        }

        temp = current.slice(startI, i + 1)
        break
      case '=':
      case ':':
      case '?':
      case '!':
      case '>':
      case '<':
      case '~':
      case '&':
      case ',':
      case '|':
      case '+':
      case '-':
      case '*':
      case '/':
      case '%':
        if (temp.trim()) expression.push(_parseTemp(temp))
        temp = ''

        // TODO: indicate operator separate from strings
        switch (current[i] + current[i + 1]) {
          case '==':
            if (current[i + 2] === '=') i++
            expression.push(EQUAL)
            i++
            continue
          case '!=':
            if (current[i + 2] === '=') i++
            expression.push(NOT_EQUAL)
            i++
            continue
          case '~=':
            expression.push(LIKE)
            i++
            continue
          case '>=':
            expression.push(LARGER_EQUAL)
            i++
            continue
          case '<=':
            expression.push(SMALLER_EQUAL)
            i++
            continue
          case '&&':
            expression.push(AND)
            potentialNestingNeeded = true
            i++
            continue
          case '||':
            expression.push(OR)
            potentialNestingNeeded = true
            i++
            continue
          case '|?':
          case '?|':
          case '??':
            expression.push(EXISTS_OR)
            i++
            continue
        }

        switch (current[i]) {
          case '&':
          case ',':
            expression.push(AND)
            potentialNestingNeeded = true
            break
          case '|':
            expression.push(OR)
            potentialNestingNeeded = true
            break
          case '=':
          case ':':
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
            if (isInteger(current[i + 1])) temp += current[i]
            else expression.push(MINUS)
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

  if (temp.trim()) expression.push(_parseTemp(temp))
  if (i > len) i = len
  if (potentialNestingNeeded) _doPotentialNesting(returnExpression)
  if (_existsOrOnly(returnExpression)) return [[EXISTS_OR, returnExpression], i]

  return [returnExpression, i]
}

function _parseTemp(temp) {
  const casted = cast(temp)
  return typeof casted !== 'string' ? casted : parse(temp)
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

function _existsOrOnly(parsedExpression) {
  if (parsedExpression.length <= 1) return false

  for (let i = 1; i < parsedExpression.length; i += 2)
    if (parsedExpression[i] !== EXISTS_OR) return false

  return true
}
