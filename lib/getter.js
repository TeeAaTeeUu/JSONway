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
    if (parsedPath[i] === OBJECT_PROPERTY) {
      if (typeof current === 'object' && current !== null)
        current = current[parsedPath[++i]]
      else return

      if (current === undefined) return
    } else if (parsedPath[i] === ARRAY_INDEX) {
      if (!Array.isArray(current)) return

      current = current[parsedPath[++i]]
      if (current === undefined) return
    } else if (parsedPath[i] === ARRAY_INDEX_NEGATIVE) {
      if (!Array.isArray(current)) return

      current = current[current.length + parsedPath[++i]]
      if (current === undefined) return
    } else if (parsedPath[i] === RULE) {
      if (!calculateExpression(parsedPath[++i], values, current)) return
    } else if (parsedPath[i] === MULTI) {
      current = _multi(parsedPath[++i], current)
    } else if (parsedPath[i] === TABLE) {
      current = tabletize(object, parsedPath[++i])
    } else if (parsedPath[i] === OBJECT_UN_FLAT) {
      current = flatten(current)
      i++
    } else if (!Array.isArray(current)) {
      return []
    } else if (parsedPath[i] === ARRAY_INDEXES) {
      return _arrayIndexes(parsedPath, i, current, arrayIndexes)
    } else return _arrayOthers(parsedPath, i, current, values, arrayIndexes)
  }

  if (arrayIndexes) return [current, undefined]
  return current
}

function _multi(multi, current) {
  const results = {}
  for (let j = 0, len = multi.length; j < len; j++) {
    const value = _get(current, multi[j][1])
    if (value !== undefined) results[multi[j][0]] = value
    else if (multi[j][2] !== undefined) results[multi[j][0]] = multi[j][2]
  }

  return results
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
    if (!pathHasArrayAll(parsedPath[i + 1])) {
      if (parsedPath[i] === ARRAY_UNIQUE)
        return _arrayFlatUnique(results, indexResults, arrayIndexes).filter(
          value => value !== undefined,
        )

      return _arrayFlatUnique(results, indexResults, arrayIndexes)
    }

    if (parsedPath[i] === ARRAY_UN_FLAT_UNIQUE)
      return _arrayFlatUnique(results, indexResults, arrayIndexes)

    return _arrayFlatUnique(results.flat(), indexResults, arrayIndexes)
  }

  if (!keepStructure) results = results.flat()
  if (arrayIndexes) return [results, indexResults]
  return results
}

function _arrayFlatUnique(results, indexResults, arrayIndexes) {
  if (!arrayIndexes) return Array.from(new Set(results))

  const values = new Map()

  for (let i = 0; i < results.length; i++)
    if (values.has(results[i])) {
      values.get(results[i]).push(indexResults[i])
    } else values.set(results[i], [indexResults[i]])

  const flatResults = []
  const groupedIndexes = []
  for (const [result, indexes] of values.entries()) {
    flatResults.push(result)
    groupedIndexes.push(indexes.length > 1 ? indexes : indexes[0])
  }

  return [flatResults, groupedIndexes]
}
