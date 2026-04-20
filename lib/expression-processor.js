import { NUMBER } from './_types.js'
import { ARRAY_SPREAD } from './array-parser.js'
import {
  AND,
  DIVIDE,
  EQUAL,
  EXISTS,
  EXISTS_OR,
  LARGER,
  LARGER_EQUAL,
  LIKE,
  MINUS,
  MULTIPLY,
  NEGATION,
  NOT_EQUAL,
  OR,
  PLACEHOLDER,
  PLUS,
  REMAINDER,
  SMALLER,
  SMALLER_EQUAL,
  parseExpression,
  OPEN_LIST,
  EXPRESSION_START,
} from './expression-parser.js'
import { get } from './getter.js'
import { MAX_DEPTH } from './tabletizer.js'

// TODO: rewrite more simply
export function calculateExpression(expression, data, values) {
  const parsedExpression = Array.isArray(expression)
    ? expression
    : parseExpression(expression)

  let token = null
  let leftResult = null
  let leftResultExists = false
  let left = null
  let leftExists = false
  let operator = null
  let prefixOperator = null
  let delayedOperator = null
  let right = null
  let rightExists = false
  const len = parsedExpression.length

  for (let i = 0; i < len; i++) {
    token = parsedExpression[i]

    switch (token) {
      case EQUAL:
      case EXISTS:
      case NOT_EQUAL:
      case LIKE:
      case LARGER:
      case LARGER_EQUAL:
      case SMALLER:
      case SMALLER_EQUAL:
      case PLUS:
      case MINUS:
      case DIVIDE:
      case MULTIPLY:
      case REMAINDER:
        if (!leftExists && !rightExists && !leftResultExists) {
          delayedOperator = token
          operator = null
          break
        }
        operator = token
        break
      case AND:
        if (!leftExists && !rightExists && !leftResult) return false
        if (leftExists && !rightExists && !left) return false
        leftResult = null
        break
      case OR:
        if (leftResult && !leftExists && !rightExists) return leftResult
        if (leftExists && !rightExists && left) return left
        leftResult = null
        break
      case EXISTS_OR:
        if (leftResult !== undefined && !leftExists && !rightExists)
          return leftResult
        if (leftExists && !rightExists && left !== undefined) return left
        break
      case NEGATION:
        prefixOperator = token
        break
      case PLACEHOLDER:
        if (operator) {
          rightExists = true
          right = values
        } else if (delayedOperator) {
          left = _getCleanedResult(data, delayedOperator, values)
          leftExists = true
        } else {
          leftExists = true
          left = values
        }
        break
      case EXPRESSION_START:
        i++
        if (operator) {
          rightExists = true
          right = calculateExpression(parsedExpression[i], data, values)
        } else {
          leftExists = true
          left = calculateExpression(parsedExpression[i], data, values)
        }
        break
      case OPEN_LIST:
        i++
        right = calculateList(parsedExpression[i], data)
        rightExists = true
        break
      default:
        if (Array.isArray(token)) {
          if (operator) {
            rightExists = true
            right = get(data, token)
          } else if (prefixOperator) {
            leftResult = _getResult(get(data, token), prefixOperator)
            leftResultExists = true
          } else {
            leftExists = true
            left = get(data, token)
          }

          break
        }
        // TODO: if (typeof token === OBJECT) {}
        if (operator || delayedOperator) {
          rightExists = true
          right = token
        } else {
          leftExists = true
          left = token
        }
    }

    if (
      (leftExists || leftResultExists) &&
      operator &&
      (rightExists || operator === EXISTS)
    ) {
      if (Array.isArray(right))
        leftResult = _getCleanedResultAny(
          leftResultExists ? leftResult : left,
          operator,
          right,
        )
      else
        leftResult = _getCleanedResult(
          leftResultExists ? leftResult : left,
          operator,
          right,
        )

      leftResultExists = true
      leftExists = false
      left = null
      operator = null
      rightExists = false
      right = null
    }

    if (delayedOperator && rightExists) {
      if (Array.isArray(right))
        leftResult = _getCleanedResultAny(data, delayedOperator, right)
      else leftResult = _getCleanedResult(data, delayedOperator, right)

      delayedOperator = null
      leftResultExists = true
      leftExists = false
      rightExists = false
      left = null
      right = null
    }
  }

  if (delayedOperator && !leftExists && !rightExists)
    return _getCleanedResult(data, delayedOperator, false)

  if (leftExists) return left

  return leftResult
}

