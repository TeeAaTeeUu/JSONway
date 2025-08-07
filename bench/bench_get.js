import { run, bench, summary } from 'mitata'
import { _readFile } from '../test/_utils.js'

import { get } from '../lib/getter.js'
import { search } from '@jmespath-community/jmespath'
import { search as searchOrig } from 'jmespath'
import { JSONPath } from 'jsonpath-plus'

const babelFiles = JSON.parse(await _readFile('../bench/babel_files.json'))
const paths = JSON.parse(await _readFile('../bench/babel_files_paths.json'))
const JSONpaths = paths.map(path => '$.' + path.replaceAll('[]', '[*]'))

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

    for (let i = 0; i < paths.length; i++) {
      const value = search(babelFiles, paths[i])
      count += value.length
    }

    count
  })

  bench('jmespath', function () {
    let count = 0

    for (let i = 0; i < paths.length; i++) {
      const value = searchOrig(babelFiles, paths[i])
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
})

await run()
