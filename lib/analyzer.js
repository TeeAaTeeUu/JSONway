import { EMPTY, OBJECT } from './_types.js'
import { ARRAY_ALL } from './array-parser.js'
import { ESCAPED_OBJECT_PROPERTY_START, OBJECT_PROPERTY } from './parser.js'
import { getKey } from './path-stringifier.js'
import { SINGLE_QUOTE } from './value-parser.js'

export function analyze(object, sort = true) {
  if (typeof object !== OBJECT) return []

  const keys = _analyze(object)
  if (!sort) return Array.from(keys)
  return Array.from(keys).sort(sorter)
}

function _analyze(object) {
  const allKeys = new Set()
  const isArray = Array.isArray(object)
  const keys = isArray ? Array.from(object.keys()) : Object.keys(object)

  if (isArray && keys.length === 0) allKeys.add(ARRAY_ALL)

  for (const rawKey of keys) {
    const key = isArray ? ARRAY_ALL : getKey(rawKey)

    if (typeof object[rawKey] !== OBJECT || object[rawKey] === null) {
      allKeys.add(key)
      continue
    }

    const deepKeys = _analyze(object[rawKey])
    if (deepKeys.size === 0) allKeys.add(key)

    for (const deepKey of deepKeys) {
      const dotNotation =
        deepKey[0] !== ESCAPED_OBJECT_PROPERTY_START ? OBJECT_PROPERTY : EMPTY
      allKeys.add(`${key}${dotNotation}${deepKey}`)
    }
  }

  return allKeys
}

function sorter(a, b) {
  const x = a.split(ARRAY_ALL).filter(xa => xa !== EMPTY).length - 1
  const y = b.split(ARRAY_ALL).filter(ya => ya !== EMPTY).length - 1

  if (x === y) return _normalized(a) < _normalized(b) ? -1 : 1
  return x - y
}

function _normalized(value) {
  return value
    .replaceAll(ESCAPED_OBJECT_PROPERTY_START, EMPTY)
    .replaceAll(SINGLE_QUOTE, EMPTY)
}
