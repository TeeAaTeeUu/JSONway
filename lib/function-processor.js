import { OBJECT_PROPERTY, parse } from './parser.js'

const SIZE = 'size'
const MAX = 'max'
const MIN = 'min'
const FLOOR = 'floor'
const CEIL = 'ceil'
const ROUND = 'round'
const TRUNC = 'trunc'

export function parseFunction(pipe) {
  const parsedPipes = parse(pipe)

  for (let i = 0; i < parsedPipes.length; i++)
    if (parsedPipes[i++] === OBJECT_PROPERTY)
      parsedPipes[i] = parsedPipes[i].toLowerCase()

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
