import { wrap } from '@sirutils/core'

import { wizardTags } from '../tag'

export const parsePlainTextFile = wrap((stream: NodeJS.ReadableStream) => {
  return new Promise((resolve, reject) => {
    let result = ''

    stream.on('data', data => {
      result += data.toString()
    })

    stream.on('close', () => {
      resolve(result)
    })

    stream.on('error', err => {
      reject(err)
    })
  })
}, wizardTags.parserPlainText)
