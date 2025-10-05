import {
  ARRAY_ALL,
  ARRAY_FOREACH,
  ARRAY_INDEXES,
  ARRAY_UN_FLAT,
  ARRAY_UN_FLAT_UNIQUE,
  ARRAY_UNIQUE,
  isNestedArray,
  isSubArray,
} from './array-parser.js'
import { MULTI } from './object-parser.js'
import { parse } from './parser.js'

export function pathDepth(path, countActualPathDepth = false) {
  if (path === undefined || path === '') return null

  let parsedPath = Array.isArray(path) ? path : parse(path)

  let depth = 0
  let lastUnFlat = false

  for (let i = 0; i < parsedPath.length; i++) {
    switch (parsedPath[i]) {
      case ARRAY_INDEXES:
        depth++
        lastUnFlat = false
        parsedPath = parsedPath[i + 1]
        i = -1
        break
      case ARRAY_UN_FLAT:
      case ARRAY_UN_FLAT_UNIQUE:
        depth++
        lastUnFlat = true
        parsedPath = parsedPath[i + 1]
        i = -1
        break
      case ARRAY_ALL:
      case ARRAY_UNIQUE:
      case ARRAY_FOREACH:
        if (depth === 0 || lastUnFlat || countActualPathDepth) depth++
        lastUnFlat = false
        parsedPath = parsedPath[i + 1]
        i = -1
        break
      case MULTI:
        depth++
        i++
        break
      default:
        i++
    }
  }

  return depth
}

export function countSharedPathDepth(pathA, pathB) {
  let sharedPath = 0
  let subPathDepth = 0

  for (let i = 0, j = 0; i < pathA.length && j <= pathB.length; i++, j++) {
    sharedPath = i + 1
    while (pathA[i].rule) i++
    while (pathB[j].rule) j++
    if (isSubArray(pathA[i]) && isSubArray(pathB[j])) {
      subPathDepth++
      subPathDepth += countSharedPathDepth(pathA[++i], pathB[++j])

      break
      // TODO: handle ARRAY_INDEXES
    }
    if (pathA[i] === pathB[j]) continue
    if (isNestedArray(pathA[i]) && isNestedArray(pathB[j])) continue

    sharedPath = i - 1
    break
  }

  if (sharedPath <= 1) return subPathDepth
  if (sharedPath % 2 === 1) --sharedPath

  return pathDepth(pathA.slice(0, sharedPath), true) + subPathDepth
}

// TODO: move to parser, think of place for all the metadata
export function pathHasFlatArray(path) {
  let parsedPath = path

  for (let i = 0; i < parsedPath.length; i++) {
    switch (parsedPath[i]) {
      case ARRAY_INDEXES:
      case ARRAY_UN_FLAT:
      case ARRAY_UN_FLAT_UNIQUE:
        parsedPath = parsedPath[i + 1]
        i = -1
        continue
      case ARRAY_UNIQUE:
      case ARRAY_ALL:
      case ARRAY_FOREACH:
        return true
      default:
        i++
    }
  }

  return false
}

// TODO: move to parser, think of place for all the metadata
export function pathHasArrayForEach(path) {
  let parsedPath = path

  for (let i = 0; i < parsedPath.length; i++) {
    switch (parsedPath[i]) {
      case ARRAY_INDEXES:
      case ARRAY_UN_FLAT:
      case ARRAY_UN_FLAT_UNIQUE:
      case ARRAY_UNIQUE:
      case ARRAY_ALL:
        parsedPath = parsedPath[i + 1]
        i = -1
        continue
      case ARRAY_FOREACH:
        return true
      default:
        i++
    }
  }

  return false
}
