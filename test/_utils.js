import fs from 'node:fs/promises'

export async function _getJsonAsync(filePath) {
  return JSON.parse(await _readFile(filePath))
}

export async function _readFile(filePath, encoding) {
  const fullFilePath = new URL(filePath, import.meta.url)
  if (encoding) return await fs.readFile(fullFilePath, encoding)

  return await fs.readFile(fullFilePath)
}

export function _arrayOfObjects(arrayOfArrays) {
  const keys = arrayOfArrays[0]

  return arrayOfArrays
    .slice(1)
    .map(values =>
      Object.fromEntries(
        values
          .map((value, i) => [keys[i], value])
          .filter(entry => entry[1] !== undefined),
      ),
    )
}

// obfuscating JSON objects
export function _renameKeys(object) {
  const keyMap = {}
  let index = 0

  function traverse(value) {
    if (Array.isArray(value)) {
      return value.map(traverse)
    }

    if (value && typeof value === 'object') {
      const result = {}
      for (const key in value) {
        const newKey = keyMap[key] ?? (keyMap[key] = _getKey(index++))
        result[newKey] = traverse(value[key])
      }
      return result
    }

    return value
  }

  const newObject = traverse(object)
  const valueCount = {}

  return JSON.parse(
    JSON.stringify(newObject, function (key, value) {
      if (typeof value !== 'string' && typeof value !== 'number') return value
      if (typeof valueCount[key] === 'undefined') valueCount[key] = 1

      if (typeof value === 'number') return valueCount[key]++
      return key + valueCount[key]++
    }),
  )
}

function _getKey(index) {
  if (index < 26) {
    const letter = String.fromCharCode(97 + index)
    return letter + letter
  }

  const n2 = index - 26
  const index1 = Math.floor(n2 / 25)

  let index2 = n2 % 25
  index2 = index2 < index1 ? index2 : index2 + 1

  const letter1 = String.fromCharCode(97 + index1)
  const letter2 = String.fromCharCode(97 + index2)
  return letter1 + letter2
}
