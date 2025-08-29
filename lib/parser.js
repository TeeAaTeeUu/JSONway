import { cast } from './value-parser.js'
import { parseExpression } from './expression-parser.js'
import tabletizer from './tabletizer.js'
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

function _getCtx(path, multi) {
  const parsedPath = []
  return {
    path,
    len: path.length,
    i: 0,
    current: '',
    isKey: false,
    isArrayAccess: false,
    isEscaped: false,
    wasEscaped: false,
    isDefault: false,
    isTabletize: false,
    parsedPath,
    origParsedPath: parsedPath,
    multi,
    multiBack: [],
    multiPath: '',
  }
}

export function parse(path, multi = false) {
  const ctx = _getCtx(path, multi)

  for (; ctx.i < ctx.len; ctx.i++) {
    if (_IsEscapedArrayAccess(ctx)) {
      _handleEscapedArrayAccess(ctx)
      continue
    }

    if (_isTabletize(ctx)) {
      /* empty */
    } else if (_IsArrayAccess(ctx)) {
      _handleArrayAccess(ctx)
      continue
    }

    switch (ctx.path[ctx.i]) {
      case '.':
        _handleDot(ctx)
        continue
      case '[':
        _handleOpenArrayAccess(ctx)
        continue
      case '{':
        _handleOpeningObject(ctx)
        if (ctx.multi) return _getOpeningObjectMulti(ctx)
        continue
      case ',':
        _handleComma(ctx)
        return _getComma(ctx)
      case ':':
        _handleColon(ctx)
        continue
      case '}':
        if (!ctx.multi) continue
        return _getClosingObject(ctx)
      case '(': // TODO: add function support like count(_) or .length or pipe || size
        _handleOpenParenthesis(ctx)
        continue
      case '=':
        _handleEqual(ctx)
        continue
    }

    _handleKey(ctx)
  }

  if (ctx.current) _handleLastKey(ctx)

  return ctx.origParsedPath
}

function _isTabletize(ctx) {
  return (
    ctx.isArrayAccess &&
    !ctx.isEscaped &&
    ctx.path[ctx.i] === '{' &&
    ctx.current.trim() === ''
  )
}

function _IsEscapedArrayAccess(ctx) {
  return (
    ctx.path[ctx.i] === "'" &&
    (ctx.isArrayAccess || (ctx.multi && ctx.parsedPath.length === 0))
  )
}

function _handleEscapedArrayAccess(ctx) {
  if (ctx.isEscaped && ctx.path[ctx.i + 1] === "'") {
    ctx.current += ctx.path[ctx.i + 1]
    ctx.i++
    return
  }

  ctx.isEscaped = !ctx.isEscaped
  ctx.wasEscaped = true
}

function _IsArrayAccess(ctx) {
  return (
    (ctx.isArrayAccess && (ctx.isEscaped || ctx.path[ctx.i] !== ']')) ||
    (ctx.multi && ctx.isEscaped)
  )
}

function _handleArrayAccess(ctx) {
  ctx.isKey = true
  ctx.current += ctx.path[ctx.i]
}

function _handleDot(ctx) {
  if (ctx.current) _safePush(ctx.parsedPath, ctx.current)
  ctx.current = ''
  ctx.isKey = false
}

function _handleOpenArrayAccess(ctx) {
  if (ctx.current) _safePush(ctx.parsedPath, ctx.current)
  ctx.current = ''
  ctx.isKey = false
  ctx.i++

  while (ctx.path[ctx.i].trim() === '') ctx.i++
  // TODO: support tabletize
  if (ctx.path[ctx.i] === '{') {
    ctx.isArrayAccess = true
    ctx.i--
    return
  }

  const returnable = parseArray(ctx.path, ctx.i)

  ctx.i = returnable[1]
  ctx.parsedPath.push(...returnable[0])
  if (Array.isArray(ctx.parsedPath.at(-1)))
    ctx.parsedPath = ctx.parsedPath.at(-1)
}

