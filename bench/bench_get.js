import { run, bench, summary } from 'mitata'
import { _readFile } from '../test/_utils.js'

import { get } from '../lib/getter.js'
import { search } from '@jmespath-community/jmespath'
import { search as searchOrig } from 'jmespath'
import { JSONPath } from 'jsonpath-plus'
import jsonata from 'jsonata'

const babelFiles = JSON.parse(await _readFile('../bench/babel_files.json'))
const paths = JSON.parse(await _readFile('../bench/babel_files_paths.json'))

const jmesPaths = paths.map(path => {
  if (!path.startsWith('devDependencies') && !path.startsWith('scripts'))
    return path
  if (!path.includes('@') && !path.includes('-')) return path

  return (
    path
      .replace('devDependencies.', 'devDependencies.["')
      .replace('scripts.', 'scripts.["') + '"]'
  )
})
const JSONpaths = paths.map(path => '$.' + path.replaceAll('[]', '[*]'))
const JSONataPaths = paths.map(path => {
  if (!path.startsWith('devDependencies') && !path.startsWith('scripts'))
    return path
  if (!path.includes('@') && !path.includes('-')) return path

  return (
    path
      .replace('devDependencies.', 'devDependencies.$lookup("')
      .replace('scripts.', 'scripts.$lookup("') + '")'
  )
})

summary(() => {
  bench('JSONway', function () {
    let count = 0

    for (let i = 0; i < paths.length; i++) {
      const value = get(babelFiles, paths[i])
      count += value.length
    }

    count
  })

  bench('@jmespath-community/jmespath', function () {
    let count = 0

    for (let i = 0; i < jmesPaths.length; i++) {
      const value = search(babelFiles, jmesPaths[i])
      count += value.length
    }

    count
  })

  bench('jmespath', function () {
    let count = 0

    for (let i = 0; i < jmesPaths.length; i++) {
      const value = searchOrig(babelFiles, jmesPaths[i])
      count += value.length
    }

    count
  })

  bench('jsonpath-plus', function () {
    let count = 0

    for (let i = 0; i < JSONpaths.length; i++) {
      const value = JSONPath(JSONpaths[i], babelFiles)
      count += value.length
    }

    count
  })

  bench('jsonata', async function () {
    let count = 0

    for (let i = 0; i < JSONataPaths.length; i++) {
      const value = await jsonata(JSONataPaths[i]).evaluate(babelFiles)

      if (value === undefined) count++
      else count += value.length
    }

    count
  })
})

await run()
