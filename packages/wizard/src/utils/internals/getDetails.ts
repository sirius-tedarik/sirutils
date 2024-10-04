import mime from 'mime'
import { deepmerge } from '@sirutils/toolbox'
import { capsule, type BlobType } from '@sirutils/core'

import { wizardTags } from '../../tag'

export const getDetails = capsule((stream: NodeJS.ReadableStream, params: BlobType) => {
  if (!(stream as BlobType).path) {
    return {}
  }

  const filePath = (stream as BlobType).path
  const filename = filePath.split('/').at(-1) || filePath.split('\\').at(-1)

  return deepmerge.all([
    {},
    params ?? {},
    {
      filename,
      mimetype: mime.getType(filePath),
    },
  ]) as Sirutils.Wizard.StreamData['1']
}, wizardTags.getDetails)
