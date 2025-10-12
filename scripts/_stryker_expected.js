import * as readline from 'node:readline'
import { stdin as input } from 'node:process'
import * as fs from 'node:fs'
import { argv, exit } from 'node:process'
import * as assert from 'node:assert/strict'

const STRYKER_EXPECT_FILE = 'stryker.expect.json'

const doSave = argv[2] === '--save'
let strykerExpectJson = ''

if (!doSave) {
  strykerExpectJson = JSON.parse(fs.readFileSync(STRYKER_EXPECT_FILE))
}

const lineReader = readline.createInterface({ input })
const lineStack = []
let currentGroup = []

lineReader.on('line', line => {
  if (currentGroup.length === 1) {
    const splits = line.split(':', 3)
    currentGroup.unshift(
      splits[0],
      Number.parseInt(splits[1]),
      Number.parseInt(splits[2]),
    )
    return
  }

  if (
    !line ||
    line.startsWith('Tests ran:') ||
    line.startsWith('Ran all tests')
  ) {
    currentGroup = []
    return
  }

  if (currentGroup.length) {
    currentGroup.push(line)
    return
  }

  if (!line.startsWith('[Survived]') && !line.startsWith('[NoCoverage]')) return

  currentGroup = [line]
  lineStack.push(currentGroup)
})

lineReader.on('close', () => {
  lineStack
    .sort((a, b) => {
      for (let i = 0; i < a.length && i < b.length; i++) {
        if (a[i] < b[i]) return -1
        else if (a[i] > b[i]) return 1
      }

      return 0
    })
    .map(group => group.splice(1, 2))

  if (doSave) {
    fs.writeFileSync(STRYKER_EXPECT_FILE, JSON.stringify(lineStack, null, 2))
    return
  }

  try {
    assert.deepEqual(lineStack, strykerExpectJson)
    // eslint-disable-next-line no-undef
    console.log('all good!')
  } catch (error) {
    // eslint-disable-next-line no-undef
    console.error(error.message)
    exit(1)
  }
})
