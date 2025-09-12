import { parseExpression, RULE } from './expression-parser.js'
import {
  getArrayIndex,
  parseArray,
  DEEP_OBJECT_PROPERTY,
} from './array-parser.js'
import { parseObject } from './object-parser.js'
import { TABLE } from './table-parser.js'
import { getInteger } from './value-parser.js'

export const OBJECT_PROPERTY = '.'

const DEEP_OBJECT_PROPERTY_UNSCAPED = '**'

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
          if (parsedPath.at(-2) === DEEP_OBJECT_PROPERTY)
            parsedPath = parsedPath.at(-1)
          current = ''
        }

        switch (path[i]) {
          case '.':
            continue
          case '[':
            multiBack = parseArray(path, ++i)
            i = multiBack[1]
            parsedPath.push(...multiBack[0])

            if (Array.isArray(parsedPath.at(-1))) {
              if (typeof parsedPath.at(-1)[0] === 'boolean') {
                parsedPath = parsedPath.at(-2)
              } else if (parsedPath.at(-2) !== TABLE)
                parsedPath = parsedPath.at(-1)
            }
            continue
          case '{':
            multiBack = parseObject(path, ++i)
            parsedPath.push(...multiBack[0])
            i = multiBack[1]
            continue
          case '(':
            multiBack = parseExpression(path, ++i)
            parsedPath.push(RULE, multiBack[0])
            i = multiBack[1]
            break
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

export function _safe(value) {
  if (typeof value !== 'string') return value

  const trimValue = value.trim()
  _safeCheck(trimValue)

  return trimValue
}

function _safePush(parsedPath, value) {
  const safeValue = _safe(value)
  if (safeValue === '') return

  const potentialInteger = getInteger(safeValue)
  if (typeof potentialInteger === 'number')
    parsedPath.push(...getArrayIndex(potentialInteger))
  else if (safeValue === DEEP_OBJECT_PROPERTY_UNSCAPED)
    parsedPath.push(DEEP_OBJECT_PROPERTY, [])
  else parsedPath.push(OBJECT_PROPERTY, safeValue)
}
