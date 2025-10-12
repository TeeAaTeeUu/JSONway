import { _safe } from './parser.js'

export const SINGLE_QUOTE = "'"
export const DOUBLE_QUOTE = '"'
const TWO_SINGLE_QUOTES = `${SINGLE_QUOTE}${SINGLE_QUOTE}`
const TWO_DOUBLE_QUOTES = `${DOUBLE_QUOTE}${DOUBLE_QUOTE}`

export function cast(value) {
  if (value === undefined) return value

  const trimValue = value.trim()

  if (isInteger(trimValue)) {
    const number = Number.parseInt(trimValue, 10)
    if (number === 0) return 0
    return Number.isSafeInteger(number) ? number : trimValue
  }

  const valueLowerCase = trimValue.toLowerCase()

  if (valueLowerCase === 'true') return true
  else if (valueLowerCase === 'false') return false
  else if (valueLowerCase === 'null') return null

  return _safe(trimValue)
}

export function isInteger(value) {
  if (typeof value !== 'string') return false

  let i = 0
  if (value[0] === '-' || value[0] === '+') i++
  if (value[i] === '0' && value[++i] !== undefined) return false

  for (let len = value.length; i < len; i++)
    switch (value[i]) {
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
      case '0':
        continue
      default:
        return false
    }

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
