import { OBJECT_PROPERTY, parse, _safe } from './parser.js'
import { TABLE, isTable, parseTable } from './table-parser.js'
import {
  cast,
  isEscaped,
  unscape,
  SINGLE_QUOTE,
  DOUBLE_QUOTE,
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

export function parseArray(path, startIndex) {
  const len = path.length
  let token = path[startIndex]

  if (token === ']' || startIndex >= len) return [[ARRAY_ALL, []], startIndex]

  let i = startIndex
  let depth = 1
  let objectDepth = 0
  let singleEscaped = false
  let doubleEscaped = false

  let current = 0
  let start = startIndex
  let items = []

  for (; i < len; i++) {
    token = path[i]

    if (token === SINGLE_QUOTE && !doubleEscaped) singleEscaped = !singleEscaped
    else if (token === DOUBLE_QUOTE && !singleEscaped)
      doubleEscaped = !doubleEscaped
    else if (singleEscaped || doubleEscaped) continue

    if (token === '[') depth++
    else if (token === ']') {
      if (--depth === 0) {
        current = path.slice(start, i)
        if (current.trim() !== '') items.push(current)
        start = i + 1
        break
      }
    } else if (token === '{') objectDepth++
    else if (token === '}') {
      if (objectDepth > 0) objectDepth--
    } else if (token === ',' && depth === 1 && objectDepth === 0) {
      current = path.slice(start, i)
      if (current.trim() !== '') items.push(current)
      start = i + 1
    }
  }

  if (start < i) {
    current = path.slice(start, i)
    if (current.trim() !== '') items.push(current)
  }
  if (items.length === 0) return [[ARRAY_ALL, []], i]

  if (items.length === 1) return [_getSingleArrayAccess(_safe(items[0])), i]
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
    } else if (typeof value === 'string' && isEscaped(value)) {
      items[j] = unscape(value)
    } else {
      items[j] = value
      if (typeof value === 'number') continue
    }

    allIntegers = false
  }

  if (allIntegers) return [ARRAY_INDEXES, [items]]

  return [ARRAY_LIST, [items]]
}

function _isPath(value) {
  return (
    typeof value === 'string' &&
    value[0] !== SINGLE_QUOTE &&
    value[0] !== DOUBLE_QUOTE
  )
}

function _isArraySpread(path) {
  return path[0] === OBJECT_PROPERTY && path.slice(0, 3) === ARRAY_SPREAD_SYNTAX
}

function _getSingleArrayAccess(value) {
  if (isEscaped(value)) return [OBJECT_PROPERTY, unscape(value)]

  const castValue = cast(value)

  // TODO: handle large string-numbers
  if (typeof castValue === 'number') {
    if (castValue >= 0) return [ARRAY_INDEX, castValue]
    else return [ARRAY_INDEX_NEGATIVE, castValue]
  }

  if (isTable(value)) return [TABLE, parseTable(value)]

  switch (value) {
    case '=':
      return [ARRAY_REPLACE, []]
    case '*':
      return [ARRAY_FOREACH, []]
    case ':':
      return [ARRAY_UN_FLAT, []]
    case '#':
      return [ARRAY_UNIQUE, []]
    case ':#':
    case '#:':
      return [ARRAY_UN_FLAT_UNIQUE, []]
    case '*#':
    case '#*':
      return [ARRAY_FOREACH_UNIQUE, []]
    case '**':
      return [DEEP_OBJECT_PROPERTY, true]
    default:
      if (_isPotentialSlice(value)) {
        const slice = _parseSlice(value)
        if (slice !== undefined) return [ARRAY_SLICE, [slice]]
      }
      return [OBJECT_PROPERTY, value]
  }
}

function _isPotentialSlice(value) {
  return value.length > 1 && value.indexOf(':') !== -1
}

function _parseSlice(value) {
  const numbers = value.split(':')
  if (numbers.length > 3) return

  const result = []

  for (let i = 0; i < numbers.length; i++) {
    const temp = cast(numbers[i])

    if (temp === '') result[i] = null
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
