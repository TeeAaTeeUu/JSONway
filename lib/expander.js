import { set } from './setter.js'

const ARRAY_BRACKETS = '[]'

export function expand(object) {
  const result = {}

  for (const key of Object.keys(object)) {
    if (object[key] === '' && key.endsWith(ARRAY_BRACKETS)) {
      set(result, key, [])
      continue
    }

    set(result, key, object[key])
  }

  return result
}

export function expandAll(listOfObjects) {
  return listOfObjects.map(object => expand(object))
}
