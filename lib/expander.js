import setter from './setter.js'

const ARRAY_BRACKETS = '[]'

function expand(object) {
  const result = {}

  for (const key of Object.keys(object)) {
    if (object[key] === '' && key.endsWith(ARRAY_BRACKETS)) {
      setter.set(result, key, [])
      continue
    }

    setter.set(result, key, object[key])
  }

  return result
}

function expandAll(listOfObjects) {
  return listOfObjects.map(object => expand(object))
}

export default {
  expand,
  expandAll,
}
