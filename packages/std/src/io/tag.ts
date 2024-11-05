import { Tags } from '../results'

export const ioTags = Tags.create('std/io')
  .add('not-found')
  .add('invalid-mime')

  // causes
  .add('read', '$read')
  .add('read-json', '$readJson')
