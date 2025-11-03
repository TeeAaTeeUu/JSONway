import { set } from './setter.js'

export function expand(object) {
  const result = {}
  for (const key of Object.keys(object)) set(result, key, object[key])
  return result
}

export function expandAll(listOfObjects) {
  return listOfObjects.map(object => expand(object))
}
