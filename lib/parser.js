import { cast } from './value-parser.js'
import { parseExpression } from './expression-parser.js'
import { parseArray } from './array-parser.js'
import { parseObject } from './object-parser.js'

export const ARRAY_INDEX = '1'
export const ARRAY_INDEX_NEGATIVE = '-1'

export const OBJECT_PROPERTY = '.'

export const MULTI = '{}'
export const TABLE = '[{}]'
export const RULE = '()'

export const ARRAY_ALL = '[]'
export const ARRAY_UN_FLAT = '[:]'
export const ARRAY_INDEXES = '[_,]'
export const ARRAY_REPLACE = '[=]'
export const ARRAY_FOREACH = '[*]'
export const ARRAY_UNIQUE = '[#]'
// TODO: export const ARRAY_FOREACH_UNIQUE = '[*#]'
export const ARRAY_UN_FLAT_UNIQUE = '[:#]'
export const OBJECT_UN_FLAT = '{:}'
const isInt = /^(-|\+)?([0-9]+)$/

const BLOCKED_PROTO_PROPERTIES = new Set([
  'constructor',
  '__proto__',
  '__defineGetter__',
  '__defineSetter__',
  'prototype',
])

export function parse(path) {
  const len = path.length
  let current = ''
  let parsedPath = []
  const origParsedPath = parsedPath
  let multiBack = []

  for (let i = 0; i < len; i++) {
    switch (path[i]) {
      case '.':
      case '[':
      case '{':
      case '(':
        if (current) {
          _safePush(parsedPath, current)
          current = ''
        }

        switch (path[i]) {
          case '.':
            continue
          case '[':
            multiBack = parseArray(path, ++i)
            i = multiBack[1]
            parsedPath.push(...multiBack[0])

            if (Array.isArray(parsedPath.at(-1)))
              if (parsedPath.at(-2) !== TABLE) parsedPath = parsedPath.at(-1)
            continue
          case '{':
            multiBack = parseObject(path, ++i)
            parsedPath.push(...multiBack[0])
            i = multiBack[1]
            continue
          case '(': // TODO: add function support like count(_) or .length or pipe || size
            multiBack = parseExpression(path, ++i)
            parsedPath.push(RULE, multiBack[0])
            i = multiBack[1]
            continue
        }
        continue
      default:
        current += path[i]
        continue
    }
  }

  if (current) {
    const value = cast(current)

    if (typeof value !== 'number') _safePush(parsedPath, value)
    else if (value >= 0) parsedPath.push(ARRAY_INDEX, value)
    else parsedPath.push(ARRAY_INDEX_NEGATIVE, value)
  }

  return origParsedPath
}

export function _safeCheck(value) {
  if (BLOCKED_PROTO_PROPERTIES.has(value))
    throw new Error('Attempted prototype pollution disallowed.')
}

export function _safe(value, trim = true) {
  _safeCheck(value)
  if (trim && typeof value === 'string') return value.trim()
  return value
}

export function _safePush(parsedPath, value, trim = true) {
  const safeValue = _safe(value, trim)
  if (safeValue === '') return

  parsedPath.push(OBJECT_PROPERTY, safeValue)
}

export function isNestedArray(token) {
  switch (token) {
    case ARRAY_FOREACH:
    case ARRAY_ALL:
    case ARRAY_INDEXES:
    case ARRAY_UN_FLAT:
    case ARRAY_UN_FLAT_UNIQUE:
    case ARRAY_UNIQUE:
    case ARRAY_INDEX:
    case ARRAY_INDEX_NEGATIVE:
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

export default {
  parse,
  _safe,
  _safeCheck,
  isNestedArray,
  isSubArray,
  ARRAY_REPLACE,
  ARRAY_ALL,
  ARRAY_FOREACH,
  ARRAY_INDEX_NEGATIVE,
  ARRAY_INDEX,
  ARRAY_INDEXES,
  ARRAY_UN_FLAT_UNIQUE,
  ARRAY_UN_FLAT,
  ARRAY_UNIQUE,
  MULTI,
  OBJECT_PROPERTY,
  OBJECT_UN_FLAT,
  RULE,
  isInt,
}
