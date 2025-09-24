import { parseExpression } from './expression-parser.js'
import { get } from './getter.js'
import { MAX_DEPTH } from './tabletizer.js'

export function calculateExpression(expression, values, data) {
  const parsedExpression = Array.isArray(expression)
    ? expression
    : parseExpression(expression)[0]

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
      case '=':
      case '?':
      case '!=':
      case '~=':
      case '>':
      case '>=':
      case '<':
      case '<=':
      case '+':
      case '-':
      case '/':
      case '*':
      case '%':
        if (delayedOperator && rightExists) {
          leftResult = _getCleanedResult(leftResult, delayedOperator, right)
          leftResultExists = true
          operator = token
          delayedOperator = null
          rightExists = null
          break
        }
        if (!leftExists && !rightExists && !leftResultExists) {
          delayedOperator = token
          operator = null
          break
        }
        operator = token
        break
      case '&&':
        if (!leftExists && !rightExists && !leftResult) return false
        if (leftExists && !rightExists && !left) return false
        leftResult = null
        break
      case '||':
        if (leftResult && !leftExists && !rightExists) return leftResult
        if (leftExists && !rightExists && left) return left
        leftResult = null
        break
      case '?|':
        if (leftResult !== undefined && !leftExists && !rightExists)
          return leftResult
        if (leftExists && !rightExists && left !== undefined) return left
        leftResult = undefined
        break
      case '!':
        prefixOperator = token
        break
      case '$':
        if (operator) {
          rightExists = true
          right = values
        } else {
          leftExists = true
          left = values
        }
        break
      case '(':
        i++
        if (operator) {
          rightExists = true
          right = calculateExpression(parsedExpression[i], values, data)
        } else {
          leftExists = true
          left = calculateExpression(parsedExpression[i], values, data)
        }
        break
      case '[':
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
        // TODO: if (typeof token === 'object') {}
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
      (rightExists || operator === '?')
    ) {
      if (Array.isArray(right))
        leftResult = _getCleanedResultAny(
          leftResultExists ? leftResult : left,
          operator,
          right,
        )
      else {
        leftResult = _getCleanedResult(
          leftResultExists ? leftResult : left,
          operator,
          right,
        )
      }

      leftResultExists = true
      leftExists = false
      left = null
      operator = null
      rightExists = false
      right = null
    }
  }

  if (delayedOperator) {
    if (leftExists)
      return _getCleanedResult(leftResult, _swapOperator(delayedOperator), left)

    if (rightExists)
      return _getCleanedResult(right, _swapOperator(delayedOperator), data)

    return _getCleanedResult(data, delayedOperator, false)
  }

  if (leftExists) return left

  return leftResult
}

function _swapOperator(operator) {
  switch (operator) {
    case '>':
      return '<'
    case '>=':
      return '<='
    case '<':
      return '>'
    case '<=':
      return '>='
  }

  return operator
}

function _getCleanedResult(lefts, operator, right) {
  let result = false

  for (const left of Array.isArray(lefts) ? lefts.flat(MAX_DEPTH) : [lefts]) {
    result = _getResult(left, operator, right)
    if (result === true || Number.isFinite(result)) return result
  }

  if (Number.isNaN(result)) return null
  return result
}

function _getCleanedResultAny(lefts, operator, right) {
  let result = false

  for (const left of Array.isArray(lefts) ? lefts.flat(MAX_DEPTH) : [lefts]) {
    result = _getResultAny(left, operator, right)
    if (result === true || Number.isFinite(result)) return result
  }

  if (Number.isNaN(result)) return null
  return result
}

function _getResult(left, operator, right) {
  switch (operator) {
    case '=':
      return left === right
    case '?':
      return left !== undefined && left !== null
    case '!=':
      return left !== right
    case '~=':
      return `${left}`.includes(right)
    case '>':
      return left > right
    case '>=':
      return left >= right
    case '<':
      return left < right
    case '<=':
      return left <= right
    case '+':
      return _sum(left, right)
    case '-':
      return _minus(left, right)
    case '!':
      return !left
    case '/':
      return left / right
    case '*':
      return left * right
    case '%':
      return left % right
  }

  return false // Should not get here, but for safety
}

function _sum(left, right) {
  if (typeof left === 'string' || typeof right === 'string')
    return (!left ? '' : left) + (!right ? '' : right)

  if (left === undefined || right === undefined)
    return (!left ? null : left) + (!right ? null : right)

  return left + right
}

function _minus(left, right) {
  if (typeof left === 'string' || typeof right === 'string') return NaN

  if (left === undefined || right === undefined)
    return (!left ? null : left) - (!right ? null : right)

  return left - right
}

function _getResultAny(left, operator, rights) {
  let right
  switch (operator) {
    case '=':
      for (right of rights) if (left === right) return true
      return false
    case '!=':
      for (right of rights) if (left === right) return false
      return true
    case '~=':
      for (right of rights) if (`${left}`.includes(right)) return true
      return false
    case '>':
      for (right of rights) if (left > right) return true
      return false
    case '>=':
      for (right of rights) if (left >= right) return true
      return false
    case '<':
      for (right of rights) if (left < right) return true
      return false
    case '<=':
      for (right of rights) if (left <= right) return true
      return false
    case '+':
      return rights.reduce((sum, right) => _sum(sum, right), left)
    case '-':
      return rights.reduce((sum, right) => _minus(sum, right), left)
    case '*':
      return rights.reduce((sum, right) => sum * right, left)
    case '/':
      return rights.reduce((sum, right) => sum / right, left)
  }

  return false // Should not get here, but for safety
}

export function calculateList(list, data) {
  return list.map(item => (Array.isArray(item) ? get(data, item) : item))
}
