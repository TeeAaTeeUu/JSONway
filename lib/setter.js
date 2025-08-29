import expressionParser from './expression-parser.js'
import parser from './parser.js'

function set(object, path, value) {
  if (value === undefined) return object
  const parsedPath = Array.isArray(path) ? path : parser.parse(path)
  _validate(object, getNextSetOperation(parsedPath, 0))

  const lastPathIndex = parsedPath.length - 2

  // TODO: come up with a syntax for setting multiple values
  const valueList = Array.isArray(value) ? value : [value]

  const ignoreAddingTemp = getIgnoreAddingTemp(parsedPath)
  let earlyReturn = false
  let previous = object
  let temp = []
  let key = 0
  let tempCopy = temp

  for (let i = 0; i <= lastPathIndex; i++) {
    switch (parsedPath[i]) {
      case parser.ARRAY_INDEX:
      case parser.ARRAY_INDEX_NEGATIVE:
        key = getIndex(previous, parsedPath[i + 1])
        if (i === lastPathIndex) {
          previous[key] = value
          continue
        }

        temp = getNewDefaultObject(parsedPath, ++i + 1)
        earlyReturn = setTemp(previous, key, ignoreAddingTemp, temp)
        if (earlyReturn) return object
        previous = previous[key]
        continue
      case parser.ARRAY_REPLACE:
        previous.length = 0
        if (parsedPath[++i].length === 0) {
          previous.push(...valueList)
          continue
        }

        for (let j = 0, len = valueList.length; j < len; j++) {
          set(
            previous,
            [parser.ARRAY_INDEX, previous.length, ...parsedPath[i]],
            valueList[j],
          )
        }
        continue
      case parser.ARRAY_ALL: // practically ARRAY_ADD
      case parser.ARRAY_UN_FLAT:
        ++i
        for (let j = 0, len = valueList.length; j < len; j++) {
          set(
            previous,
            [parser.ARRAY_INDEX, previous.length, ...parsedPath[i]],
            valueList[j],
          )
        }
        continue
      case parser.ARRAY_INDEXES:
        if (parsedPath[++i].length === 1) {
          for (const j of parsedPath[i][0]) {
            object[j] = value // TODO: add test
          }
          continue
        }

        for (const j of parsedPath[i][0]) {
          set(
            previous,
            [parser.ARRAY_INDEX, j, ...parsedPath[i].slice(1)],
            value,
          )
        }
        continue
      case parser.ARRAY_FOREACH:
        if (parsedPath[++i].length === 0) {
          Array.from(previous.keys()).forEach(key => {
            previous[key] = value
          })
          continue
        }

        for (let j = 0, len = previous.length; j < len; j++) {
          temp = getNewDefaultObject(parsedPath[i], 0)
          tempCopy = JSON.parse(JSON.stringify(temp))
          earlyReturn = setTemp(previous, j, ignoreAddingTemp, tempCopy)
          if (earlyReturn) continue
          set(previous, [parser.ARRAY_INDEX, j, ...parsedPath[i]], value)
        }
        continue
      case parser.OBJECT_PROPERTY:
        if (i++ === lastPathIndex) {
          previous[parsedPath[i]] = value
          continue
        }

        temp = getNewDefaultObject(parsedPath, i + 1)
        earlyReturn = setTemp(previous, parsedPath[i], ignoreAddingTemp, temp)
        if (earlyReturn) return object
        previous = previous[parsedPath[i]]
        break
      case parser.RULE:
        addRulePaths(previous, parsedPath[++i])
        break
      case parser.MULTI:
        if (i++ !== lastPathIndex) break // TODO: should we do something?
        setMulti(value, parsedPath, lastPathIndex, previous, valueList)
        continue
      case parser.OBJECT_UN_FLAT:
        if (i++ !== lastPathIndex) break // TODO: should we do something?
        Object.entries(value).forEach(([path, subValue]) => {
          set(previous, path, subValue)
        })
        continue
    }
  }

  return object
}

function addRulePaths(previous, rule) {
  if (!Array.isArray(rule[0])) return
  if (rule[1] !== expressionParser.EQUAL) return
  set(previous, rule[0], rule[2])

  let i = 3

  while (rule[i] === expressionParser.AND) {
    if (rule[i + 1] !== expressionParser.OPEN_PARENTHESIS) break
    if (!Array.isArray(rule[i + 2])) break

    addRulePaths(previous, rule[i + 2])
    i += 3
  }
}

function setMulti(value, parsedPath, lastPathIndex, previous, valueList) {
  const useValue = isObjectLike(value)
  const multiValue = parsedPath[lastPathIndex + 1]
  for (let i = 0, len = multiValue.length; i < len; i++)
    set(
      previous,
      multiValue[i][1],
      useValue ? value[multiValue[i][0]] : valueList[i],
    )
}

function _validate(object, firstPath) {
  if (arrayType(firstPath) && !Array.isArray(object)) {
    throw new Error('previous was not a list')
  }
  if (objectType(firstPath) && !isObjectLike(object)) {
    throw new Error('previous was not a object')
  }
}

function arrayType(pathType) {
  return (
    pathType === parser.ARRAY_INDEX ||
    pathType === parser.ARRAY_INDEX_NEGATIVE ||
    pathType === parser.ARRAY_ALL ||
    pathType === parser.ARRAY_INDEXES ||
    pathType === parser.ARRAY_REPLACE ||
    pathType === parser.ARRAY_FOREACH ||
    pathType === parser.ARRAY_UN_FLAT
  )
}

function isObjectLike(object) {
  return (
    object &&
    !Array.isArray(object) &&
    typeof object === 'object' &&
    object !== null
  )
}

function objectType(pathType) {
  return pathType === parser.OBJECT_PROPERTY || pathType === parser.MULTI
}

function getNewDefaultObject(parsedPath, i) {
  return arrayType(getNextSetOperation(parsedPath, i)) ? [] : {}
}

function getIgnoreAddingTemp(parsedPath) {
  for (let i = 0, len = parsedPath.length; i < len; i++)
    if (parsedPath[i] === parser.ARRAY_FOREACH) return true

  return false
}

function getIndex(list, index) {
  const key = index < 0 ? list.length + index : index
  return key < 0 ? 0 : key
}

function setTemp(previous, path, ignoreAddingTemp, temp) {
  if (Array.isArray(temp) && !Array.isArray(previous[path])) {
    if (ignoreAddingTemp) return true
    previous[path] = temp
  }
  if (!Array.isArray(temp) && !isObjectLike(previous[path])) {
    if (ignoreAddingTemp) return true
    previous[path] = temp
  }

  return false
}

function getNextSetOperation(parsedPath, i) {
  let currentParsedPath = parsedPath
  let j = i

  while (
    currentParsedPath[j] === parser.RULE ||
    Array.isArray(currentParsedPath[j])
  ) {
    if (currentParsedPath[j] === parser.RULE) {
      j += 2
    } else if (Array.isArray(currentParsedPath[j])) {
      currentParsedPath = currentParsedPath[j]
      j = 0
    }
  }

  return parsedPath[j]
}

export default {
  set,
}
