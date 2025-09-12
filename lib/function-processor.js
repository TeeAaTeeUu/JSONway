import { OBJECT_PROPERTY, parse } from './parser.js'

const SIZE = 'size'
const MAX = 'max'
const MIN = 'min'
const FLOOR = 'floor'
const CEIL = 'ceil'
const ROUND = 'round'
const TRUNC = 'trunc'
const AVG = 'avg'
const SORT = 'sort'
const REVERSE = 'reverse'

const ALT_SIZE_1 = 'length'
const ALT_SIZE_2 = 'len'
const ALT_SIZE_3 = 'count'
const ALT_AVG_1 = 'average'

export function parseFunction(pipe) {
  const parsedPipes = parse(pipe.toLowerCase())

  for (let i = 0; i < parsedPipes.length; i++) {
    if (parsedPipes[i++] !== OBJECT_PROPERTY) continue

    switch (parsedPipes[i]) {
      case ALT_SIZE_1:
      case ALT_SIZE_2:
      case ALT_SIZE_3:
        parsedPipes[i] = SIZE
        continue
      case ALT_AVG_1:
        parsedPipes[i] = AVG
    }
  }

  return parsedPipes
}

export function processFunction(result, parsedPipes) {
  let output = result

  for (let i = 0; i < parsedPipes.length; i++) {
    if (parsedPipes[i++] !== OBJECT_PROPERTY) continue

    switch (parsedPipes[i]) {
      case SIZE:
        output = size(output)
        continue
      case MAX:
        output = max(output)
        continue
      case MIN:
        output = min(output)
        continue
      case FLOOR:
        output = floor(output)
        continue
      case CEIL:
        output = ceil(output)
        continue
      case TRUNC:
        output = trunc(output)
        continue
      case ROUND:
        output = round(output)
        continue
      case AVG:
        output = avg(output)
        continue
      case SORT:
        output = sort(output)
        continue
      case REVERSE:
        output = reverse(output)
        continue
    }
  }

  return output
}

function size(input) {
  if (!Array.isArray(input) && typeof output !== 'string') return input
  return input.length
}

function max(input) {
  if (!Array.isArray(input)) return input

  let output = input[0]
  for (let i = 1; i < input.length; i++)
    if (input[i] > output) output = input[i]
  return output
}

function min(input) {
  if (!Array.isArray(input)) return input

  let output = input[0]
  for (let i = 1; i < input.length; i++)
    if (input[i] < output) output = input[i]
  return output
}

function floor(input) {
  if (typeof input !== 'number') return input
  return Math.floor(input)
}

function ceil(input) {
  if (typeof input !== 'number') return input
  return Math.ceil(input)
}

function trunc(input) {
  if (typeof input !== 'number') return input
  return Math.trunc(input)
}

function round(input) {
  if (typeof input !== 'number') return input
  return Math.round(input)
}

function avg(input) {
  if (!Array.isArray(input)) return input

  let sum = 0
  for (let i = 0; i < input.length; i++)
    if (typeof input[i] === 'number') sum += input[i]

  return sum / input.length
}

function sort(input) {
  if (!Array.isArray(input)) return input
  return input.toSorted((a, b) => {
    const typeA = typeof a
    const typeB = typeof b

    if (typeA === 'number' && typeB === 'number') return a - b
    if (typeA === 'string' && typeB === 'string') {
      if (a > b) return 1
      else if (a < b) return -1
      return 0
    }

    const stringA = `${a}`
    const stringB = `${b}`

    if (stringA > stringB) return 1
    else if (stringA < stringB) return -1
    return 0
  })
}

function reverse(input) {
  if (!Array.isArray(input)) return input
  return input.toReversed()
}
