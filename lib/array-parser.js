import { parse, _safe } from './parser.js'
import { cast } from './value-parser.js'

const SINGLE_QUOTE = "'"
const DOUBLE_QUOTE = '"'

export const ARRAY_INDEX = '1'
export const ARRAY_INDEX_NEGATIVE = '-1'

export const OBJECT_PROPERTY = '.'

export const MULTI = '{}'
export const TABLE = '[{}]'
export const RULE = '()'

export const ARRAY_ALL = '[]'
export const ARRAY_UN_FLAT = '[:]'
export const ARRAY_INDEXES = '[_,]'
export const ARRAY_REPLACE = '[=]'
export const ARRAY_FOREACH = '[*]'
export const ARRAY_UNIQUE = '[#]'
export const ARRAY_FOREACH_UNIQUE = '[*#]'
export const ARRAY_UN_FLAT_UNIQUE = '[:#]'
export const OBJECT_UN_FLAT = '{:}'
const isInt = /^(-|\+)?([0-9]+)$/

export function parseArray(path, startIndex) {
  const len = path.length
  let i = startIndex
  let token = ''
  let depth = 1
  let objectDepth = 0
  let escaped = false
  let commas = []

  for (; i < len; i++) {
    token = path[i]

    if (token === SINGLE_QUOTE) escaped = !escaped
    else if (token === DOUBLE_QUOTE) escaped = !escaped
    else if (escaped) continue

    if (token === '[') depth++
    else if (token === ']') {
      if (--depth === 0) break
    } else if (token === '{') objectDepth++
    else if (token === '}') objectDepth--
    else if (token === ',' && depth === 1 && objectDepth === 0) commas.push(i)
  }

  if (commas.length === 0) {
    if (startIndex === i) return [[ARRAY_ALL, []], i]

    return [_getSingleArrayAccess(path.slice(startIndex, i)), i]
  }

  return [_parseList(path, startIndex, i, commas), i]
}

function _parseList(path, startIndex, endIndex, commas) {
  const list = []

  list.push(cast(path.slice(startIndex, commas[0])))
  for (let j = 1; j < commas.length; j++)
    list.push(cast(path.slice(commas[j - 1] + 1, commas[j])))
  list.push(cast(path.slice(commas[commas.length - 1] + 1, endIndex)))

  let allIntegers = true
  for (let j = 0; j < list.length; j++) {
    if (_isPath(list[j])) list[j] = parse(list[j])
    else if (typeof list[j] === 'string' && _isEscaped(list[j]))
      list[j] = _safe(list[j].slice(1, -1))
    else if (typeof list[j] === 'number') continue
    allIntegers = false
  }

  if (allIntegers) return [ARRAY_INDEXES, [list]]

  return list
}

function _isPath(value) {
  return (
    typeof value === 'string' &&
    value[0] !== SINGLE_QUOTE &&
    value[0] !== DOUBLE_QUOTE
  )
}

function _isEscaped(value) {
  return value[0] === SINGLE_QUOTE || value[0] === DOUBLE_QUOTE
}

function _getSingleArrayAccess(value) {
  if (_isEscaped(value)) return [OBJECT_PROPERTY, _safe(value.slice(1, -1))]

  if (isInt.test(value)) {
    const integer = Number.parseInt(value, 10)
    if (integer >= 0) return [ARRAY_INDEX, integer]
    else return [ARRAY_INDEX_NEGATIVE, integer]
  }

  switch (value) {
    case '=':
      return [ARRAY_REPLACE, []]
    case '*':
      return [ARRAY_FOREACH, []]
    case ':':
      return [ARRAY_UN_FLAT, []]
    case '#':
      return [ARRAY_UNIQUE, []]
    case ':#':
    case '#:':
      return [ARRAY_UN_FLAT_UNIQUE, []]
    case '*#':
    case '#*':
      return [ARRAY_FOREACH_UNIQUE, []]
    default:
      return [OBJECT_PROPERTY, _safe(value)]
  }
}

export default {
  parseArray,
}
