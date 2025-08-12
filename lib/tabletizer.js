import getter from './getter.js'
import parser from './parser.js'
import pathAnalyzer from './path-analyzer.js'
import pathStringifier from './path-stringifier.js'

export const MAX_DEPTH = 20

// TODO: lean even more heavily to pre-organizing values for index-based joining
export function tabletize(data, parsedPaths) {
  const indexesToUse = _getIndexesToUse(parsedPaths)
  const flatDepthNeeded = _getFlatDepthNeeded(parsedPaths)
  const subResults = _getSubResults(data, parsedPaths, indexesToUse)

  let indexes = [{}]
  let results = [{}]

  for (let i = 0; i < subResults.length; i++) {
    const subKeys = Object.keys(subResults[i])
    if (subKeys.length === 0) continue

    for (let j = 0; j < results.length; j++) {
      if (!parsedPaths[i][2]) {
        if (subKeys.length === 1 && subKeys[0] === '') {
          if (
            subResults[i][subKeys[0]].length === 1 &&
            !subResults[i][subKeys[0]][0][1]
          ) {
            if (subResults[i][subKeys[0]][0][0] !== undefined)
              results[j][parsedPaths[i][0]] = subResults[i][subKeys[0]][0][0]
          } else
            results[j][parsedPaths[i][0]] = subResults[i][subKeys[0]].map(
              subResultPart => subResultPart[0],
            )

          if (flatDepthNeeded[i])
            results[j][parsedPaths[i][0]] = results[j][parsedPaths[i][0]].flat(
              flatDepthNeeded[i],
            )
          continue
        }

        const currentIndex = indexes[j][`${indexesToUse[i][0]}`]
        let subResult

        if (currentIndex === undefined) subResult = subResults[i][currentIndex]
        else if (Array.isArray(currentIndex[0])) {
          subResult = currentIndex.flatMap(
            currentIndexPart =>
              subResults[i][currentIndexPart.slice(0, indexesToUse[i][1])],
          )
        } else
          subResult = subResults[i][currentIndex.slice(0, indexesToUse[i][1])]

        if (subResult === undefined) continue

        if (subResult.length === 1)
          results[j][parsedPaths[i][0]] = subResult[0][0]
        else
          results[j][parsedPaths[i][0]] = subResult.map(
            subResultPart => subResultPart[0],
          )

        continue
      }

      if (subKeys.length === 1 && subKeys[0] === '') {
        results[j] = subResults[i][subKeys[0]].map(subResult => ({
          ...results[j],
          [parsedPaths[i][0]]: subResult[0],
        }))

        indexes[j] = subResults[i][subKeys[0]].map(subResult => ({
          ...indexes[j],
          [i]: subResult[1],
        }))

        continue
      }

      results[j] = subResults[i][indexes[j][`${indexesToUse[i][0]}`]].map(
        subResult => ({
          ...results[j],
          [parsedPaths[i][0]]: subResult[0],
        }),
      )

      indexes[j] = subResults[i][indexes[j][`${indexesToUse[i][0]}`]].map(
        subResult => ({
          ...indexes[j],
          [i]: subResult[1],
        }),
      )
    }

    if (parsedPaths[i][2]) {
      results = results.flat()
      indexes = indexes.flat()
    }
  }

  return results
}

function _getIndexesToUse(parsedPaths) {
  const indexesToUse = new Array(parsedPaths.length).fill(1).map(() => [0, 0])

  for (let i = 0; i < parsedPaths.length; i++) {
    for (let j = 0; j < i; j++) {
      if (!parsedPaths[j][2]) continue
      const sharedPathDepth = pathAnalyzer.countSharedPathDepth(
        parsedPaths[i][1],
        parsedPaths[j][1],
      )

      if (indexesToUse[i][1] < sharedPathDepth)
        indexesToUse[i] = [j, sharedPathDepth]
    }
  }

  return indexesToUse
}

function _getSubResults(data, parsedPaths, indexesToUse) {
  const subResults = parsedPaths.map(parsedPath =>
    getter.getArrayIndexes(data, parsedPath[1]),
  )

  for (let i = 0; i < subResults.length; i++) {
    const temp = {}

    if (subResults[i][1] === undefined)
      temp[''] = [[subResults[i][0], subResults[i][1]]]
    else
      for (let j = 0; j < subResults[i][1].length; j++) {
        if (!Array.isArray(subResults[i][1][j][0])) {
          const key = `${subResults[i][1][j].slice(0, indexesToUse[i][1])}`

          if (!temp[key]) {
            temp[key] = [[subResults[i][0][j], subResults[i][1][j]]]
            continue
          }

          temp[key].push([subResults[i][0][j], subResults[i][1][j]])
          continue
        }

        for (let k = 0; k < subResults[i][1][j].length; k++) {
          const key = `${subResults[i][1][j][k].slice(0, indexesToUse[i][1])}`

          if (!temp[key]) {
            temp[key] = [[subResults[i][0][j], subResults[i][1][j][k]]]
            continue
          }

          // TODO: maybe Set() or Object.groupBy()
          if (temp[key].some(value => value[0] === subResults[i][0][j])) {
            let matchingIndex = temp[key].findIndex(
              value => value[0] === subResults[i][0][j],
            )

            if (!Array.isArray(temp[key][matchingIndex][1][0]))
              temp[key][matchingIndex][1] = [
                temp[key][matchingIndex][1],
                [subResults[i][1][j][k]],
              ]
            else {
              temp[key][matchingIndex][1].push(subResults[i][1][j][k])
            }

            continue
          }

          temp[key].push([subResults[i][0][j], subResults[i][1][j][k]])
        }
      }

    subResults[i] = temp
  }

  return subResults
}

