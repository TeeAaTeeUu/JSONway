import { _safe } from './parser.js'

export const IS_INT_REGEX = /^(-|\+)?(?:([1-9]+[0-9]*)|0)$/

export function cast(value) {
  if (value === undefined) return value
  else if (IS_INT_REGEX.test(value)) {
    const number = Number.parseInt(value, 10)
    return Number.isSafeInteger(number) ? number : value
  }

  const valueLowerCase = value.trim().toLowerCase()

  if (valueLowerCase === 'true') return true
  else if (valueLowerCase === 'false') return false
  else if (valueLowerCase === 'null') return null

  return _safe(value)
}

export default {
  cast,
}
