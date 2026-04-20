import { EMPTY, NUMBER, STRING } from './_types.js'
import { EXPRESSION_END, EXPRESSION_START } from './expression-parser.js'
import { parseFunction } from './function-processor.js'
import { OBJECT_END, OBJECT_START } from './object-parser.js'
import { OBJECT_PROPERTY, parse, _safe } from './parser.js'
import { TABLE, isTable, parseTable } from './table-parser.js'
import {
  SINGLE_QUOTE,
  DOUBLE_QUOTE,
  cast,
  isEscaped,
  unscape,
} from './value-parser.js'

const ARRAY_SPREAD_SYNTAX = '...'

export const ARRAY_INDEX = '1'
export const ARRAY_INDEX_NEGATIVE = '-1'

export const DEEP_OBJECT_PROPERTY = '[**]'

export const ARRAY_ALL = '[]'
export const ARRAY_FOREACH = '[*]'
export const ARRAY_UN_FLAT = '[:]'
export const ARRAY_INDEXES = '[_,]'
export const ARRAY_REPLACE = '[=]'
export const ARRAY_UNIQUE = '[#]'
export const ARRAY_FOREACH_UNIQUE = '[*#]'
export const ARRAY_UN_FLAT_UNIQUE = '[:#]'
export const ARRAY_SPREAD = '[.]'
export const ARRAY_LIST = '[,]'
export const ARRAY_SLICE = '[_:]'

export const ARRAY_START = '['
export const ARRAY_END = ']'
export const COMMA = ','
const SEMICOLON = ';'
const PIPE = '|'
const EQUAL_SIGN = '='
const LARGER_THAN = '>'
const ASTERISK = '*'
const COLON = ':'
const HASH_SIGN = '#'
const COLON_HASH = ':#'
const HASH_COLON = '#:'
const ASTERISK_HASH = '*#'
const HASH_ASTERISK = '#*'
const ASTERISK_ASTERISK = '**'

export function parseArray(path, startIndex) {
  const len = path.length
  let token = path[startIndex]

  if (token === ARRAY_END || startIndex >= len)
    return [[ARRAY_ALL, []], startIndex]

  let i = startIndex
  let depth = 1
  let objectDepth = 0
  let expressionDepth = 0
  let singleEscaped = false
  let doubleEscaped = false

  let current = EMPTY
  let currentPrePipe = EMPTY
  let pipe = EMPTY
  let pipeStart = -1
  let start = startIndex
  let items = []

  for (; i < len; i++) {
    token = path[i]

    if (token === SINGLE_QUOTE && !doubleEscaped) singleEscaped = !singleEscaped
    else if (token === DOUBLE_QUOTE && !singleEscaped)
      doubleEscaped = !doubleEscaped
    else if (singleEscaped || doubleEscaped) continue

    if (token === ARRAY_START) depth++
    else if (token === ARRAY_END) {
      if (--depth === 0) {
        if (pipeStart !== -1 && items.length === 0) {
          currentPrePipe = path.slice(start, pipeStart - 2).trim()
          pipe = path.slice(pipeStart, i)
        }
        current = path.slice(start, i)
        if (current.trim() !== EMPTY) items.push(current)
        start = i + 1
        break
      }
    } else if (token === OBJECT_START) objectDepth++
    else if (token === OBJECT_END) {
      if (objectDepth > 0) objectDepth--
    } else if (token === EXPRESSION_START) expressionDepth++
    else if (token === EXPRESSION_END) {
      if (expressionDepth > 0) expressionDepth--
    } else if (depth === 1 && objectDepth === 0 && expressionDepth === 0) {
      if (items.length === 0)
        if (token === PIPE || token === EQUAL_SIGN)
          if (path[i + 1] === LARGER_THAN) pipeStart = ++i + 1
          else if (token === PIPE) pipeStart = ++i

      if (token === COMMA || token === SEMICOLON) {
        current = path.slice(start, i)
        if (current.trim() !== EMPTY) items.push(current)
        start = i + 1
      }
    }
  }

  if (start < i) {
    if (pipeStart !== -1 && items.length === 0) {
      currentPrePipe = path.slice(start, pipeStart - 2).trim()
      pipe = path.slice(pipeStart, i)
    }
    current = path.slice(start, i)
    if (current.trim() !== EMPTY) items.push(current)
  }

  if (items.length === 0) return [[ARRAY_ALL, []], i]
  else if (items.length === 1) {
    if (pipe !== EMPTY) {
      if (currentPrePipe === EMPTY)
        return [[ARRAY_ALL, [], [true, parseFunction(pipe)]], i]
      return [
        _getSingleArrayAccessWithPipe(
          _safe(items[0]),
          _safe(currentPrePipe),
          parseFunction(pipe),
        ),
        i,
      ]
    }

    return [_getSingleArrayAccess(_safe(items[0])), i]
  }

  return [_parseList(items), i]
}

