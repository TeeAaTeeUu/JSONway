import { OBJECT_PROPERTY, parse, PIPE } from './parser.js'
import { flatten } from './flattener.js'
import { calculateExpression, calculateList } from './expression-processor.js'
import { tabletize } from './tabletizer.js'
import { pathHasFlatArray } from './path-analyzer.js'
import {
  ARRAY_INDEX,
  ARRAY_INDEX_NEGATIVE,
  ARRAY_INDEXES,
  ARRAY_LIST,
  ARRAY_SLICE,
  ARRAY_UN_FLAT,
  ARRAY_UN_FLAT_UNIQUE,
  ARRAY_UNIQUE,
  DEEP_OBJECT_PROPERTY,
} from './array-parser.js'
import { RULE, EXISTS_OR } from './expression-parser.js'
import { MULTI, OBJECT_UN_FLAT } from './object-parser.js'
import { TABLE } from './table-parser.js'
import { processFunction } from './function-processor.js'

export function getArrayIndexes(object, path, values = null) {
  if (!object || path === undefined) return [object, undefined]

  const parsedPath = Array.isArray(path) ? path : parse(path)
  const results = _get(object, parsedPath, values, true)

  if (!results) return [results, undefined]
  return results
}

export function get(object, path, values = null) {
  if (!object || path === undefined) return object

  const parsedPath = Array.isArray(path) ? path : parse(path)
  return _get(object, parsedPath, values)
}

export function has(object, path) {
  const value = get(object, path)

  if (value === undefined) return false
  if (!_isArrayOrObject(value)) return true

  for (const key in value) return true
  return false
}

function _get(object, parsedPath, values = null, arrayIndexes = false) {
  if (object === undefined) return
  let current = object

  for (let i = 0; i < parsedPath.length; i++) {
    if (current === undefined || current === null) return

    switch (parsedPath[i]) {
      case OBJECT_PROPERTY:
        if (typeof current !== 'object') return
        if (!Object.hasOwn(current, parsedPath[++i])) return

        current = current[parsedPath[i]]
        continue
      case OBJECT_UN_FLAT:
        current = flatten(current)
        i++
        continue
      case RULE:
        if (!calculateExpression(parsedPath[++i], current, values)) return
        continue
      case EXISTS_OR:
        current = calculateExpression(parsedPath[++i], current, values)
        continue
      case MULTI:
        current = _multi(current, parsedPath[++i])
        continue
      case TABLE:
        current = tabletize(current, parsedPath[++i])
        continue
      case DEEP_OBJECT_PROPERTY:
        return _deepValues(parsedPath, ++i, current)
      case ARRAY_LIST:
        parsedPath = parsedPath[++i]
        i = 0
        current = calculateList(parsedPath[i], current)
        continue
      case PIPE:
        return _getPiped(current, parsedPath[++i])
    }

    if (!Array.isArray(current)) return

    switch (parsedPath[i]) {
      case ARRAY_INDEX:
        current = current[parsedPath[++i]]
        continue
      case ARRAY_INDEX_NEGATIVE:
        current = current[current.length + parsedPath[++i]]
        continue
      case ARRAY_SLICE:
      case ARRAY_INDEXES:
        return _arrayIndexes(parsedPath, i, current, arrayIndexes)
      default:
        return _arrayOthers(parsedPath, i, current, values, arrayIndexes)
    }
  }

  if (arrayIndexes) return [current, undefined]
  return current
}

function _multi(current, multi) {
  const results = {}
  for (let j = 0, len = multi.length; j < len; j++) {
    const value = _get(current, multi[j][1])
    if (value !== undefined) results[multi[j][0]] = value
    else if (multi[j][2] !== undefined) results[multi[j][0]] = multi[j][2]
  }

  return results
}

function _deepValues(parsedPath, i, originalCurrent) {
  if (!_isArrayOrObject(originalCurrent)) return

  const type = parsedPath[i][0]
  const needle = parsedPath[i][1]
  const parsedPathRest =
    type === OBJECT_PROPERTY ? parsedPath[i].slice(2) : parsedPath[i]
  const result = []
  const stack = [originalCurrent]
  let current = originalCurrent
  let keys = []

  while (stack.length > 0) {
    current = stack.shift()

    keys = Array.isArray(current)
      ? Array.from(current.keys())
      : Object.keys(current)

    for (let i = 0; i < keys.length; i++) {
      if (type !== OBJECT_PROPERTY || keys[i] === needle) {
        const temp = _get(current[keys[i]], parsedPathRest)
        if (temp !== undefined) result.push(temp)
      }

      if (!_isArrayOrObject(current[keys[i]])) continue
      else stack.push(current[keys[i]])
    }
  }

  if (Array.isArray(parsedPath[i + 1]))
    return _getPiped(result, parsedPath[i + 1])

  return result
}

