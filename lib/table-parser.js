import {
  ARRAY_ALL,
  ARRAY_FOREACH,
  ARRAY_INDEX,
  ARRAY_INDEXES,
  ARRAY_UN_FLAT,
  ARRAY_UN_FLAT_UNIQUE,
  ARRAY_UNIQUE,
  isNestedArray,
} from './array-parser.js'
import { RULE } from './expression-parser.js'
import { parseObject } from './object-parser.js'
import {
  countSharedPathDepth,
  pathDepth,
  pathHasArrayForEach,
} from './path-analyzer.js'
import { stringifyPath } from './path-stringifier.js'

export const TABLE = '[{}]'

export function parseTable(path) {
  const parsedTable = parseObject(path, 1)[0][1]

  for (let i = 0; i < parsedTable.length; i++)
    parsedTable[i][3][1] = pathHasArrayForEach(parsedTable[i][1])

  _parsePathNamesAndSort(parsedTable)
  _addIndexesToUse(parsedTable)

  return parsedTable
}

export function isTable(value) {
  return typeof value === 'string' && value[0] === '{' && value.at(-1) === '}'
}

function _parsePathNamesAndSort(parsedTable) {
  const groupByPaths = []
  for (let i = 0; i < parsedTable.length; i++)
    if (!parsedTable[i][3][0] && parsedTable[i][3][1]) {
      parsedTable[i][0] = _zeroedPath(parsedTable[i][1])
      groupByPaths.push(parsedTable[i][1])
    }

  for (let i = 0; i < parsedTable.length; i++) {
    if (!parsedTable[i][3][0] && !parsedTable[i][3][1])
      parsedTable[i][0] = stringifyPath(
        _getZeroedFields([parsedTable[i][1]], groupByPaths)[0],
      )
  }

  parsedTable.sort((a, b) => {
    if (a[3][1] && !b[3][1]) return -1
    if (!a[3][1] && b[3][1]) return 1
    return _pathSorter(a[1], b[1])
  })

  return parsedTable
}

function _zeroedPath(parsedPath, stringify = true) {
  const newParsedPath = []

  for (let i = 0; i < parsedPath.length; i++) {
    if (parsedPath[i] !== ARRAY_ALL && parsedPath[i] !== ARRAY_FOREACH) {
      newParsedPath.push(parsedPath[i])

      switch (parsedPath[i]) {
        case ARRAY_INDEXES: // TODO: does ARRAY_INDEXES make sense?
        case ARRAY_UN_FLAT:
        case ARRAY_UN_FLAT_UNIQUE:
        case ARRAY_UNIQUE:
          newParsedPath.push(_zeroedPath(parsedPath[i + 1], false))
      }
    } else {
      newParsedPath.push(
        ARRAY_INDEX,
        0,
        ..._zeroedPath(parsedPath[i + 1], false),
      )
      i++
    }
  }

  if (!stringify) return newParsedPath
  return stringifyPath(newParsedPath)
}

function _getZeroedFields(parsedFields, parsedGroupBys) {
  const zeroedFields = []

  for (const parsedField of parsedFields) {
    const copyParsedField = JSON.parse(JSON.stringify(parsedField))

    for (const parsedGroupBy of parsedGroupBys)
      _zeroedMatchingPath(copyParsedField, parsedGroupBy)

    zeroedFields.push(copyParsedField)
  }

  return zeroedFields
}

// TODO: think of alternative marker-syntax to keep non-array results
function _zeroedMatchingPath(parsedField, parsedGroupBy) {
  let currentParsedGroupBy = parsedGroupBy

  for (
    let i = 0, j = 0;
    i < parsedField.length && j <= currentParsedGroupBy.length;
    i++, j++
  ) {
    while (parsedField[i] === RULE) i++
    while (currentParsedGroupBy[j] == RULE) j++
    if (
      parsedField[i] === ARRAY_ALL &&
      (currentParsedGroupBy[j] === ARRAY_ALL ||
        currentParsedGroupBy[j] === ARRAY_FOREACH)
    ) {
      parsedField.splice(i, 2, ARRAY_INDEX, 0, ...parsedField[i + 1])
      i++

      currentParsedGroupBy = currentParsedGroupBy[j + 1]
      j = -1

      continue
    }
    if (parsedField[i] === currentParsedGroupBy[j]) continue
    if (
      parsedField[i] === ARRAY_INDEX &&
      parsedField[i + 1] === 0 &&
      currentParsedGroupBy[j] === ARRAY_ALL
    ) {
      i++
      currentParsedGroupBy = currentParsedGroupBy[j + 1]
      j = -1
      continue
    }

    break
  }

  return parsedField
}

function _addIndexesToUse(parsedPaths) {
  for (let i = 0; i < parsedPaths.length; i++) {
    parsedPaths[i][3][2] = [0, 0]

    for (let j = 0; j < i; j++) {
      if (!parsedPaths[j][3][1]) continue
      const sharedPathDepth = countSharedPathDepth(
        parsedPaths[i][1],
        parsedPaths[j][1],
      )

      if (parsedPaths[i][3][2][1] < sharedPathDepth)
        parsedPaths[i][3][2] = [j, sharedPathDepth]
    }
  }
}

function _pathSorter(a, b) {
  const depthA = pathDepth(a, true)
  const depthB = pathDepth(b, true)

  if (depthA === 0 && depthB > 0) return -1
  if (depthA > 0 && depthB === 0) return 1
  if (depthA === 0 && depthB === 0) {
    if (a.length !== b.length) return a.length < b.length ? -1 : 1

    for (let i = 0; i < a.length; i++)
      if (a[i] === b[i]) continue
      else return a[i] < b[i] ? -1 : 1

    return 0
  }

  for (let i = 0, j = 0; ; i++, j++) {
    if (isNestedArray(a[i]) && isNestedArray(b[j]))
      return _pathSorter(a[i + 1], b[j + 1])

    if (a[i] === b[j]) continue

    return a[i] < b[j] ? -1 : 1
  }
}
