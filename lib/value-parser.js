import { _safeCheck } from './parser.js'

export const IS_INT_REGEX = /^(-|\+)?(?:([1-9]+[0-9]*)|0)$/

export function cast(value) {
  if (value === undefined) return value
  if (IS_INT_REGEX.test(value)) {
    const number = Number.parseInt(value, 10)
    return Number.isSafeInteger(number) ? number : value
  }

  const valueLowerCase = value.toLowerCase()
  _safeCheck(value)

  if (valueLowerCase === 'true') return true
  if (valueLowerCase === 'false') return false
  if (valueLowerCase === 'null') return null

  return value
}

export default {
  cast,
}
