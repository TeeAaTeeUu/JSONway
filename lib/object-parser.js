import { EMPTY, STRING } from './_types.js'
import { ARRAY_START, ARRAY_END } from './array-parser.js'
import { EXPRESSION_END, EXPRESSION_START } from './expression-parser.js'
import { parse, _safe } from './parser.js'
import {
  cast,
  isEscaped,
  unscape,
  SINGLE_QUOTE,
  DOUBLE_QUOTE,
} from './value-parser.js'

export const OBJECT_UN_FLAT = '{:}'
export const MULTI = '{}'
export const OBJECT_START = '{'
export const OBJECT_END = '}'
const COLON = ':'
const SEMICOLON = ';'
const COMMA = ','
const EQUAL_SIGN = '='
const PIPE = '|'
const QUESTIONMARK = '?'

export function parseObject(path, startIndex) {
  const len = path.length
  let token = path[startIndex]

  if (startIndex >= len) return [[MULTI, []], startIndex]
  if (
    token === COLON &&
    (path[startIndex + 1] === OBJECT_END || startIndex + 1 >= len)
  )
    return [[OBJECT_UN_FLAT, true], startIndex + 1]

  let i = startIndex
  let depth = 1
  let arrayDepth = 0
  let expressionDepth = 0
  let singleEscaped = false
  let doubleEscaped = false

  let start = startIndex
  let current = _getBaseCurrent()
  let items = [current]

  for (; i < len; i++) {
    token = path[i]

    if (token === SINGLE_QUOTE && !doubleEscaped) singleEscaped = !singleEscaped
    else if (token === DOUBLE_QUOTE && !singleEscaped)
      doubleEscaped = !doubleEscaped
    else if (singleEscaped || doubleEscaped) continue

    if (token === OBJECT_START) depth++
    else if (token === OBJECT_END) {
      if (--depth === 0) {
        _finalize(path, current, start, i)
        if (current[0] === EMPTY) items.pop()
        start = i + 1
        break
      }
    } else if (token === ARRAY_START) arrayDepth++
    else if (token === ARRAY_END) {
      if (arrayDepth > 0) arrayDepth--
    } else if (token === EXPRESSION_START) expressionDepth++
    else if (token === EXPRESSION_END) {
      if (expressionDepth > 0) expressionDepth--
    } else if (depth === 1 && arrayDepth === 0 && expressionDepth === 0) {
      if (token === COMMA || token === SEMICOLON) {
        _finalize(path, current, start, i)
        start = i + 1
        if (current[0] === EMPTY) items.pop()
        current = _getBaseCurrent()
        items.push(current)
      } else if (token === COLON) {
        current[0] = _unescape(path.slice(start, i).trim())
        start = i + 1
      } else if (_isStartOfDefault(token)) {
        current[1] = cast(path.slice(start, i))
        if (_isStartOfDefault(path[i + 1])) i++
        start = i + 1
      }
    }
  }

  if (start < i) {
    _finalize(path, current, start, i)
    if (current[0] === EMPTY) items.pop()
  }

  for (let j = 0; j < items.length; j++)
    if (_isPath(items[j][1])) items[j][1] = parse(items[j][1])
    else items[j][1] = [true, _unescape(items[j][1])]

  return [[MULTI, items], i]
}

function _getBaseCurrent() {
  return [undefined, undefined, undefined, [false]]
}

function _isStartOfDefault(token) {
  switch (token) {
    case EQUAL_SIGN:
    case PIPE:
    case QUESTIONMARK:
      return true
    default:
      return false
  }
}

function _finalize(path, current, start, i) {
  if (current[1]) current[2] = _unescape(cast(path.slice(start, i)))
  else current[1] = cast(path.slice(start, i))

  if (!current[0]) current[0] = _unescape(current[1])
  else current[3][0] = true
}

function _unescape(value) {
  if (!isEscaped(value)) return _safe(value)
  return unscape(value)
}

function _isPath(value) {
  return (
    typeof value === STRING &&
    value[0] !== SINGLE_QUOTE &&
    value[0] !== DOUBLE_QUOTE
  )
}