function _parseList(items) {
  let allIntegers = true

  for (let j = 0; j < items.length; j++) {
    const value = cast(items[j])
    if (_isPath(value)) {
      if (_isArraySpread(value)) {
        items[j] = [ARRAY_SPREAD, parse(value.slice(3))]
      } else {
        items[j] = parse(value)
      }
    } else if (typeof value === STRING && isEscaped(value)) {
      items[j] = unscape(value)
    } else {
      items[j] = value
      if (typeof value === NUMBER) continue
    }

    allIntegers = false
  }

  if (allIntegers) return [ARRAY_INDEXES, [items]]

  return [ARRAY_LIST, [items]]
}

function _isPath(value) {
  return (
    typeof value === STRING &&
    value[0] !== SINGLE_QUOTE &&
    value[0] !== DOUBLE_QUOTE
  )
}

function _isArraySpread(path) {
  return path[0] === OBJECT_PROPERTY && path.slice(0, 3) === ARRAY_SPREAD_SYNTAX
}

function _getSingleArrayAccessWithPipe(value, valuePrePipe, pipe) {
  const singleArrayAccess = _getSingleArrayAccess(valuePrePipe)

  switch (singleArrayAccess[0]) {
    case OBJECT_PROPERTY:
    case ARRAY_INDEX:
    case ARRAY_INDEX_NEGATIVE:
    case TABLE:
      return _getSingleArrayAccess(value)
  }

  singleArrayAccess.push([true, pipe])
  return singleArrayAccess
}

function _getSingleArrayAccess(value) {
  if (isEscaped(value)) return [OBJECT_PROPERTY, unscape(value)]

  const castValue = cast(value)

  // TODO: handle large string-numbers
  if (typeof castValue === NUMBER) return getArrayIndex(castValue)

  if (isTable(value)) return [TABLE, parseTable(value)]

  switch (value) {
    case EQUAL_SIGN:
      return [ARRAY_REPLACE, []]
    case ASTERISK:
      return [ARRAY_FOREACH, []]
    case COLON:
      return [ARRAY_UN_FLAT, []]
    case HASH_SIGN:
      return [ARRAY_UNIQUE, []]
    case COLON_HASH:
    case HASH_COLON:
      return [ARRAY_UN_FLAT_UNIQUE, []]
    case ASTERISK_HASH:
    case HASH_ASTERISK:
      return [ARRAY_FOREACH_UNIQUE, []]
    case ASTERISK_ASTERISK:
      return [DEEP_OBJECT_PROPERTY, []]
    default:
      if (_isPotentialSlice(value)) {
        const slice = _parseSlice(value)
        if (slice !== undefined) return [ARRAY_SLICE, [slice]]
      }
      return [OBJECT_PROPERTY, value]
  }
}

export function getArrayIndex(number) {
  if (number >= 0) return [ARRAY_INDEX, number]
  return [ARRAY_INDEX_NEGATIVE, number]
}

function _isPotentialSlice(value) {
  return value.length > 1 && value.indexOf(COLON) !== -1
}

function _parseSlice(value) {
  const numbers = value.split(COLON)
  if (numbers.length > 3) return

  const result = []

  for (let i = 0; i < numbers.length; i++) {
    const temp = cast(numbers[i])

    if (temp === EMPTY) result[i] = null
    else if (!Number.isInteger(temp)) return
    else result[i] = temp
  }

  while (result.at(-1) === null) result.pop()
  if (result[2] !== undefined && result[1] === null) result[1] = undefined

  return result
}

export function isNestedArray(token) {
  switch (token) {
    case ARRAY_FOREACH:
    case ARRAY_ALL:
    case ARRAY_INDEXES:
    case ARRAY_UN_FLAT:
    case ARRAY_UN_FLAT_UNIQUE:
    case ARRAY_FOREACH_UNIQUE:
    case ARRAY_UNIQUE:
    case ARRAY_INDEX:
    case ARRAY_INDEX_NEGATIVE:
    case ARRAY_REPLACE:
      return true
    default:
      return false
  }
}

// TODO: come up with a better way to traverse-through subArrays
export function isSubArray(token) {
  switch (token) {
    case ARRAY_FOREACH:
    case ARRAY_ALL:
    case ARRAY_INDEXES:
    case ARRAY_UN_FLAT:
    case ARRAY_UN_FLAT_UNIQUE:
    case ARRAY_UNIQUE:
      return true
    default:
      return false
  }
}
