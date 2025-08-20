import { parse, _safe } from './parser.js'
import {
  cast,
  isEscaped,
  unscape,
  SINGLE_QUOTE,
  DOUBLE_QUOTE,
} from './value-parser.js'

export const OBJECT_UN_FLAT = '{:}'
export const MULTI = '{}'

export function parseObject(path, startIndex) {
  const len = path.length
  let token = path[startIndex]

  if (token === '}' || startIndex >= len) return [[], startIndex]
  if (token === ':' && (path[startIndex + 1] === '}' || startIndex + 1 >= len))
    return [[OBJECT_UN_FLAT, true], startIndex]

  let i = startIndex
  let depth = 1
  let arrayDepth = 0
  let singleEscaped = false
  let doubleEscaped = false
  let commas = []
  let colons = []
  let equals = []

  for (; i < len; i++) {
    token = path[i]

    if (token === SINGLE_QUOTE && !doubleEscaped) singleEscaped = !singleEscaped
    else if (token === DOUBLE_QUOTE && !singleEscaped)
      doubleEscaped = !doubleEscaped
    else if (singleEscaped || doubleEscaped) continue

    if (token === '{') depth++
    else if (token === '}') {
      if (--depth === 0) break
    } else if (token === '[') arrayDepth++
    else if (token === ']') arrayDepth--
    else if (depth === 1 && arrayDepth === 0) {
      if (token === ',') commas.push(i)
      else if (token === ':') colons.push(i)
      else if (token === '=') equals.push(i)
    }
  }

  if (commas.length === 0) {
    const indexes = _sortIndexes(startIndex, commas, colons, equals, i)[0]

    return [[MULTI, [_getSingleObject(path, indexes)]], i]
  }

  const sortedIndexes = _sortIndexes(startIndex, commas, colons, equals, i)

  return [[MULTI, _parseList(path, sortedIndexes)], i]
}

function _sortIndexes(startIndex, commas, colons, equals, endIndex) {
  const result = []

  let previousCommaValue = startIndex
  let colonIndex = 0
  let equalIndex = 0

  const nextComma = commas[0] || endIndex

  const ColonSmallerThanNextComma = colons[colonIndex] < nextComma
  const equalSmallerThanNextComma = equals[equalIndex] < nextComma

  result.push([
    previousCommaValue,
    ColonSmallerThanNextComma ? colons[colonIndex] : undefined,
    equalSmallerThanNextComma ? equals[equalIndex] : undefined,
    nextComma,
  ])

  if (commas.length === 0) return result

  previousCommaValue = nextComma + 1
  if (ColonSmallerThanNextComma) colonIndex++
  if (equalSmallerThanNextComma) equalIndex++

  for (let commaIndex = 1; commaIndex < commas.length; commaIndex++) {
    const ColonSmallerThanComma = colons[colonIndex] < commas[commaIndex]
    const equalSmallerThanComma = equals[equalIndex] < commas[commaIndex]

    result.push([
      previousCommaValue,
      ColonSmallerThanComma ? colons[colonIndex] : undefined,
      equalSmallerThanComma ? equals[equalIndex] : undefined,
      commas[commaIndex],
    ])

    if (ColonSmallerThanComma) colonIndex++
    if (equalSmallerThanComma) equalIndex++

    previousCommaValue = commas[commaIndex] + 1
  }

  if (colonIndex < colons.length - 1) colonIndex = colons.length - 1
  if (equalIndex < equals.length - 1) equalIndex = equals.length - 1

  const ColonSmallerThanEndIndex = colons[colonIndex] < endIndex
  const equalSmallerThanEndIndex = equals[equalIndex] < endIndex

  result.push([
    previousCommaValue,
    ColonSmallerThanEndIndex ? colons[colonIndex] : undefined,
    equalSmallerThanEndIndex ? equals[equalIndex] : undefined,
    endIndex,
  ])

  return result
}

function _parseList(path, sortedIndexes) {
  const list = []

  for (let i = 0; i < sortedIndexes.length; i++)
    list.push(_getSingleObject(path, sortedIndexes[i]))

  return list
}

function _getSingleObject(path, indexes) {
  const key = _safe(_getKey(path, indexes).trim())
  const value = cast(_getValue(path, indexes))
  const defaultValue = cast(_getDefault(path, indexes))

  if (_isPath(value))
    return [_unescape(key), parse(value), _unescape(defaultValue)]
  return [_unescape(key), [true, _unescape(value)], _unescape(defaultValue)]
}

function _getKey(path, indexes) {
  if (indexes[1]) return path.slice(indexes[0], indexes[1])
  else if (indexes[2]) return path.slice(indexes[0], indexes[2])
  return path.slice(indexes[0], indexes[3])
}

function _getValue(path, indexes) {
  if (indexes[1] && indexes[2]) return path.slice(indexes[1] + 1, indexes[2])
  else if (indexes[1]) return path.slice(indexes[1] + 1, indexes[3])
  else if (indexes[2]) return path.slice(indexes[0], indexes[2])
  return path.slice(indexes[0], indexes[3])
}

function _unescape(value) {
  if (!isEscaped(value)) return value
  return _safe(unscape(value))
}

function _getDefault(path, indexes) {
  if (!indexes[2]) return undefined
  return path.slice(indexes[2] + 1, indexes[3])
}

function _isPath(value) {
  return (
    typeof value === 'string' &&
    value[0] !== SINGLE_QUOTE &&
    value[0] !== DOUBLE_QUOTE
  )
}

export default {
  parseObject,
}
