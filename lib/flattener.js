import { ARRAY_ALL } from './array-parser.js'
import { MULTI } from './object-parser.js'
import { OBJECT_PROPERTY } from './parser.js'
import { getKey } from './path-stringifier.js'

export function flatten(object) {
  const flat = {}

  let isArray = Array.isArray(object)

  let depth = 0
  const path = ['']
  const pathKeys = [isArray ? object.length : Object.keys(object)]
  const deepObjects = [object]
  const keysIndex = [0]

  let keyIndex = keysIndex[0]
  let keys = pathKeys[depth]
  let key = isArray ? keyIndex : keys[keyIndex]
  let keysLength = isArray ? keys : keys.length
  let currentObject = deepObjects[0]
  let current = isArray ? currentObject[0] : currentObject[keys[0]]

  while (true) {
    if (keyIndex >= keysLength) {
      if (keyIndex === 0) {
        if (isArray) flat[path[depth] + ARRAY_ALL] = []
        else flat[path[depth] + MULTI] = ''
      }

      if (--depth < 0) break

      path.pop()
      pathKeys.pop()
      keysIndex.pop()
      deepObjects.pop()

      keyIndex = keysIndex[depth]
      keys = pathKeys[depth]
      if (typeof keys === 'number') {
        isArray = true
        key = keyIndex
        keysLength = keys
      } else {
        isArray = false
        key = keys[keyIndex]
        keysLength = keys.length
      }
      currentObject = deepObjects[depth]
      current = currentObject[key]

      continue
    }

    if (isArray && keyIndex === 0) {
      const valueArray = _tryValueArray(currentObject)

      if (valueArray !== false) {
        flat[path[depth] + valueArray[0]] = valueArray[1]
        keyIndex = keysLength
        continue
      }
    }

    if (typeof current !== 'object' || current === null) {
      flat[path[depth] + _getKey(key, path.length)] = current

      keyIndex = ++keysIndex[depth]
      key = isArray ? keyIndex : keys[keyIndex]
      current = currentObject[key]
      continue
    }

    path.push(path[depth] + _getKey(key, path.length))

    keyIndex = 0
    currentObject = current

    if (Array.isArray(current)) {
      isArray = true
      keys = current.length
      key = keyIndex
      keysLength = keys
    } else {
      isArray = false
      keys = Object.keys(current)
      key = keys[keyIndex]
      keysLength = keys.length
    }

    current = currentObject[key]

    pathKeys.push(keys)
    keysIndex.push(keyIndex)
    deepObjects.push(currentObject)

    keysIndex[depth]++
    depth++
  }

  return flat
}

function _getKey(key, pathLength) {
  if (typeof key === 'number') return `[${key}]`

  let tempKey = getKey(key)
  if (pathLength > 1 && tempKey[0] !== '[') return OBJECT_PROPERTY + tempKey

  return tempKey
}

function _tryValueArray(topList) {
  const path = []
  const values = []
  let currentKeys = []
  let current = {}

  for (let i = 0; i < topList.length; i++) {
    let depth = 0
    current = topList[i]

    while (true) {
      if (Array.isArray(current)) return false

      if (typeof current === 'object' && current !== null) {
        currentKeys = Object.keys(current)
        if (Object.keys(current).length > 1) return false

        if (i === 0) path.push(currentKeys[0])
        else if (path[depth] !== currentKeys[0]) return false

        current = current[currentKeys[0]]

        depth++
        continue
      }

      if (depth !== path.length) return false
      values.push(current)
      break
    }
  }

  for (let i = 0; i < path.length; i++) path[i] = _getKey(path[i], 2)

  return [ARRAY_ALL + path.join(''), values]
}