function _getFlatDepthNeeded(parsedPaths) {
  return parsedPaths
    .map(parsedPath => pathAnalyzer.pathDepth(parsedPath[1]) - 2)
    .map(depth => (depth < 0 ? 0 : depth))
}

function pathSorter(a, b) {
  const depthA = pathAnalyzer.pathDepth(a, true)
  const depthB = pathAnalyzer.pathDepth(b, true)

  if (depthA === 0 && depthB > 0) return -1
  if (depthA > 0 && depthB === 0) return 1
  if (depthA === 0 && depthB === 0) {
    if (a.length !== b.length) return a.length < b.length ? -1 : 1

    for (let i = 0; i < a.length; i++)
      if (a[i] === b[i]) continue
      else return a[i] < b[i] ? -1 : 1

    return 0
  }

  for (let i = 0, j = 0; i < a.length || j < b.length; i++, j++) {
    if (parser.isNestedArray(a[i]) && parser.isNestedArray(b[j]))
      return pathSorter(a.slice(i + 1), b.slice(j + 1))

    if (a[i] === b[j]) continue
    if (a[i] === undefined) return -1
    if (b[j] === undefined) return 1

    if (Array.isArray(a[i]) || Array.isArray(b[j]))
      if (
        pathStringifier.stringifyPath(a.slice(i)) <
        pathStringifier.stringifyPath(b.slice(j))
      )
        return -1
      else return 1

    if (typeof a[i] === 'object' || typeof b[j] === 'object') {
      if (typeof a[i] !== 'object') i--
      else if (typeof b[j] !== 'object') j--
      continue
    }

    if (parser.isNestedArray(b[j])) return -1
    if (parser.isNestedArray(a[i])) return 1

    return a[i] < b[j] ? -1 : 1
  }

  return 0
}

export function parsePathNamesAndSort(rawParsePaths) {
  const paths = rawParsePaths[1].map((_, i) => [
    rawParsePaths[0][i],
    rawParsePaths[1][i],
    rawParsePaths[3][i],
    // TODO: maybe other syntax for expand / groupBy?
    pathAnalyzer.pathHasArrayForEach(rawParsePaths[1][i]),
  ])

  const groupByPaths = []
  for (let i = 0; i < paths.length; i++)
    if (!paths[i][2] && paths[i][3]) {
      paths[i][0] = _zeroedPath(paths[i][1])
      groupByPaths.push(paths[i][1])
    }

  for (let i = 0; i < paths.length; i++) {
    if (!paths[i][2] && !paths[i][3])
      paths[i][0] = pathStringifier.stringifyPath(
        _getZeroedFields([paths[i][1]], groupByPaths)[0],
      )

    paths[i].splice(2, 1)
  }

  paths.sort((a, b) => {
    if (a[2] && !b[2]) return -1
    if (!a[2] && b[2]) return 1
    return pathSorter(a[1], b[1])
  })

  return paths
}

function _zeroedPath(parsedPath) {
  const newParsedPath = []

  for (let i = 0; i < parsedPath.length; i++) {
    if (
      parsedPath[i] !== parser.ARRAY_ALL &&
      parsedPath[i] !== parser.ARRAY_FOREACH
    )
      newParsedPath.push(parsedPath[i])
    else newParsedPath.push(parser.ARRAY_INDEX, 0)
  }

  return pathStringifier.stringifyPath(newParsedPath)
}

function _getZeroedFields(parsedFields, parsedGroupBys) {
  const zeroedFields = []

  for (const parsedField of parsedFields) {
    const copyParsedField = [...parsedField]

    for (const parsedGroupBy of parsedGroupBys)
      _zeroedMatchingPath(copyParsedField, parsedGroupBy)

    zeroedFields.push(copyParsedField)
  }

  return zeroedFields
}

// TODO: think of alternative marker-syntax to keep non-array results
function _zeroedMatchingPath(parsedField, parsedGroupBy) {
  for (
    let i = 0, j = 0;
    i < parsedField.length && j <= parsedGroupBy.length;
    i++, j++
  ) {
    while (parsedField[i] === parser.RULE) i++
    while (parsedGroupBy[j] == parser.RULE) j++
    if (
      parsedField[i] === parser.ARRAY_ALL &&
      (parsedGroupBy[j] === parser.ARRAY_ALL ||
        parsedGroupBy[j] === parser.ARRAY_FOREACH)
    ) {
      parsedField.splice(i, 1, parser.ARRAY_INDEX, 0)
      i++
      continue
    }
    if (parsedField[i] === parsedGroupBy[j]) continue
    if (
      parsedField[i] === parser.ARRAY_INDEX &&
      parsedField[i + 1] === 0 &&
      parsedGroupBy[j] === parser.ARRAY_ALL
    ) {
      i++
      continue
    }

    break
  }

  return parsedField
}

export default {
  tabletize,
  parsePathNamesAndSort,
}
