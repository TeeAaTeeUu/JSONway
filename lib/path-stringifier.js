import { ARRAY_ADD, ARRAY_ALL, ARRAY_REPLACE, ARRAY_UN_FLAT } from './parser.js'
import { stringifyExpression } from './expression-stringifier.js'

const numbersOnly = /^\d+$/u
const validIdentifier = /^[^[\],.'"\s]+$/u
const validEnoughIdentifier = /^[^[\],'"\s]+$/u

export function stringifyPath(parsedPath) {
  if (!Array.isArray(parsedPath)) return parsedPath

  const stringified = []

  for (const pathPart of parsedPath) {
    switch (typeof pathPart) {
      case 'number':
        stringified.push(`[${pathPart}]`)
        break
      case 'string':
        switch (pathPart) {
          case ARRAY_ALL:
            stringified.push('[]')
            break
          case ARRAY_ADD:
            stringified.push('[+]')
            break
          case ARRAY_REPLACE:
            stringified.push('[*]')
            break
          case ARRAY_UN_FLAT:
            stringified.push('[:]')
            break
          default:
            if (validIdentifier.test(pathPart)) {
              if (stringified.length) stringified.push('.')
              stringified.push(pathPart)
              break
            }

            if (validEnoughIdentifier.test(pathPart))
              stringified.push(`[${pathPart}]`)
            else stringified.push(`['${pathPart}']`)
            break
        }
        break
      case 'object':
        if (Array.isArray(pathPart?.[1]?.[0]))
          stringified.push(`{${pathPart[0].join(',')}}`)

        if (!pathPart.rule) break // TODO: add support for multi and tabletizer
        stringified.push(`(${stringifyExpression(pathPart.rule)})`)
    }
  }

  return stringified.join('')
}

export function getKey(key) {
  if (typeof key === 'number' || typeof key !== 'string') return `[${key}]`
  if (numbersOnly.test(key)) return `[${key}]`
  if (validIdentifier.test(key)) return key
  if (validEnoughIdentifier.test(key)) return `[${key}]`
  if (key.includes("'")) return `['${key.split("'").join("''")}']`
  return `['${key}']`
}

export default {
  getKey,
  stringifyPath,
}