function _handleOpeningObject(ctx) {
  if (ctx.isArrayAccess) ctx.isTabletize = true
  else if (ctx.current) {
    _safePush(ctx.parsedPath, ctx.current)
    ctx.isTabletize = false
  }

  // TODO: support tabletize
  if (!ctx.isTabletize) {
    const returnable = parseObject(ctx.path, ++ctx.i)

    ctx.parsedPath.push(...returnable[0])
    ctx.i = returnable[1]

    ctx.isKey = false
    ctx.isArrayAccess = false
    ctx.current = ''

    return
  }

  if (ctx.path.slice(ctx.i, ctx.i + 3) === '{:}') {
    ctx.parsedPath.push(OBJECT_UN_FLAT, true)
    ctx.current = ''
    ctx.isTabletize = false
    ctx.i += 2
    return
  }

  ctx.isKey = false
  ctx.isArrayAccess = false
  ctx.current = ''

  let multi = [[], [], [], []]
  ctx.i++
  do {
    ctx.multiBack = parse(ctx.path.slice(ctx.i), true)
    if (ctx.multiBack[0].length !== 0) {
      multi[0].push(ctx.multiBack[3])
      multi[1].push(ctx.multiBack[0])
      multi[2].push(ctx.multiBack[4])
      multi[3].push(ctx.multiBack[5])
    }
    ctx.i += ctx.multiBack[1] + 1
  } while (ctx.multiBack[2])

  if (multi[2].every(value => value === '')) multi[2] = undefined
  else multi[2] = multi[2].map(value => (value === '' ? undefined : value))

  if (ctx.isTabletize) multi = tabletizer.parsePathNamesAndSort(multi)
  else multi[3] = undefined

  multi = multi.filter(x => x !== undefined)

  if (ctx.isTabletize) ctx.parsedPath.push(TABLE, multi)
  else ctx.parsedPath.push(MULTI, multi)

  if (!ctx.multi) ctx.i--
}

function _getOpeningObjectMulti(ctx) {
  return [
    ctx.origParsedPath,
    ctx.i,
    ctx.path[ctx.i] === ',',
    ctx.multiPath || _safe(ctx.path.slice(0, ctx.i)),
    '',
    !!ctx.multiPath,
  ]
}

function _handleComma(ctx) {
  if (!ctx.isDefault) {
    if (ctx.current) _safePush(ctx.parsedPath, ctx.current)

    ctx.current = ''
  }
}

function _getComma(ctx) {
  return [
    ctx.origParsedPath,
    ctx.i,
    true,
    ctx.multiPath || _safe(ctx.path.slice(0, ctx.i)),
    cast(_safe(ctx.current)),
    !!ctx.multiPath,
  ]
}

function _handleColon(ctx) {
  ctx.multiPath = _safe(ctx.current)
  ctx.current = ''
}

function _getClosingObject(ctx) {
  if (ctx.current && !ctx.isDefault) {
    _safePush(ctx.parsedPath, ctx.current)
    ctx.current = ''
  }

  while (ctx.path[ctx.i + 1] && ctx.path[ctx.i + 1].trim() === '') ctx.i++
  if (ctx.path[ctx.i + 1] === ']') ctx.isTabletize = true

  return [
    ctx.origParsedPath,
    ctx.i + (ctx.isTabletize ? 2 : 0),
    false,
    ctx.multiPath || _safe(ctx.path.slice(0, ctx.i)),
    cast(_safe(ctx.current)),
    !!ctx.multiPath,
  ]
}

function _handleOpenParenthesis(ctx) {
  if (ctx.current) _safePush(ctx.parsedPath, ctx.current)

  ctx.current = ''
  ctx.i++
  ctx.multiBack = parseExpression(ctx.path, ctx.i)

  ctx.parsedPath.push(RULE, ctx.multiBack[0])
  ctx.i = ctx.multiBack[1]
}

function _handleEqual(ctx) {
  if (ctx.current) _safePush(ctx.parsedPath, ctx.current)

  ctx.current = ''
  ctx.isDefault = true
}

function _handleKey(ctx) {
  ctx.isKey = true
  ctx.current += ctx.path[ctx.i]
}

function _handleLastKey(ctx) {
  const value = cast(ctx.current)

  if (typeof value !== 'number') _safePush(ctx.parsedPath, value)
  else if (value >= 0) ctx.parsedPath.push(ARRAY_INDEX, value)
  else ctx.parsedPath.push(ARRAY_INDEX_NEGATIVE, value)
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
