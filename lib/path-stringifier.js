import {
  ARRAY_REPLACE,
  ARRAY_ALL,
  ARRAY_FOREACH,
  ARRAY_INDEX,
  ARRAY_INDEX_NEGATIVE,
  ARRAY_INDEXES,
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
        continue
      case ARRAY_INDEXES:
        stringified.push(`[${parsedPath[i + 1][0].join(',')}]`)
        parsedPath = parsedPath[i + 1]
        i = 0
        continue
      case ARRAY_ALL:
        stringified.push('[]')
        parsedPath = parsedPath[i + 1]
        i = -1
        continue
      case ARRAY_REPLACE:
        stringified.push('[=]')
        parsedPath = parsedPath[i + 1]
        i = -1
        continue
      case ARRAY_FOREACH:
        stringified.push('[*]')
        parsedPath = parsedPath[i + 1]
        i = -1
        continue
      case ARRAY_UN_FLAT:
        stringified.push('[:]')
        parsedPath = parsedPath[i + 1]
        i = -1
        continue
      case ARRAY_UNIQUE:
        stringified.push('[#]')
        parsedPath = parsedPath[i + 1]
        i = -1
        continue
      case OBJECT_PROPERTY:
        i++
        if (validIdentifier.test(parsedPath[i])) {
          if (stringified.length) stringified.push('.')
          stringified.push(parsedPath[i])

          continue
        } else if (validEnoughIdentifier.test(parsedPath[i]))
          stringified.push(`[${parsedPath[i]}]`)
        else stringified.push(`['${parsedPath[i]}']`)
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

  return stringified.join('')
}

// TODO: add more tests for multi
function _getMulti(multiPaths) {
  const multiStringified = []

  for (let i = 0; i < multiPaths.length; i++) {
    const pathStringified = stringifyPath(multiPaths[i][1])
    const keyIsSame = pathStringified === multiPaths[i][0]
    const hasDefault = multiPaths[i][2] !== undefined

    if (keyIsSame && !hasDefault) {
      multiStringified.push(multiPaths[i][0])
    } else if (keyIsSame)
      multiStringified.push(`${multiPaths[i][0]}=${multiPaths[i][2]}`)
    else if (!hasDefault)
      multiStringified.push(`${multiPaths[i][0]}:${pathStringified}`)
    else {
      multiStringified.push(
        `${multiPaths[i][0]}:${pathStringified}=${multiPaths[i][2]}`,
      )
    }
  }

  return `{${multiStringified.join(',')}}`
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
