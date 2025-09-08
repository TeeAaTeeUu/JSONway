import { OBJECT_PROPERTY, parse } from './parser.js'
import { flatten } from './flattener.js'
import { calculateExpression } from './expression-processor.js'
import { tabletize } from './tabletizer.js'
import { pathHasArrayAll } from './path-analyzer.js'
import {
  ARRAY_INDEX,
  ARRAY_INDEX_NEGATIVE,
  ARRAY_INDEXES,
  ARRAY_UN_FLAT,
  ARRAY_UN_FLAT_UNIQUE,
  ARRAY_UNIQUE,
  DEEP_OBJECT_PROPERTY,
} from './array-parser.js'
import { RULE } from './expression-parser.js'
import { MULTI, OBJECT_UN_FLAT } from './object-parser.js'
import { TABLE } from './table-parser.js'

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

  for (let i = 0, len = parsedPath.length; i < len; i++) {
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
      case MULTI:
        current = _multi(current, parsedPath[++i])
        continue
      case TABLE:
        current = tabletize(current, parsedPath[++i])
        continue
      case DEEP_OBJECT_PROPERTY:
        return _deepValues(parsedPath, ++i, current)
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
  if (parsedPath[i + 1] !== OBJECT_PROPERTY) return []

  const needle = parsedPath[i + 2]
  const parsedPathRest = parsedPath.slice(i + 3)
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

  return result
}

function _isArrayOrObject(value) {
  return value !== null && typeof value === 'object'
}

function _arrayIndexes(parsedPath, i, current, arrayIndexes) {
  const results = []
  let indexResults = []
  const indexes = parsedPath[i + 1][0]
  const rest = parsedPath[i + 1].slice(1)

  for (const j of indexes) {
    indexResults.push([j])
    let value = _get(current[j], rest)

    if (arrayIndexes) {
      // TODO: are sub-indexes for ARRAY_INDEX needed?
      // const subIndexes = value ? value[1] : undefined
      value = value ? value[0] : undefined

      if (value === undefined) indexResults.pop()
    }

    results.push(value)
  }

  if (arrayIndexes) return [results, indexResults]
  return results
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

  return _arrayReturnable(
    parsedPath,
    i,
    results,
    keepStructure,
    needIndexFlat,
    indexResults,
    arrayIndexes,
  )
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
    if (parsedPath[i] === ARRAY_UNIQUE && !pathHasArrayAll(parsedPath[i + 1]))
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
