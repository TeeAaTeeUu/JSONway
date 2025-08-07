import { glob, writeFile } from 'node:fs/promises'
import { parse as babelParse } from '@babel/parser'
import { _readFile } from '../test/_utils.js'

import { analyze } from '../lib/analyzer.js'

async function prepare() {
  const output = { files: [] }

  for await (const entry of glob('../**/*.js')) {
    const object = babelParse(await _readFile(entry, 'utf8'), {
      sourceType: 'module',
    })

    output.files.push({ name: entry, file: JSON.parse(JSON.stringify(object)) })
  }

  await writeFile('babel_files.json', JSON.stringify(output, null, 1))
  const paths = analyze(output)
  await writeFile('babel_files_paths.json', JSON.stringify(paths, null, 1))
}

await prepare()
