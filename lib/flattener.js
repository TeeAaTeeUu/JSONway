import pathStringifier from './path-stringifier.js'

const ARRAY_BRACKETS = '[]'

export function flattenAll(objects) {
  return objects.map(flatten)
}

function flatten(object) {
  return _flatten(object, true)
}

function _flatten(object) {
  const flat = {}
  let onlyNonObjects = true
  let onlySameObjectArray = true
  let seenDeep = false
  let firstSeenDeepkey = ''
  const isArray = Array.isArray(object)

  for (const key in object) {
    const escapedKey = pathStringifier.getKey(key)

    if (typeof object[key] !== 'object' || object[key] === null) {
      flat[escapedKey] = object[key]
      onlySameObjectArray = false
      continue
    }

    const deepFlatten = _flatten(object[key])
    seenDeep = true

    if (Array.isArray(deepFlatten)) {
      flat[escapedKey + ARRAY_BRACKETS] = deepFlatten
      onlySameObjectArray = false
      continue
    }

    onlyNonObjects = false
    const deepKeys = Object.keys(deepFlatten)

    if (isArray && onlySameObjectArray) {
      if (deepKeys.length !== 1) onlySameObjectArray = false
      else if (!firstSeenDeepkey) firstSeenDeepkey = deepKeys[0]
      else if (deepKeys[0] !== firstSeenDeepkey) onlySameObjectArray = false

      if (firstSeenDeepkey.split(ARRAY_BRACKETS).length > 2)
        onlySameObjectArray = false
    }

    if (deepKeys.length === 0) flat[escapedKey + '{}'] = ''

    if (_multiColumnBetter(deepFlatten)) {
      const key = `${escapedKey}{${Object.keys(deepFlatten).join(',')}}`
      flat[key] = Object.values(deepFlatten)
      continue
    }

    for (const deepKey of deepKeys) {
      const preKey = deepKey[0] === '[' ? escapedKey : `${escapedKey}.`
      flat[preKey + deepKey] = deepFlatten[deepKey]
    }
  }

  if (onlyNonObjects && isArray) {
    if (seenDeep) {
      return { '[][]': Object.values(flat) }
    }
    return Object.values(flat)
  }

  if (isArray && onlySameObjectArray && firstSeenDeepkey) {
    const combinedDeepKey = `${ARRAY_BRACKETS}${firstSeenDeepkey[0] !== '[' ? '.' : ''}${firstSeenDeepkey}`
    const values = Object.values(flat)

    return { [combinedDeepKey]: values }
  }

  return flat
}

function _multiColumnBetter(object) {
  let keysLength = 0
  let valueLength = 0

  const keys = Object.keys(object)
  if (keys.length <= 1 || keys.length > 6) return false

  for (const key of keys) {
    if (valueLength > 40) return false
    if (keysLength > 70) return false
    if (key.includes('[')) return false
    if (key.includes('{')) return false

    keysLength += key.length

    valueLength +=
      typeof object[key] === 'string'
        ? object[key].length
        : object[key].toString().length
  }

  if (keysLength < valueLength) return false
  return true
}

export default {
  flatten,
  flattenAll,
}
