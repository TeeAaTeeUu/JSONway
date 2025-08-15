import parser from './parser.js'

export function pathDepth(path, countActualPathDepth = false) {
  if (path === undefined || path === '') return null

  let parsedPath = Array.isArray(path) ? path : parser.parse(path)
  let depth = 0
  let lastUnFlat = false

  for (let i = 0; i < parsedPath.length; i++) {
    switch (parsedPath[i]) {
      case parser.ARRAY_INDEXES:
        depth++
        lastUnFlat = false
        parsedPath = parsedPath[i + 1]
        i = -1
        break
      case parser.ARRAY_UN_FLAT:
      case parser.ARRAY_UN_FLAT_UNIQUE:
        depth++
        lastUnFlat = true
        parsedPath = parsedPath[i + 1]
        i = -1
        break
      case parser.ARRAY_ALL:
      case parser.ARRAY_UNIQUE:
      case parser.ARRAY_FOREACH:
        if (depth === 0 || lastUnFlat || countActualPathDepth) depth++
        lastUnFlat = false
        parsedPath = parsedPath[i + 1]
        i = -1
        break
      case parser.MULTI:
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
  const parsedPathA = Array.isArray(pathA) ? pathA : parser.parse(pathA)
  const parsedPathB = Array.isArray(pathB) ? pathB : parser.parse(pathB)

  let sharedPath = 0

  for (
    let i = 0, j = 0;
    i < parsedPathA.length && j <= parsedPathB.length;
    i++, j++
  ) {
    sharedPath = i + 1
    while (parsedPathA[i].rule) i++
    while (parsedPathB[j].rule) j++
    if (parsedPathA[i] === parsedPathB[j]) continue
    if (
      parser.isNestedArray(parsedPathA[i]) &&
      parser.isNestedArray(parsedPathB[j])
    )
      continue

    sharedPath = i
    break
  }

  return pathDepth(parsedPathA.slice(0, sharedPath), true)
}

// TODO: move to parser, think of place for all the metadata
export function pathHasArrayAll(path) {
  if (path === undefined || path === '') return false

  let parsedPath = Array.isArray(path) ? path : parser.parse(path)

  for (let i = 0; i < parsedPath.length; i++) {
    switch (parsedPath[i]) {
      case parser.ARRAY_INDEXES:
      case parser.ARRAY_UN_FLAT:
      case parser.ARRAY_UN_FLAT_UNIQUE:
      case parser.ARRAY_UNIQUE:
        parsedPath = parsedPath[i + 1]
        i = -1
        continue
      case parser.ARRAY_ALL:
      case parser.ARRAY_FOREACH:
        return true
      default:
        i++
    }
  }

  return false
}

export function pathHasArrayForEach(path) {
  if (path === undefined || path === '') return false

  const parsedPath = Array.isArray(path) ? path : parser.parse(path)

  for (const token of parsedPath)
    if (token === parser.ARRAY_FOREACH) return true

  return false
}

export default {
  pathDepth,
  countSharedPathDepth,
  pathHasArrayAll,
  pathHasArrayForEach,
}
