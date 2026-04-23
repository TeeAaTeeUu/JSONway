import {
  CARRIAGE_RETURN,
  EMPTY,
  FORM_FEED,
  NEWLINE,
  NUMBER,
  OBJECT,
  SPACE,
  STRING,
  TAB,
} from './_types.js'
import {
  COMMA,
  EQUAL_SIGN,
  LARGER_THAN,
  PIPE,
  SEMICOLON,
} from './array-parser.js'
import {
  NULL,
  TRUE,
  FALSE,
  SINGLE_QUOTE,
  TWO_SINGLE_QUOTES,
} from './value-parser.js'

export function stringify(orig, forceQuotes = false) {
  if (orig === undefined) return EMPTY
  if (orig === null) return NULL
  if (orig === true) return TRUE
  if (orig === false) return FALSE

  const type = typeof orig
  if (type === NUMBER) {
    if (orig <= Number.MAX_SAFE_INTEGER) return `${orig}`
    else return orig.toLocaleString(undefined, { useGrouping: false })
  }

  let dirty = false
  let quotes = false
  let value = orig

  if (type === OBJECT) value = JSON.stringify(orig)
  else if (type !== STRING) return EMPTY

  for (let i = 0, len = value.length; i < len; i++) {
    switch (value[i]) {
      case SINGLE_QUOTE:
        dirty = true
        quotes = true
        break
      case SPACE:
      case TAB:
        if (i === 0 || i === len - 1) dirty = true
        break
      case CARRIAGE_RETURN:
      case NEWLINE:
      case FORM_FEED:
      case COMMA:
      case SEMICOLON:
      case PIPE:
      case EQUAL_SIGN:
      case LARGER_THAN:
        dirty = true
        break
    }

    if (dirty && quotes) break
  }

  if (quotes || forceQuotes)
    return `'${value.split(SINGLE_QUOTE).join(TWO_SINGLE_QUOTES)}'`
  return dirty ? `'${value}'` : value
}
