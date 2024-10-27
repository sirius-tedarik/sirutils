import { $try, err, ok } from '@sirutils/std/results'

import { exampleTags } from '../tag'
import { $getUser } from './get-user'

export const $sayHi = (name?: string) =>
  $try(function* () {
    if (!name) {
      return err(exampleTags.get('invalid-arguments'), 'name should be defined')
    }

    const found = yield* $getUser(name)

    if (found.age < 18) {
      yield* err('?underage', 'under age')
    }

    return ok(`Hi ${found.name}-${found.age}`)
  }, exampleTags.get('say-hi'))
