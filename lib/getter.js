import parser from './parser.js'
import flattener from './flattener.js'
import { calculateExpression } from './expression-processor.js'
import tabletizer from './tabletizer.js'
import pathAnalyzer from './path-analyzer.js'

export function getArrayIndexes(object, path, values = null) {
  if (!object) return
  if (path === undefined || path === '') return [object, undefined]

  const parsedPath = Array.isArray(path) ? path : parser.parse(path)
  const results = _get(object, parsedPath, values, true)

  if (!results) return [results, undefined]
  return results
}

export function get(object, path, values = null) {
  if (!object) return
  if (path === undefined || path === '') return object

  const parsedPath = Array.isArray(path) ? path : parser.parse(path)
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
    parser._safeCheck(parsedPath[i])

    if (
      Number.isInteger(parsedPath[i]) &&
      parsedPath[i] < 0 &&
      Array.isArray(current)
    ) {
      current = current[current.length + parsedPath[i]]
      if (current === undefined) return
      continue
    }

    if (typeof parsedPath[i] === 'object') {
      if (parsedPath[i].rule) {
        if (!calculateExpression(parsedPath[i].rule, values, current)) return
        continue
      }

      if (parsedPath[i].multi) {
        current = _multi(parsedPath[i].multi, current)
        continue
      }

      if (parsedPath[i].table) {
        current = tabletizer.tabletize(object, parsedPath[i].table)
        continue
      }

      continue // TODO: shouldn't get here, but let's skip for now
    }

    if (parsedPath[i] === true) {
      i++

      if (parsedPath[i] === parser.OBJECT_UN_FLAT) {
        current = flattener.flatten(current)
        continue
      }

      if (!Array.isArray(current)) return []

      if (parsedPath[i] === parser.ARRAY_INDEXES)
        return _arrayIndexes(parsedPath, i, current, arrayIndexes)

      return _arrayOthers(parsedPath, i, current, values, arrayIndexes)
    }

    if (typeof current === 'object' && current !== null)
      current = current[parsedPath[i]]
    else return
    if (current === undefined) return
  }

  if (arrayIndexes) return [current, undefined]
  return current
}

function _multi(multi, current) {
  const results = {}
  for (let j = 0, len = multi[0].length; j < len; j++) {
    const value = _get(current, multi[1][j])
    if (value !== undefined) {
      results[multi[0][j]] = value
    }
  }

  return results
}

function _arrayIndexes(parsedPath, i, current, arrayIndexes) {
  const results = []
  let indexResults = []
  let needIndexFlat = false
  const indexes = parsedPath[i + 1]
  const rest = parsedPath.slice(i + 2)

  for (const j of indexes) {
    indexResults.push([j])
    let value = _get(current[j], rest)

    if (arrayIndexes) {
      const subIndexes = value ? value[1] : undefined
      value = value ? value[0] : undefined

      if (value === undefined) indexResults.pop()
      else if (subIndexes !== undefined) {
        needIndexFlat = true
        indexResults[indexResults.length - 1] = subIndexes.map(subIndex => [
          ...indexResults[indexResults.length - 1],
          ...subIndex,
        ])
      }
    }

    results.push(value)
  }

  if (needIndexFlat) indexResults = indexResults.flat()
  if (arrayIndexes) return [results, indexResults]
  return results
}

function _arrayOthers(parsedPath, i, current, values, arrayIndexes) {
  let indexResults = []
  let needIndexFlat = false
  const keepStructure =
    parsedPath[i] === parser.ARRAY_UN_FLAT ||
    parsedPath[i] === parser.ARRAY_UN_FLAT_UNIQUE

  let results = []
  const rest = parsedPath.slice(i + 1)
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

  // TODO: move pathChecking to parser
  if (!pathAnalyzer.pathHasArrayAll(parsedPath.slice(i))) {
    if (parsedPath[i] === parser.ARRAY_UNIQUE)
      return _arrayFlatUnique(results, indexResults, arrayIndexes).filter(
        value => value !== undefined,
      )
    if (parsedPath[i] === parser.ARRAY_UN_FLAT_UNIQUE)
      return _arrayFlatUnique(results, indexResults, arrayIndexes)
  } else if (parsedPath[i] === parser.ARRAY_UN_FLAT_UNIQUE)
    return _arrayFlatUnique(results, indexResults, arrayIndexes)
  else if (parsedPath[i] === parser.ARRAY_UNIQUE)
    return _arrayFlatUnique(results.flat(), indexResults, arrayIndexes)
  else if (!keepStructure) results = results.flat()

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

export default {
  get,
  has,
  getArrayIndexes,
}
