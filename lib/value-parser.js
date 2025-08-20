import { _safe } from './parser.js'

export const IS_INT_REGEX = /^(-|\+)?(?:([1-9]+[0-9]*)|0)$/

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

export default {
  cast,
}
