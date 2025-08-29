import { parse, _safe } from './parser.js'
import {
  cast,
  isEscaped,
  unscape,
  SINGLE_QUOTE,
  DOUBLE_QUOTE,
} from './value-parser.js'

export const OBJECT_UN_FLAT = '{:}'
export const MULTI = '{}'

export function parseObject(path, startIndex) {
  const len = path.length
  let token = path[startIndex]

  if (token === '}' || startIndex >= len) return [[], startIndex]
  if (token === ':' && (path[startIndex + 1] === '}' || startIndex + 1 >= len))
    return [[OBJECT_UN_FLAT, true], startIndex]

  let i = startIndex
  let depth = 1
  let arrayDepth = 0
  let singleEscaped = false
  let doubleEscaped = false

  let start = startIndex
  let current = []
  let items = [current]

  for (; i < len; i++) {
    token = path[i]

    if (token === SINGLE_QUOTE && !doubleEscaped) singleEscaped = !singleEscaped
    else if (token === DOUBLE_QUOTE && !singleEscaped)
      doubleEscaped = !doubleEscaped
    else if (singleEscaped || doubleEscaped) continue

    if (token === '{') depth++
    else if (token === '}') {
      if (--depth === 0) {
        _finalize(path, current, start, i)
        if (current[0] === '') items.pop()
        start = i + 1
        break
      }
    } else if (token === '[') arrayDepth++
    else if (token === ']') arrayDepth--
    else if (depth === 1 && arrayDepth === 0) {
      if (token === ',') {
        _finalize(path, current, start, i)
        start = i + 1
        if (current[0] === '') items.pop()
        current = []
        items.push(current)
      } else if (token === ':') {
        current[0] = _unescape(path.slice(start, i).trim())
        start = i + 1
      } else if (token === '=') {
        current[1] = cast(path.slice(start, i))
        start = i + 1
      }
    }
  }

  if (start < i) {
    _finalize(path, current, start, i)
    if (current[0] === '') items.pop()
  }
  if (items.length === 0) return [[], startIndex]

  for (let j = 0; j < items.length; j++)
    if (_isPath(items[j][1])) items[j][1] = parse(items[j][1])
    else items[j][1] = [true, _unescape(items[j][1])]

  return [[MULTI, items], i]
}

function _finalize(path, current, start, i) {
  if (current[1]) current[2] = _unescape(cast(path.slice(start, i)))
  else current[1] = cast(path.slice(start, i))

  if (!current[0]) current[0] = _unescape(current[1])
  if (current[2] === undefined) current.length = 2
}

function _unescape(value) {
  if (!isEscaped(value)) return _safe(value)
  return unscape(value)
}

function _isPath(value) {
  return (
    typeof value === 'string' &&
    value[0] !== SINGLE_QUOTE &&
    value[0] !== DOUBLE_QUOTE
  )
}

export default {
  parseObject,
}
