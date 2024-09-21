import { syncSchema } from '@sirutils/schema'
import { wizard } from '../wizard'
import { ProjectError } from '@sirutils/core'

const users = syncSchema({
  name: {
    type: 'string',
  },
})

const usersService = await wizard.api.service({
  name: 'users',
  version: '0.1.1',
  description: 'users api',

  actions: {
    foo: () => {
      return ProjectError.create('?example', 'example').throw()

      return 'bar'
    },
  },
})

declare global {
  // biome-ignore lint/style/noNamespace: <explanation>
  namespace Sirutils {
    interface WizardServices {
      'users@0.1.1': typeof usersService
    }
  }
}
