import { createSyncSchema } from '@sirutils/schema'

import { wizard } from '../wizard'
import { unwrap } from '@sirutils/core'

const userSchema = createSyncSchema({
  name: 'string',
})

type User = Sirutils.Schema.Extract<typeof userSchema>

const userService = await wizard.api.service({
  name: 'users',
  version: '0.1.0',
  description: 'service for users',

  actions: {
    create: (user: User) => {
      unwrap(userSchema(user))

      return 'sa'
    },
    update: (user: User) => {
      unwrap(userSchema(user))
    },
  },
})

declare global {
  // biome-ignore lint/style/noNamespace: <explanation>
  namespace Sirutils {
    interface WizardServices {
      'users@0.1.0': typeof userService
    }
  }
}
