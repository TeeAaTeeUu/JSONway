import { STRING } from './_types.js'
import { _safe } from './parser.js'

export const SINGLE_QUOTE = "'"
export const DOUBLE_QUOTE = '"'
export const TWO_SINGLE_QUOTES = "''"
export const TWO_DOUBLE_QUOTES = '""'

export const NULL = 'null'
export const TRUE = 'true'
export const FALSE = 'false'

const MINUS_CHAR = '-'.charCodeAt(0)
const PLUS_CHAR = '+'.charCodeAt(0)
const ZERO_CHAR = '0'.charCodeAt(0)
const NINE_CHAR = '9'.charCodeAt(0)

export function cast(value) {
  if (value === undefined) return value

  const trimValue = value.trim()

  if (isInteger(trimValue)) {
    const number = Number.parseInt(trimValue, 10)
    if (number === 0) return 0
    return Number.isSafeInteger(number) ? number : trimValue
  }

  const valueLowerCase = trimValue.toLowerCase()

  if (valueLowerCase === TRUE) return true
  else if (valueLowerCase === FALSE) return false
  else if (valueLowerCase === NULL) return null

  return _safe(trimValue)
}

export function isInteger(value) {
  if (typeof value !== STRING) return false

  const length = value.length
  let i = 0

  if (value.charCodeAt(0) === MINUS_CHAR || value.charCodeAt(0) === PLUS_CHAR)
    if (length === 1) return false
    else i++
  if (value.charCodeAt(i) === ZERO_CHAR && length !== i + 1) return false

  for (; i < length; i++)
    if (value.charCodeAt(i) < ZERO_CHAR || value.charCodeAt(i) > NINE_CHAR)
      return false

  return true
}

export function getInteger(value) {
  if (!isInteger(value)) return

  const number = Number.parseInt(value, 10)
  return Number.isSafeInteger(number) ? number : value
}

export function isEscaped(value) {
  return value && (value[0] === SINGLE_QUOTE || value[0] === DOUBLE_QUOTE)
}

export function unscape(value) {
  const lastChar = value[value.length - 1]
  const endIsEscaped = lastChar === SINGLE_QUOTE || lastChar === DOUBLE_QUOTE
  const key = value.slice(1, endIsEscaped ? -1 : undefined)

  if (value[0] === SINGLE_QUOTE) {
    if (value.indexOf(TWO_SINGLE_QUOTES) === -1) return key
    else return _safe(key.replaceAll(TWO_SINGLE_QUOTES, SINGLE_QUOTE))
  } else {
    if (value.indexOf(TWO_DOUBLE_QUOTES) === -1) return key
    else return _safe(key.replaceAll(TWO_DOUBLE_QUOTES, DOUBLE_QUOTE))
  }
}
