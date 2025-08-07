import { cast } from './value-parser.js'
import { parseExpression } from './expression-parser.js'
import tabletizer from './tabletizer.js'

export const ARRAY_ALL = '%[]%'
export const ARRAY_UN_FLAT = '%[:]%'
export const ARRAY_INDEXES = '%[_,]%'
export const ARRAY_ADD = '%[+]%'
export const ARRAY_FOREACH = '%[*]%'
export const ARRAY_UNIQUE = '%[#]%'
// TODO: export const ARRAY_FOREACH_UNIQUE = '%[*#]%'
export const ARRAY_UN_FLAT_UNIQUE = '%[:#]%'
export const OBJECT_UN_FLAT = '%{:}%'
const isInt = /^(-|\+)?([0-9]+)$/
const isIntList = /^\d+,\d+[\d,]*$/

const BLOCKED_PROTO_PROPERTIES = new Set([
  'constructor',
  '__proto__',
  '__defineGetter__',
  '__defineSetter__',
  'prototype',
])

export function parse(path, multi = false, deep = null) {
  if (Number.isInteger(path)) return [path]

  let current = ''
  let isKey = false
  let isArrayAccess = false
  let isEscaped = false
  let isDefault = false
  let isTabletize = false
  const parsedPath = []
  let multiBack = []
  let multiPath = ''
  let currentDeep = deep || 0
  let deepestDeep = currentDeep

  for (let i = 0, len = path.length; i < len; i++) {
    if (
      (isArrayAccess || (multi && parsedPath.length === 0)) &&
      path[i] === "'"
    ) {
      if (isEscaped && path[i + 1] === "'") {
        current += path[i + 1]
        i++
        continue
      }
      isEscaped = !isEscaped
      continue
    }

    // tabletize
    if (
      isArrayAccess &&
      !isEscaped &&
      path[i] === '{' &&
      current.trim() === ''
    ) {
      /* empty */
    } else if (multi && isEscaped && parsedPath.length === 0) {
      current += path[i]
      continue
    } else if (isArrayAccess && (isEscaped || path[i] !== ']')) {
      isKey = true
      current += path[i]
      continue
    }
    if (isDefault && !",}'".includes(path[i])) {
      current += path[i]
      continue
    }

    switch (path[i]) {
      case '.':
        if (isKey && current) _safePush(parsedPath, current)
        current = ''
        isKey = false
        continue
      case '[':
        if (current) _safePush(parsedPath, current)
        current = ''
        isKey = false
        isArrayAccess = true
        continue
      case ']':
        if (isInt.test(current)) {
          parsedPath.push(parseInt(current, 10))
        } else if (current === '+') {
          parsedPath.push(true, ARRAY_ADD)
          currentDeep++
        } else if (current === '*') {
          parsedPath.push(true, ARRAY_FOREACH)
          currentDeep++
        } else if (current === ':') {
          parsedPath.push(true, ARRAY_UN_FLAT)
          currentDeep++
        } else if (current === '#') {
          parsedPath.push(true, ARRAY_UNIQUE)
          currentDeep++
        } else if (current === ':#' || current === '#:') {
          parsedPath.push(true, ARRAY_UN_FLAT_UNIQUE)
          currentDeep++
        } else if (isIntList.test(current)) {
          parsedPath.push(
            true,
            ARRAY_INDEXES,
            current.split(',').map(x => parseInt(x.trim(), 10)),
          )
          currentDeep++
        } else if (isKey) {
          _safePush(parsedPath, current, false)
        } else {
          parsedPath.push(true, ARRAY_ALL)
          currentDeep++
        }
        current = ''
        isKey = false
        isArrayAccess = false
        continue
      case '{':
        if (isArrayAccess && current.trim() === '') isTabletize = true
        else if (isKey && current) {
          _safePush(parsedPath, current)
          isTabletize = false
        }
        if (path.slice(i, i + 3) === '{:}') {
          parsedPath.push(true, OBJECT_UN_FLAT)
          current = ''
          isTabletize = false
          i += 2
          continue
        }

        isKey = false
        isArrayAccess = false

        current = [[], [], [], []]
        i++
        do {
          multiBack = parse(path.slice(i), true, currentDeep + 1)
          if (multiBack[0].length !== 0) {
            current[0].push(multiBack[3])
            current[1].push(multiBack[0])
            current[2].push(multiBack[5])
            current[3].push(multiBack[6])
          }
          i += multiBack[1] + 1
          if (multiBack[4] > deepestDeep) deepestDeep = multiBack[4]
        } while (multiBack[2])
        currentDeep = deepestDeep

        if (current[2].every(value => value === undefined))
          current[2] = undefined

        if (isTabletize) current = tabletizer.parsePathNamesAndSort(current)
        else current[3] = undefined

        current = current.filter(x => x !== undefined)

        parsedPath.push(isTabletize ? { table: current } : { multi: current })
        if (multi) {
          return [
            parsedPath,
            i,
            path[i] === ',',
            multiPath || _safe(path.slice(0, i)),
            currentDeep,
            undefined,
            !!multiPath,
          ]
        }
        current = ''
        i--
        continue
      case ',':
        if (current && !isDefault) {
          _safePush(parsedPath, current)
          current = undefined
        } else if (!current && !isDefault) {
          current = undefined
        }
        return [
          parsedPath,
          i,
          true,
          multiPath || _safe(path.slice(0, i)),
          currentDeep,
          _safe(cast(current)),
          !!multiPath,
        ]
      case ':':
        if (!multi || multiPath) break
        multiPath = _safe(current)
        current = ''
        continue
      case '}':
        if (!multi) continue
        if (current && !isDefault) {
          _safePush(parsedPath, current)
          current = undefined
        } else if (!current && !isDefault) {
          current = undefined
        }

        while (path[i + 1] && path[i + 1].trim() === '') i++
        if (path[i + 1] === ']') isTabletize = true

        return [
          parsedPath,
          i + (isTabletize ? 2 : 0),
          false,
          multiPath || _safe(path.slice(0, i)),
          currentDeep,
          _safe(cast(current)),
          !!multiPath,
        ]
      case '(': // TODO: add function support like count(_) or .length or pipe || size
        if (current) _safePush(parsedPath, current)
        current = ''
        i++
        multiBack = parseExpression(path, i)
        parsedPath.push({ rule: multiBack[0] })
        i = multiBack[1]
        continue
      case '=':
        if (!multi) break
        if (current) _safePush(parsedPath, current)
        current = ''
        isDefault = true
        continue
    }

    isKey = true
    current += path[i]
  }

  if (current) _safePush(parsedPath, cast(current))

  return parsedPath
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

  parsedPath.push(safeValue)
}

export function isNestedArray(token) {
  switch (token) {
    case ARRAY_INDEXES:
    case ARRAY_UN_FLAT:
    case ARRAY_UN_FLAT_UNIQUE:
    case ARRAY_ALL:
    case ARRAY_UNIQUE:
    case ARRAY_FOREACH:
      return true
    default:
      if (Number.isInteger(token)) return true
      return false
  }
}

export default {
  parse,
  _safe,
  _safeCheck,
  isNestedArray,
  ARRAY_ALL,
  ARRAY_UN_FLAT,
  ARRAY_INDEXES,
  ARRAY_ADD,
  ARRAY_FOREACH,
  ARRAY_UNIQUE,
  ARRAY_UN_FLAT_UNIQUE,
  OBJECT_UN_FLAT,
  isInt,
}
