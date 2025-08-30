import { getKey } from './path-stringifier.js'

const ARRAY_BRACKETS = '[]'
const DOT_NOTATION = '.'

export function analyze(object) {
  if (typeof object !== 'object') return []
  return Array.from(_analyze(object)).sort(sorter)
}

function _analyze(object) {
  const allKeys = new Set()
  const isArray = Array.isArray(object)
  const keys = isArray ? Array.from(object.keys()) : Object.keys(object)

  if (isArray && keys.length === 0) allKeys.add(ARRAY_BRACKETS)

  for (const rawKey of keys) {
    const key = isArray ? ARRAY_BRACKETS : getKey(rawKey)

    if (typeof object[rawKey] !== 'object' || object[rawKey] === null) {
      allKeys.add(key)
      continue
    }

    const deepKeys = _analyze(object[rawKey])
    if (deepKeys.size === 0) allKeys.add(key)

    for (const deepKey of deepKeys) {
      const dotNotation = deepKey[0] !== '[' ? DOT_NOTATION : ''
      allKeys.add(`${key}${dotNotation}${deepKey}`)
    }
  }

  return allKeys
}

function sorter(a, b) {
  const x = a.split(ARRAY_BRACKETS).filter(xa => xa !== '').length - 1
  const y = b.split(ARRAY_BRACKETS).filter(ya => ya !== '').length - 1

  if (x === y) return a.replaceAll('[', '') < b.replaceAll('[', '') ? -1 : 1
  return x - y
}
