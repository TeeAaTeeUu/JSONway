import getter from './getter.js'
import pathAnalyzer from './path-analyzer.js'

export const MAX_DEPTH = 20

// TODO: lean even more heavily to pre-organizing values for index-based joining
export function tabletize(data, parsedPaths) {
  const flatDepthNeeded = _getFlatDepthNeeded(parsedPaths)
  const subResults = _getSubResults(data, parsedPaths)

  let indexes = [{}]
  let results = [{}]

  for (let i = 0; i < subResults.length; i++) {
    const subKeys = Object.keys(subResults[i])
    if (subKeys.length === 0) continue

    for (let j = 0; j < results.length; j++) {
      if (!parsedPaths[i][3][1]) {
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

        const currentIndex = indexes[j][`${parsedPaths[i][3][2][0]}`]
        let subResult

        if (currentIndex === undefined) subResult = subResults[i][currentIndex]
        else if (Array.isArray(currentIndex[0])) {
          subResult = currentIndex.flatMap(
            currentIndexPart =>
              subResults[i][currentIndexPart.slice(0, parsedPaths[i][3][2][1])],
          )
        } else
          subResult =
            subResults[i][currentIndex.slice(0, parsedPaths[i][3][2][1])]

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

      results[j] = subResults[i][indexes[j][`${parsedPaths[i][3][2][0]}`]].map(
        subResult => ({
          ...results[j],
          [parsedPaths[i][0]]: subResult[0],
        }),
      )

      indexes[j] = subResults[i][indexes[j][`${parsedPaths[i][3][2][0]}`]].map(
        subResult => ({
          ...indexes[j],
          [i]: subResult[1],
        }),
      )
    }

    if (parsedPaths[i][3][1]) {
      results = results.flat()
      indexes = indexes.flat()
    }
  }

  return results
}

function _getSubResults(data, parsedPaths) {
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
          const key = `${subResults[i][1][j].slice(0, parsedPaths[i][3][2][1])}`

          if (!temp[key]) {
            temp[key] = [[subResults[i][0][j], subResults[i][1][j]]]
            continue
          }

          temp[key].push([subResults[i][0][j], subResults[i][1][j]])
          continue
        }

        for (let k = 0; k < subResults[i][1][j].length; k++) {
          const key = `${subResults[i][1][j][k].slice(0, parsedPaths[i][3][2][1])}`

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

// TODO: move to parser-phase
function _getFlatDepthNeeded(parsedPaths) {
  return parsedPaths
    .map(parsedPath => pathAnalyzer.pathDepth(parsedPath[1]) - 2)
    .map(depth => (depth < 0 ? 0 : depth))
}

export default {
  tabletize,
}
