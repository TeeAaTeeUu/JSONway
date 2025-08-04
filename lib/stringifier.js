const QUOTE = "'"

export function stringify(orig) {
  if (orig === undefined) return ''
  if (orig === null) return 'null'
  if (orig === true) return 'true'
  if (orig === false) return 'false'

  const type = typeof orig
  if (type === 'number') {
    if (orig < 1e21) return `${orig}`
    else return orig.toLocaleString(undefined, { useGrouping: false })
  }

  let dirty = false
  let quotes = false
  let value = orig

  if (type === 'object') value = JSON.stringify(orig)
  else if (type !== 'string') value = `${orig}`

  for (let i = 0, len = value.length; i < len; i++) {
    switch (value[i]) {
      case QUOTE:
        dirty = true
        quotes = true
        break
      case ' ':
      case '\t':
        if (i === 0 || i === len - 1) dirty = true
        break
      case '\r':
      case '\n':
      case '\f':
        dirty = true
        break
    }

    if (dirty && quotes) break
  }

  if (quotes) return `"${value.split(QUOTE).join(QUOTE + QUOTE)}"`
  return dirty ? `"${value}"` : value
}

export default {
  stringify,
}