function _getCleanedResult(lefts, operator, right) {
  let result = false
  const leftOperands = Array.isArray(lefts) ? lefts.flat(MAX_DEPTH) : [lefts]

  for (const left of leftOperands) {
    result = _getResult(left, operator, right)
    if (result === true || Number.isFinite(result)) return result
  }

  if (Number.isNaN(result)) return null
  return result
}

function _getCleanedResultAny(lefts, operator, right) {
  let result = false
  const leftOperands = Array.isArray(lefts) ? lefts.flat(MAX_DEPTH) : [lefts]

  for (const left of leftOperands) {
    result = _getResultAny(left, operator, right)
    if (result === true || Number.isFinite(result)) return result
  }

  if (Number.isNaN(result)) return null
  return result
}

function _getResult(left, operator, right) {
  switch (operator) {
    case EQUAL:
      return left === right
    case EXISTS:
      return left !== undefined && left !== null
    case NOT_EQUAL:
      return left !== right
    case LIKE:
      return `${left}`.includes(right)
    case LARGER:
      return left > right
    case LARGER_EQUAL:
      return left >= right
    case SMALLER:
      return left < right
    case SMALLER_EQUAL:
      return left <= right
    case PLUS:
      return _sum(left, right)
    case MINUS:
      return _minus(left, right)
    case NEGATION:
      return !left
    case DIVIDE:
      return _divide(left, right)
    case MULTIPLY:
      return _multiply(left, right)
    case REMAINDER:
      return left % right
  }
  /* c8 ignore next */
  return false // Should not get here, but for safety
}

function _sum(left, right) {
  if (typeof left !== NUMBER) return typeof right === NUMBER ? right : NaN
  if (typeof right !== NUMBER) return left

  return left + right
}

function _minus(left, right) {
  if (typeof left !== NUMBER) return typeof right === NUMBER ? -right : NaN
  if (typeof right !== NUMBER) return left

  return left - right
}

function _multiply(left, right) {
  if (typeof left !== NUMBER) return NaN
  if (typeof right !== NUMBER) return left

  return left * right
}

function _divide(left, right) {
  if (typeof left !== NUMBER) return NaN
  if (typeof right !== NUMBER) return left

  return left / right
}

function _getResultAny(left, operator, rights) {
  let right
  switch (operator) {
    case EQUAL:
      for (right of rights) if (left === right) return true
      return false
    case EXISTS:
      for (right of rights)
        if (right !== undefined && right !== null) return true
      return false
    case NOT_EQUAL:
      for (right of rights) if (left === right) return false
      return true
    case LIKE:
      for (right of rights) if (`${left}`.includes(right)) return true
      return false
    case LARGER:
      for (right of rights) if (left > right) return true
      return false
    case LARGER_EQUAL:
      for (right of rights) if (left >= right) return true
      return false
    case SMALLER:
      for (right of rights) if (left < right) return true
      return false
    case SMALLER_EQUAL:
      for (right of rights) if (left <= right) return true
      return false
    case PLUS:
      return rights.reduce((sum, right) => _sum(sum, right), left)
    case MINUS:
      return rights.reduce((sum, right) => _minus(sum, right), left)
    case MULTIPLY:
      return rights.reduce((sum, right) => _multiply(sum, right), left)
    case DIVIDE:
      return rights.reduce((sum, right) => _divide(sum, right), left)
  }
  /* c8 ignore next */
  return false // Should not get here, but for safety
}

export function calculateList(list, data) {
  const parsedList = []

  for (let i = 0; i < list.length; i++) {
    if (!Array.isArray(list[i])) {
      parsedList.push(list[i])
      continue
    }

    if (list[i][0] !== ARRAY_SPREAD) {
      parsedList.push(get(data, list[i]))
      continue
    }

    const value = get(data, list[i][1])
    if (Array.isArray(value)) parsedList.push(...value)
    else parsedList.push(value)
  }

  return parsedList
}
