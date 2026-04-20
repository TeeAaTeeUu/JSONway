import {
  ESCAPED_OBJECT_PROPERTY_END,
  ESCAPED_OBJECT_PROPERTY_START,
  OBJECT_PROPERTY,
  PIPE,
} from './parser.js'
import { stringifyExpression } from './expression-stringifier.js'
import {
  ARRAY_ALL,
  ARRAY_FOREACH,
  ARRAY_INDEX,
  ARRAY_INDEX_NEGATIVE,
  ARRAY_INDEXES,
  ARRAY_REPLACE,
  ARRAY_UN_FLAT,
  ARRAY_UNIQUE,
  COMMA,
} from './array-parser.js'
import { MULTI } from './object-parser.js'
import { EQUAL, LARGER, RULE } from './expression-parser.js'
import { stringify } from './stringifier.js'
import {
  DOUBLE_QUOTE,
  SINGLE_QUOTE,
  TWO_SINGLE_QUOTES,
  isInteger,
} from './value-parser.js'
import { EMPTY, SPACE } from './_types.js'

export function stringifyPath(parsedPath) {
  if (!Array.isArray(parsedPath)) return parsedPath

  const stringified = []

  for (let i = 0; i < parsedPath.length; i++) {
    switch (parsedPath[i]) {
      case ARRAY_INDEX:
      case ARRAY_INDEX_NEGATIVE:
        stringified.push(`[${parsedPath[++i]}]`)
        continue
      case ARRAY_INDEXES:
        stringified.push(`[${parsedPath[i + 1][0].join(COMMA)}]`)
        parsedPath = parsedPath[i + 1]
        i = 0
        continue
      case ARRAY_ALL:
        stringified.push(ARRAY_ALL)
        parsedPath = parsedPath[i + 1]
        i = -1
        continue
      case ARRAY_REPLACE:
        stringified.push(ARRAY_REPLACE)
        parsedPath = parsedPath[i + 1]
        i = -1
        continue
      case ARRAY_FOREACH:
        stringified.push(ARRAY_FOREACH)
        parsedPath = parsedPath[i + 1]
        i = -1
        continue
      case ARRAY_UN_FLAT:
        stringified.push(ARRAY_UN_FLAT)
        parsedPath = parsedPath[i + 1]
        i = -1
        continue
      case ARRAY_UNIQUE:
        stringified.push(ARRAY_UNIQUE)
        parsedPath = parsedPath[i + 1]
        i = -1
        continue
      case OBJECT_PROPERTY:
        i++
        if (isValidIdentifier(parsedPath[i])) {
          if (stringified.length) stringified.push(OBJECT_PROPERTY)
          stringified.push(parsedPath[i])

          continue
        } else if (isValidIdentifier(parsedPath[i], false))
          stringified.push(`[${parsedPath[i]}]`)
        else stringified.push(`[${stringify(parsedPath[i], true)}]`)
        continue
      case MULTI:
        stringified.push(_getMulti(parsedPath[++i]))
        continue
      case RULE:
        stringified.push(`(${stringifyExpression(parsedPath[++i])})`)
        continue
      // TODO: add support for tabletizer
    }
  }

  return stringified.join(EMPTY)
}

function _getMulti(multiPaths) {
  const multiStringified = []
  let needsSpacing = false

  for (let i = 0; i < multiPaths.length; i++) {
    const keyIsInferred = !multiPaths[i][3][0]
    const hasDefault = multiPaths[i][2] !== undefined
    needsSpacing = needsSpacing || !keyIsInferred || hasDefault

    if (keyIsInferred && !hasDefault) {
      multiStringified.push(multiPaths[i][0])
    } else if (keyIsInferred)
      multiStringified.push(`${multiPaths[i][0]} = ${multiPaths[i][2]}`)
    else if (!hasDefault)
      multiStringified.push(
        `${multiPaths[i][0]}: ${stringifyPath(multiPaths[i][1])}`,
      )
    else
      multiStringified.push(
        `${multiPaths[i][0]}: ${stringifyPath(multiPaths[i][1])} = ${multiPaths[i][2]}`,
      )
  }

  return `{${multiStringified.join(needsSpacing ? COMMA + SPACE : COMMA)}}`
}

export function getKey(key) {
  if (isInteger(key)) return `['${key}']`
  if (isValidIdentifier(key)) return key
  if (isValidIdentifier(key, false)) return `[${key}]`

  return `['${key.split(SINGLE_QUOTE).join(TWO_SINGLE_QUOTES)}']`
}

function isValidIdentifier(value, strict = true) {
  if (value.trim().length < value.length) return false

  for (let i = 0, len = value.length; i < len; i++)
    switch (value[i]) {
      case ESCAPED_OBJECT_PROPERTY_START:
      case ESCAPED_OBJECT_PROPERTY_END:
      case COMMA:
      case SINGLE_QUOTE:
      case DOUBLE_QUOTE:
      case PIPE:
        return false
      case OBJECT_PROPERTY:
      case EQUAL:
      case LARGER:
      case SPACE:
        if (strict) return false
        continue
      default:
        if (value[i].trim() === EMPTY) return false
        continue
    }

  return true
}
