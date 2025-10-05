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
  if (!object) return
  if (path === undefined || path === '') return [object, undefined]

  const parsedPath = Array.isArray(path) ? path : parse(path)
  const results = _get(object, parsedPath, values, true)

  if (!results) return [results, undefined]
  return results
}

export function get(object, path, values = null) {
  if (!object) return
  if (path === undefined || path === '') return object

  const parsedPath = Array.isArray(path) ? path : parse(path)
  return _get(object, parsedPath, values)
}

export function has(object, path) {
  const value = get(object, path)

  if (value === undefined) return false
  if (Array.isArray(value) && value.length === 0) return false

  return true
}

function _get(object, parsedPath, values = null, arrayIndexes = false) {
  if (!object) return

  let current = object

  for (let i = 0; i < parsedPath.length; i++) {
    switch (parsedPath[i]) {
      case OBJECT_PROPERTY:
        if (typeof current === 'object' && current !== null)
          current = current[parsedPath[++i]]
        else return

        if (current === undefined) return
        continue
      case OBJECT_UN_FLAT:
        current = flatten(current)
        i++
        continue
      case RULE:
        if (!calculateExpression(parsedPath[++i], values, current)) return
        continue
      case EXISTS_OR:
        current = calculateExpression(parsedPath[++i], values, current)
        if (current === undefined) return
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
        if (current === undefined) return
        continue
      case ARRAY_INDEX_NEGATIVE:
        current = current[current.length + parsedPath[++i]]
        if (current === undefined) return
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
  if (parsedPath[i][0] !== OBJECT_PROPERTY) return []

  const needle = parsedPath[i][1]
  const parsedPathRest = parsedPath[i].slice(2)
  const result = []
  const stack = [originalCurrent]
  let current = originalCurrent

  while (stack.length > 0) {
    current = stack.shift()

    if (Array.isArray(current)) {
      for (let i = 0, len = current.length; i < len; i++)
        if (!_isArrayOrObject(current[i])) continue
        else stack.push(current[i])

      continue
    }

    for (const key in current) {
      if (key === needle) {
        const temp = _get(current[key], parsedPathRest)
        if (temp !== undefined) result.push(temp)
        continue
      }

      if (!_isArrayOrObject(current[key])) continue
      else stack.push(current[key])
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

  if (start > end) return []
  if (start >= len) return []

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
    if (arrayIndexes) indexResults.push([j])
    let value = _get(current[j], rest, values, arrayIndexes)

    if (arrayIndexes) {
      const subIndexes = value ? value[1] : undefined
      value = value ? value[0] : undefined

      if (value === undefined) indexResults.pop()
      else if (subIndexes !== undefined) {
        needIndexFlat = !keepStructure ? true : false

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
      // TODO: check which case the 2nd condition is for
      if (keepStructure && typeof rest[0] !== 'object') {
        results[j] = value
      } else {
        results.push(value)
      }
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
  if (
    parsedPath[i] === ARRAY_UNIQUE ||
    parsedPath[i] === ARRAY_UN_FLAT_UNIQUE
  ) {
    if (parsedPath[i] === ARRAY_UNIQUE && !pathHasFlatArray(parsedPath[i + 1]))
      return _arrayUnique(results, indexResults, arrayIndexes).filter(
        value => value !== undefined,
      )

    if (parsedPath[i] === ARRAY_UN_FLAT_UNIQUE)
      return _arrayUnique(results, indexResults, arrayIndexes)

    return _arrayUnique(results.flat(), indexResults, arrayIndexes)
  }

  if (!keepStructure) results = results.flat()
  if (arrayIndexes) return [results, indexResults]
  return results
}

function _arrayUnique(results, indexResults, arrayIndexes) {
  const values = Array.from(
    new Map(results.map(result => [`${result}`, result])).values(),
  )

  if (!arrayIndexes) return values

  const indexes = new Map(results.map(result => [`${result}`, []]))

  for (let i = 0; i < results.length; i++)
    indexes.get(`${results[i]}`).push(indexResults[i])

  const groupedIndexes = Array.from(indexes.values()).map(groupedIndex =>
    groupedIndex.length > 1 ? groupedIndex : groupedIndex[0],
  )

  return [values, groupedIndexes]
}