function _isArrayOrObject(value) {
  return value !== null && typeof value === 'object'
}

function _getPiped(result, pipe) {
  if (pipe[1][0] === OBJECT_PROPERTY) return processFunction(result, pipe[1])
  return get(result, pipe[1])
}

function _arrayIndexes(parsedPath, i, current, arrayIndexes) {
  const results = []
  let indexResults = []
  let indexes = parsedPath[i + 1][0]

  if (parsedPath[i] === ARRAY_SLICE)
    indexes = _getIndexesFromSlice(current, parsedPath[i + 1][0])

  const rest = parsedPath[i + 1].slice(1)

  for (const j of indexes) {
    const index = j >= 0 ? j : current.length + j
    indexResults.push([index])
    let value = _get(current[index], rest)

    // if (arrayIndexes) {
    // TODO: are sub-indexes for ARRAY_INDEX needed?
    // const subIndexes = value ? value[1] : undefined
    // }

    results.push(value)
  }

  if (arrayIndexes) return [results, indexResults]

  // TODO: add pipe support for arrayIndexes
  if (Array.isArray(parsedPath[i + 2]))
    return _getPiped(results, parsedPath[i + 2])

  return results
}

function _getIndexesFromSlice(current, slice) {
  const len = current.length

  const start = _getIndex(slice[0], len)
  const end = _getIndex(slice[1], len)
  const step = slice[2] > 1 ? slice[2] : 1

  const indexes = []
  for (let i = start; i < end && i < len; i += step) indexes.push(i)
  return indexes
}

function _getIndex(value, len) {
  if (value === null) return 0
  else if (value === undefined) return len
  else if (value >= 0) return value

  return len + value
}

function _arrayOthers(parsedPath, i, current, values, arrayIndexes) {
  let indexResults = []
  let needIndexFlat = false
  const keepStructure =
    parsedPath[i] === ARRAY_UN_FLAT || parsedPath[i] === ARRAY_UN_FLAT_UNIQUE

  let results = []
  const rest = parsedPath[i + 1]
  for (let j = 0, len = current.length; j < len; j++) {
    let value = _get(current[j], rest, values, arrayIndexes)

    if (arrayIndexes) {
      const subIndexes = value ? value[1] : undefined
      value = value ? value[0] : undefined

      if (value !== undefined) indexResults.push([j])

      if (subIndexes !== undefined) {
        needIndexFlat = !keepStructure

        indexResults[indexResults.length - 1] = subIndexes.map(subIndex => {
          if (!Array.isArray(subIndex[0]))
            return [...indexResults[indexResults.length - 1], ...subIndex]

          return subIndex.map(groupedIndex => [
            ...indexResults[indexResults.length - 1],
            ...groupedIndex,
          ])
        })
      }
    }

    if (value !== undefined) {
      if (keepStructure) results[j] = value
      else results.push(value)
    }
  }

  const arrayResults = _arrayReturnable(
    parsedPath,
    i,
    results,
    keepStructure,
    needIndexFlat,
    indexResults,
    arrayIndexes,
  )

  // TODO: add pipe support for arrayIndexes
  if (Array.isArray(parsedPath[i + 2]))
    return _getPiped(arrayResults, parsedPath[i + 2])

  return arrayResults
}

function _arrayReturnable(
  parsedPath,
  i,
  results,
  keepStructure,
  needIndexFlat,
  indexResults,
  arrayIndexes,
) {
  if (needIndexFlat) indexResults = indexResults.flat()

  if (parsedPath[i] === ARRAY_UNIQUE) {
    if (!pathHasFlatArray(parsedPath[i + 1]))
      return _arrayUnique(results, indexResults, arrayIndexes)

    return _arrayUnique(results.flat(), indexResults, arrayIndexes)
  }

  if (parsedPath[i] === ARRAY_UN_FLAT_UNIQUE)
    return _arrayUnique(results, indexResults, arrayIndexes)

  if (!keepStructure) results = results.flat()
  if (arrayIndexes) return [results, indexResults]
  return results
}

function _arrayUnique(results, indexResults, arrayIndexes) {
  const mapping = []
  for (let i = 0; i < results.length; i++)
    mapping.push([`${results[i]}`, results[i]])

  const values = Array.from(new Map(mapping).values())

  if (!arrayIndexes) return values

  const indexes = new Map(results.map(result => [`${result}`, []]))

  for (let i = 0; i < results.length; i++)
    indexes.get(`${results[i]}`).push(indexResults[i])

  const groupedIndexes = Array.from(indexes.values()).map(groupedIndex =>
    groupedIndex.length > 1 ? groupedIndex : groupedIndex[0],
  )

  return [values, groupedIndexes]
}
