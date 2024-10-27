import { $fn, err } from '@sirutils/std/results'

import { users } from './data'
import { exampleTags } from '../tag'

export const $getUser = $fn((name: string) => {
  const found = users.find(user => user.name === name)

  if (!found) {
    return err(exampleTags.get('not-found'), 'user not found')
  }

  return found
}, exampleTags.get('get-user'))
