import { _safe } from './parser.js'

export const IS_INT_REGEX = /^(-|\+)?(?:([1-9]+[0-9]*)|0)$/
export const SINGLE_QUOTE = "'"
export const DOUBLE_QUOTE = '"'
const TWO_SINGLE_QUOTES = `${SINGLE_QUOTE}${SINGLE_QUOTE}`
const TWO_DOUBLE_QUOTES = `${DOUBLE_QUOTE}${DOUBLE_QUOTE}`

export function cast(value) {
  if (value === undefined) return value

  const trimValue = value.trim()

  if (IS_INT_REGEX.test(trimValue)) {
    const number = Number.parseInt(trimValue, 10)
    return Number.isSafeInteger(number) ? number : trimValue
  }

  const valueLowerCase = trimValue.toLowerCase()

  if (valueLowerCase === 'true') return true
  else if (valueLowerCase === 'false') return false
  else if (valueLowerCase === 'null') return null

  return _safe(trimValue)
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

export default {
  cast,
  isEscaped,
  unscape,
  SINGLE_QUOTE,
  DOUBLE_QUOTE,
}
