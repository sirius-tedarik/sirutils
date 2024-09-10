import { createSyncSchema } from '@sirutils/schema'

import { unwrap } from '@sirutils/core'
import { wizard } from '../wizard'

const testSchema = createSyncSchema({
  name: 'string',
})

type Test = Sirutils.Schema.Extract<typeof testSchema>

const testService = await wizard.api.service({
  name: 'tests',
  version: '0.1.0',
  description: 'service for tests',

  actions: {
    create: (test: Test) => {
      unwrap(testSchema(test))

      return 'sa'
    },
    update: (test: Test) => {
      unwrap(testSchema(test))
    },
  },
})

declare global {
  // biome-ignore lint/style/noNamespace: <explanation>
  namespace Sirutils {
    interface WizardServices {
      'tests@0.1.0': typeof testService
    }
  }
}
