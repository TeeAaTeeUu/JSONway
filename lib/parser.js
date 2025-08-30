import { parseExpression, RULE } from './expression-parser.js'
import { parseArray } from './array-parser.js'
import { parseObject } from './object-parser.js'
import { TABLE } from './table-parser.js'

export const OBJECT_PROPERTY = '.'

// TODO: export const ARRAY_FOREACH_UNIQUE = '[*#]'

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

  if (current) _safePush(parsedPath, current)

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
