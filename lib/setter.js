import expressionParser from './expression-parser.js'
import parser from './parser.js'

const INTEGER = ''
const PROPERTY = 'e'
const MULTI = 'f'
const RULE = 'g'
const TABLE = 'h'

function set(object, path, value) {
  if (value === undefined) return object
  const parsedPath = Array.isArray(path) ? path : parser.parse(path)
  _validate(object, parsedPath[0])

  const valueList = Array.isArray(value) ? value : [value]
  const lastPath = parser._safe(parsedPath[parsedPath.length - 1])
  const ignoreAddingTemp = getIgnoreAddingTemp(parsedPath)
  let earlyReturn = false
  let previous = object
  let temp = []
  let key = 0
  let tempCopy = temp

  for (let i = 0, len = parsedPath.length; i < len - 1; i++) {
    const currentPath = parser._safe(parsedPath[i])
    temp = getNewDefaultObject(parsedPath, i)

    switch (getType(currentPath)) {
      case INTEGER:
        key = getIndex(previous, currentPath)
        earlyReturn = setTemp(previous, key, ignoreAddingTemp, temp)
        if (earlyReturn) return object
        previous = previous[key]
        break
      case parser.ARRAY_ADD:
        for (let j = 0, len = valueList.length; j < len; j++) {
          tempCopy = JSON.parse(JSON.stringify(temp)) // TODO: check if better way
          previous.push(tempCopy)
          set(tempCopy, parsedPath.slice(i + 1), valueList[j])
        }
        return object
      case parser.ARRAY_ALL:
      case parser.ARRAY_UN_FLAT:
        previous.length = 0
        for (let j = 0, len = valueList.length; j < len; j++) {
          set(previous, [j, ...parsedPath.slice(i + 1)], valueList[j])
        }
        return object
      case parser.ARRAY_INDEXES:
        for (const j of parsedPath[i + 1]) {
          set(previous, [j, ...parsedPath.slice(i + 2)], value)
        }
        return object
      case parser.ARRAY_REPLACE:
        for (let j = 0, len = previous.length; j < len; j++) {
          tempCopy = JSON.parse(JSON.stringify(temp))
          earlyReturn = setTemp(previous, j, ignoreAddingTemp, tempCopy)
          if (earlyReturn) continue
          set(previous, [j, ...parsedPath.slice(i + 1)], value)
        }
        return object
      case PROPERTY:
        earlyReturn = setTemp(previous, currentPath, ignoreAddingTemp, temp)
        if (earlyReturn) return object
        previous = previous[currentPath]
        break
      case RULE:
        addRulePaths(previous, currentPath.rule)
    }
  }

  setLastValue(lastPath, value, previous, valueList)
  return object
}

function getType(currentPath) {
  if (Number.isInteger(currentPath)) return INTEGER
  if (currentPath === parser.ARRAY_ALL) return parser.ARRAY_ALL
  if (currentPath === parser.ARRAY_INDEXES) return parser.ARRAY_INDEXES
  if (currentPath === parser.ARRAY_ADD) return parser.ARRAY_ADD
  if (currentPath === parser.ARRAY_REPLACE) return parser.ARRAY_REPLACE
  if (currentPath === parser.OBJECT_UN_FLAT) return parser.OBJECT_UN_FLAT
  if (currentPath === parser.ARRAY_UN_FLAT) return parser.ARRAY_UN_FLAT
  if (typeof currentPath === 'string') return PROPERTY
  if (typeof currentPath === 'object') {
    if (currentPath.rule) return RULE
    if (currentPath.multi) return MULTI
    if (currentPath.table) return TABLE
  }
  return RULE
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
  const firstPathType = getType(firstPath)

  if (arrayType(firstPathType) && !Array.isArray(object)) {
    throw new Error('previous was not a list')
  }
  if (objectType(firstPathType) && !isObjectLike(object)) {
    throw new Error('previous was not a object')
  }
}

function arrayType(pathType) {
  return (
    pathType === INTEGER ||
    pathType === parser.ARRAY_ALL ||
    pathType === parser.ARRAY_INDEXES ||
    pathType === parser.ARRAY_ADD ||
    pathType === parser.ARRAY_REPLACE ||
    pathType === parser.ARRAY_UN_FLAT
  )
}

function isObjectLike(object) {
  return object && !Array.isArray(object) && typeof object === 'object'
}

function objectType(pathType) {
  return pathType === PROPERTY || pathType === MULTI
}

function getNewDefaultObject(parsedPath, i) {
  return arrayType(getType(parsedPath[i + 1])) ? [] : {}
}

function getIgnoreAddingTemp(parsedPath) {
  for (let i = 0, len = parsedPath.length; i < len; i++)
    if (parsedPath[i] === parser.ARRAY_REPLACE) return true

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

function setLastValue(lastPath, value, previous, valueList) {
  if (Number.isInteger(lastPath)) {
    previous[getIndex(previous, lastPath)] = value
  } else if (lastPath === parser.ARRAY_ADD) {
    previous.push(...valueList)
  } else if (lastPath === parser.ARRAY_ALL) {
    previous.splice(0, previous.length, ...valueList)
  } else if (lastPath === parser.ARRAY_UN_FLAT) {
    previous.splice(0, previous.length, ...valueList)
  } else if (lastPath === parser.ARRAY_REPLACE) {
    // if (typeof previous.keys !== 'function') { // TODO: check this
    //   throw new Error('not implemented yet')
    // }
    Array.from(previous.keys()).forEach(key => {
      previous[key] = value
    })
  } else if (lastPath === parser.OBJECT_UN_FLAT) {
    Object.entries(value).forEach(([path, subValue]) => {
      set(previous, path, subValue)
    })
  } else if (typeof lastPath === 'string') {
    previous[lastPath] = value
  } else {
    const useValue = isObjectLike(value)
    for (let i = 0, len = lastPath.multi[1].length; i < len; i++) {
      set(
        previous,
        lastPath.multi[1][i],
        useValue ? value[lastPath.multi[0][i]] : valueList[i],
      )
    }
  } // TODO: add support for reverse-tabletize
}

export default {
  set,
}
