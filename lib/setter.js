import expressionParser from './expression-parser.js'
import parser from './parser.js'

function set(object, path, value) {
  if (value === undefined) return object
  const parsedPath = Array.isArray(path) ? path : parser.parse(path)
  _validate(object, getNextSetOperation(parsedPath, 0))

  const lastOperationLength = getLastOperationLength(parsedPath)
  const lastPathIndex = parsedPath.length - lastOperationLength

  // TODO: come up with a syntax for setting multiple values
  const valueList = Array.isArray(value) ? value : [value]

  const ignoreAddingTemp = getIgnoreAddingTemp(parsedPath)
  let earlyReturn = false
  let previous = object
  let temp = []
  let key = 0
  let tempCopy = temp

  for (let i = 0; i < lastPathIndex; i++) {
    switch (parsedPath[i]) {
      case parser.ARRAY_INDEX:
      case parser.ARRAY_INDEX_NEGATIVE:
        key = getIndex(previous, parsedPath[++i])
        temp = getNewDefaultObject(parsedPath, i + 1)
        earlyReturn = setTemp(previous, key, ignoreAddingTemp, temp)
        if (earlyReturn) return object
        previous = previous[key]
        break
      case parser.ARRAY_ADD:
        previous.length = 0
        for (let j = 0, len = valueList.length; j < len; j++) {
          set(
            previous,
            [parser.ARRAY_INDEX, previous.length, ...parsedPath.slice(i + 1)],
            valueList[j],
          )
        }
        return object
      case parser.ARRAY_ALL:
      case parser.ARRAY_UN_FLAT:
        for (let j = 0, len = valueList.length; j < len; j++) {
          set(
            previous,
            [parser.ARRAY_INDEX, previous.length, ...parsedPath.slice(i + 1)],
            valueList[j],
          )
        }
        return object
      case parser.ARRAY_INDEXES:
        for (const j of parsedPath[++i]) {
          set(
            previous,
            [parser.ARRAY_INDEX, j, ...parsedPath.slice(i + 1)],
            value,
          )
        }
        return object
      case parser.ARRAY_FOREACH:
        for (let j = 0, len = previous.length; j < len; j++) {
          temp = getNewDefaultObject(parsedPath, i + 1)
          tempCopy = JSON.parse(JSON.stringify(temp))
          earlyReturn = setTemp(previous, j, ignoreAddingTemp, tempCopy)
          if (earlyReturn) continue
          set(
            previous,
            [parser.ARRAY_INDEX, j, ...parsedPath.slice(i + 1)],
            value,
          )
        }
        return object
      case parser.OBJECT_PROPERTY:
        temp = getNewDefaultObject(parsedPath, ++i + 1)
        earlyReturn = setTemp(previous, parsedPath[i], ignoreAddingTemp, temp)
        if (earlyReturn) return object
        previous = previous[parsedPath[i]]
        break
      case parser.RULE:
        addRulePaths(previous, parsedPath[++i])
    }
  }

  setLastValue(parsedPath, lastPathIndex, value, previous, valueList)
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
    pathType === parser.ARRAY_ADD ||
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

function getLastOperationLength(parsedPath) {
  switch (parsedPath[parsedPath.length - 1]) {
    case parser.ARRAY_ALL:
    case parser.ARRAY_ADD:
    case parser.ARRAY_FOREACH:
    case parser.OBJECT_UN_FLAT:
      return 1
    default:
      return 2
  }
}

function getNextSetOperation(parsedPath, i) {
  let j = i

  if (parsedPath[i] === parser.RULE)
    do j += 2
    while (parsedPath[j] === parser.RULE)

  return parsedPath[j]
}

function setLastValue(parsedPath, lastPathIndex, value, previous, valueList) {
  const lastOperationType = parsedPath[lastPathIndex]

  if (
    lastOperationType === parser.ARRAY_INDEX ||
    lastOperationType === parser.ARRAY_INDEX_NEGATIVE
  ) {
    previous[getIndex(previous, parsedPath[lastPathIndex + 1])] = value
  } else if (lastOperationType === parser.ARRAY_ADD) {
    previous.push(...valueList) // TODO: rename and swap [+] and []
  } else if (lastOperationType === parser.ARRAY_ALL) {
    previous.splice(0, previous.length, ...valueList)
  } else if (lastOperationType === parser.ARRAY_UN_FLAT) {
    previous.splice(0, previous.length, ...valueList)
  } else if (lastOperationType === parser.ARRAY_FOREACH) {
    // if (typeof previous.keys !== 'function') { // TODO: check this
    //   throw new Error('not implemented yet')
    // }
    Array.from(previous.keys()).forEach(key => {
      previous[key] = value
    })
  } else if (lastOperationType === parser.OBJECT_UN_FLAT) {
    Object.entries(value).forEach(([path, subValue]) => {
      set(previous, path, subValue)
    })
  } else if (lastOperationType === parser.OBJECT_PROPERTY) {
    previous[parsedPath[lastPathIndex + 1]] = value
  } else if (lastOperationType === parser.MULTI) {
    const useValue = isObjectLike(value)
    const multiValue = parsedPath[lastPathIndex + 1]
    for (let i = 0, len = multiValue[1].length; i < len; i++) {
      set(
        previous,
        multiValue[1][i],
        useValue ? value[multiValue[0][i]] : valueList[i],
      )
    }
  } // TODO: add support for reverse-tabletize
}

export default {
  set,
}
