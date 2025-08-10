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

function _getCtx(path, multi, deep) {
  return {
    path,
    i: 0,
    current: '',
    isKey: false,
    isArrayAccess: false,
    isEscaped: false,
    isDefault: false,
    isTabletize: false,
    parsedPath: [],
    multi,
    multiBack: [],
    multiPath: '',
    currentDeep: deep,
    deepestDeep: deep,
  }
}

export function parse(path, multi = false, deep = 0) {
  if (Number.isInteger(path)) return [path]

  const ctx = _getCtx(path, multi, deep)

  for (let len = ctx.path.length; ctx.i < len; ctx.i++) {
    if (
      (ctx.isArrayAccess || (ctx.multi && ctx.parsedPath.length === 0)) &&
      ctx.path[ctx.i] === "'"
    ) {
      if (ctx.isEscaped && ctx.path[ctx.i + 1] === "'") {
        ctx.current += ctx.path[ctx.i + 1]
        ctx.i++
        continue
      }
      ctx.isEscaped = !ctx.isEscaped
      continue
    }

    // tabletize
    if (
      ctx.isArrayAccess &&
      !ctx.isEscaped &&
      ctx.path[ctx.i] === '{' &&
      ctx.current.trim() === ''
    ) {
      /* empty */
    } else if (ctx.multi && ctx.isEscaped && ctx.parsedPath.length === 0) {
      ctx.current += ctx.path[ctx.i]
      continue
    } else if (
      ctx.isArrayAccess &&
      (ctx.isEscaped || ctx.path[ctx.i] !== ']')
    ) {
      ctx.isKey = true
      ctx.current += ctx.path[ctx.i]
      continue
    }
    if (ctx.isDefault && !",}'".includes(path[ctx.i])) {
      ctx.current += ctx.path[ctx.i]
      continue
    }

    switch (path[ctx.i]) {
      case '.':
        if (ctx.isKey && ctx.current) _safePush(ctx.parsedPath, ctx.current)
        ctx.current = ''
        ctx.isKey = false
        continue
      case '[':
        if (ctx.current) _safePush(ctx.parsedPath, ctx.current)
        ctx.current = ''
        ctx.isKey = false
        ctx.isArrayAccess = true
        continue
      case ']':
        if (isInt.test(ctx.current)) {
          ctx.parsedPath.push(parseInt(ctx.current, 10))
        } else if (ctx.current === '+') {
          ctx.parsedPath.push(true, ARRAY_ADD)
          ctx.currentDeep++
        } else if (ctx.current === '*') {
          ctx.parsedPath.push(true, ARRAY_FOREACH)
          ctx.currentDeep++
        } else if (ctx.current === ':') {
          ctx.parsedPath.push(true, ARRAY_UN_FLAT)
          ctx.currentDeep++
        } else if (ctx.current === '#') {
          ctx.parsedPath.push(true, ARRAY_UNIQUE)
          ctx.currentDeep++
        } else if (ctx.current === ':#' || ctx.current === '#:') {
          ctx.parsedPath.push(true, ARRAY_UN_FLAT_UNIQUE)
          ctx.currentDeep++
        } else if (isIntList.test(ctx.current)) {
          ctx.parsedPath.push(
            true,
            ARRAY_INDEXES,
            ctx.current.split(',').map(x => parseInt(x.trim(), 10)),
          )
          ctx.currentDeep++
        } else if (ctx.isKey) {
          _safePush(ctx.parsedPath, ctx.current, false)
        } else {
          ctx.parsedPath.push(true, ARRAY_ALL)
          ctx.currentDeep++
        }
        ctx.current = ''
        ctx.isKey = false
        ctx.isArrayAccess = false
        continue
      case '{':
        if (ctx.isArrayAccess && ctx.current.trim() === '')
          ctx.isTabletize = true
        else if (ctx.isKey && ctx.current) {
          _safePush(ctx.parsedPath, ctx.current)
          ctx.isTabletize = false
        }
        if (path.slice(ctx.i, ctx.i + 3) === '{:}') {
          ctx.parsedPath.push(true, OBJECT_UN_FLAT)
          ctx.current = ''
          ctx.isTabletize = false
          ctx.i += 2
          continue
        }

        ctx.isKey = false
        ctx.isArrayAccess = false

        ctx.current = [[], [], [], []]
        ctx.i++
        do {
          ctx.multiBack = parse(path.slice(ctx.i), true, ctx.currentDeep + 1)
          if (ctx.multiBack[0].length !== 0) {
            ctx.current[0].push(ctx.multiBack[3])
            ctx.current[1].push(ctx.multiBack[0])
            ctx.current[2].push(ctx.multiBack[5])
            ctx.current[3].push(ctx.multiBack[6])
          }
          ctx.i += ctx.multiBack[1] + 1
          if (ctx.multiBack[4] > ctx.deepestDeep)
            ctx.deepestDeep = ctx.multiBack[4]
        } while (ctx.multiBack[2])
        ctx.currentDeep = ctx.deepestDeep

        if (ctx.current[2].every(value => value === undefined))
          ctx.current[2] = undefined

        if (ctx.isTabletize)
          ctx.current = tabletizer.parsePathNamesAndSort(ctx.current)
        else ctx.current[3] = undefined

        ctx.current = ctx.current.filter(x => x !== undefined)

        ctx.parsedPath.push(
          ctx.isTabletize ? { table: ctx.current } : { multi: ctx.current },
        )
        if (multi) {
          return [
            ctx.parsedPath,
            ctx.i,
            ctx.path[ctx.i] === ',',
            ctx.multiPath || _safe(path.slice(0, ctx.i)),
            ctx.currentDeep,
            undefined,
            !!ctx.multiPath,
          ]
        }
        ctx.current = ''
        ctx.i--
        continue
      case ',':
        if (ctx.current && !ctx.isDefault) {
          _safePush(ctx.parsedPath, ctx.current)
          ctx.current = undefined
        } else if (!ctx.current && !ctx.isDefault) {
          ctx.current = undefined
        }
        return [
          ctx.parsedPath,
          ctx.i,
          true,
          ctx.multiPath || _safe(path.slice(0, ctx.i)),
          ctx.currentDeep,
          _safe(cast(ctx.current)),
          !!ctx.multiPath,
        ]
      case ':':
        if (!multi || ctx.multiPath) break
        ctx.multiPath = _safe(ctx.current)
        ctx.current = ''
        continue
      case '}':
        if (!multi) continue
        if (ctx.current && !ctx.isDefault) {
          _safePush(ctx.parsedPath, ctx.current)
          ctx.current = undefined
        } else if (!ctx.current && !ctx.isDefault) {
          ctx.current = undefined
        }

        while (path[ctx.i + 1] && ctx.path[ctx.i + 1].trim() === '') ctx.i++
        if (path[ctx.i + 1] === ']') ctx.isTabletize = true

        return [
          ctx.parsedPath,
          ctx.i + (ctx.isTabletize ? 2 : 0),
          false,
          ctx.multiPath || _safe(path.slice(0, ctx.i)),
          ctx.currentDeep,
          _safe(cast(ctx.current)),
          !!ctx.multiPath,
        ]
      case '(': // TODO: add function support like count(_) or .length or pipe || size
        if (ctx.current) _safePush(ctx.parsedPath, ctx.current)
        ctx.current = ''
        ctx.i++
        ctx.multiBack = parseExpression(path, ctx.i)
        ctx.parsedPath.push({ rule: ctx.multiBack[0] })
        ctx.i = ctx.multiBack[1]
        continue
      case '=':
        if (!multi) break
        if (ctx.current) _safePush(ctx.parsedPath, ctx.current)
        ctx.current = ''
        ctx.isDefault = true
        continue
    }

    ctx.isKey = true
    ctx.current += ctx.path[ctx.i]
  }

  if (ctx.current) _safePush(ctx.parsedPath, cast(ctx.current))

  return ctx.parsedPath
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
