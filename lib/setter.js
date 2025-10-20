import {
  ARRAY_ALL,
  ARRAY_FOREACH,
  ARRAY_INDEX,
  ARRAY_INDEX_NEGATIVE,
  ARRAY_INDEXES,
  ARRAY_REPLACE,
  ARRAY_UN_FLAT,
} from './array-parser.js'
import { AND, EQUAL, OPEN_PARENTHESIS, RULE } from './expression-parser.js'
import { MULTI, OBJECT_UN_FLAT } from './object-parser.js'
import { OBJECT_PROPERTY, parse } from './parser.js'
import { pathHasArrayForEach } from './path-analyzer.js'

export function set(object, path, value) {
  if (value === undefined) return object
  const parsedPath = Array.isArray(path) ? path : parse(path)
  _validate(object, getNextSetOperation(parsedPath, 0))

  const lastPathIndex = parsedPath.length - 2

  // TODO: come up with a syntax for setting multiple values
  const valueList = Array.isArray(value) ? value : [value]

  const ignoreAddingTemp = pathHasArrayForEach(parsedPath)
  let earlyReturn = false
  let previous = object
  let temp = []
  let key = 0

  for (let i = 0; i <= lastPathIndex; i++) {
    switch (parsedPath[i]) {
      case ARRAY_INDEX:
      case ARRAY_INDEX_NEGATIVE:
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
      case ARRAY_REPLACE:
        previous.length = 0
        if (parsedPath[++i].length === 0) {
          previous.push(...valueList)
          continue
        }

        for (let j = 0, len = valueList.length; j < len; j++)
          set(
            previous,
            [ARRAY_INDEX, previous.length, ...parsedPath[i]],
            valueList[j],
          )

        continue
      case ARRAY_ALL: // practically ARRAY_ADD
      case ARRAY_UN_FLAT:
        ++i
        for (let j = 0, len = valueList.length; j < len; j++)
          set(
            previous,
            [ARRAY_INDEX, previous.length, ...parsedPath[i]],
            valueList[j],
          )

        continue
      case ARRAY_INDEXES:
        for (const j of parsedPath[++i][0]) {
          if (parsedPath[i].length === 1) previous[j] = value
          else set(previous, [ARRAY_INDEX, j, ...parsedPath[i].slice(1)], value)
        }

        continue
      case ARRAY_FOREACH:
        i++
        for (let j = 0, len = previous.length; j < len; j++)
          set(previous, [ARRAY_INDEX, j, ...parsedPath[i]], value)

        continue
      case OBJECT_PROPERTY:
        if (i++ === lastPathIndex) {
          previous[parsedPath[i]] = value
          continue
        }

        temp = getNewDefaultObject(parsedPath, i + 1)
        earlyReturn = setTemp(previous, parsedPath[i], ignoreAddingTemp, temp)
        if (earlyReturn) return object
        previous = previous[parsedPath[i]]

        break
      case RULE:
        addRulePaths(previous, parsedPath[++i])
        break
      case MULTI:
        if (i++ !== lastPathIndex) break // TODO: should we do something?
        setMulti(value, parsedPath, lastPathIndex, previous, valueList)

        continue
      case OBJECT_UN_FLAT:
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
  if (rule[1] !== EQUAL) return
  set(previous, rule[0], rule[2])

  let i = 3

  while (rule[i] === AND) {
    if (rule[i + 1] !== OPEN_PARENTHESIS) break

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
    pathType === ARRAY_INDEX ||
    pathType === ARRAY_INDEX_NEGATIVE ||
    pathType === ARRAY_ALL ||
    pathType === ARRAY_INDEXES ||
    pathType === ARRAY_REPLACE ||
    pathType === ARRAY_FOREACH ||
    pathType === ARRAY_UN_FLAT
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
  return pathType === OBJECT_PROPERTY || pathType === MULTI
}

function getNewDefaultObject(parsedPath, i) {
  return arrayType(getNextSetOperation(parsedPath, i)) ? [] : {}
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
  let j = i

  while (parsedPath[j] === RULE) j += 2
  return parsedPath[j]
}
