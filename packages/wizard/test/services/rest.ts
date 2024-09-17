import type { BlobType } from '@sirutils/core'
import { wizard } from '../wizard'

const testService = await wizard.api.service({
  name: 'rest',
  version: '0.1.1',
  description: 'rest api',

  actions: {
    foo: (_req: BlobType, res: BlobType) => {
      res.end('foo')
    },
  },

  settings: {
    http: {
      foo: ['GET'],
    },
  },
})

declare global {
  // biome-ignore lint/style/noNamespace: <explanation>
  namespace Sirutils {
    interface WizardServices {
      'tests@0.1.1': typeof testService
    }
  }
}
