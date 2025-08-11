import {
  ARRAY_ADD,
  ARRAY_ALL,
  ARRAY_FOREACH,
  ARRAY_INDEX,
  ARRAY_INDEX_NEGATIVE,
  ARRAY_UN_FLAT,
  ARRAY_UNIQUE,
  MULTI,
  OBJECT_PROPERTY,
  RULE,
} from './parser.js'
import { stringifyExpression } from './expression-stringifier.js'

const numbersOnly = /^\d+$/u
const validIdentifier = /^[^[\],.'"\s]+$/u
const validEnoughIdentifier = /^[^[\],'"\s]+$/u

export function stringifyPath(parsedPath) {
  if (!Array.isArray(parsedPath)) return parsedPath

  const stringified = []

  for (let i = 0; i < parsedPath.length; i++) {
    switch (parsedPath[i]) {
      case ARRAY_INDEX:
      case ARRAY_INDEX_NEGATIVE:
        stringified.push(`[${parsedPath[++i]}]`)
        break
      case ARRAY_ALL:
        stringified.push('[]')
        break
      case ARRAY_ADD:
        stringified.push('[+]')
        break
      case ARRAY_FOREACH:
        stringified.push('[*]')
        break
      case ARRAY_UN_FLAT:
        stringified.push('[:]')
        break
      case ARRAY_UNIQUE:
        stringified.push('[#]')
        break
      case OBJECT_PROPERTY:
        i++
        if (validIdentifier.test(parsedPath[i])) {
          if (stringified.length) stringified.push('.')
          stringified.push(parsedPath[i])

          break
        } else if (validEnoughIdentifier.test(parsedPath[i]))
          stringified.push(`[${parsedPath[i]}]`)
        else stringified.push(`['${parsedPath[i]}']`)
        break
      case MULTI:
        stringified.push(`{${parsedPath[++i][1].map(stringifyPath).join(',')}}`)
        break
      case RULE:
        stringified.push(`(${stringifyExpression(parsedPath[++i])})`)
      // TODO: add support for multi and tabletizer
    }
  }

  return stringified.join('')
}

export function getKey(key) {
  if (typeof key === 'number' || typeof key !== 'string') return `[${key}]`
  if (numbersOnly.test(key)) return `[${key}]`
  if (validIdentifier.test(key)) return key
  if (validEnoughIdentifier.test(key)) return `[${key}]`
  if (key.includes("'")) return `['${key.split("'").join("''")}']`
  return `['${key}']`
}

export default {
  getKey,
  stringifyPath,
}
