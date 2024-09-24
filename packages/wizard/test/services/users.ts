import { unwrap } from '@sirutils/core'

import { parsePlainTextFile } from '../../src/utils/parsers'
import { wizard } from '../wizard'
import { logger } from '../../src/internal/logger'

const usersService = await wizard.api.service({
  name: 'users',
  version: '0.1.1',
  description: 'users api',

  actions: {
    create: wizard.api.createAction(
      {
        body: {
          name: 'string',
        },
        queries: {
          id: 'string',
        },
        rest: true,
        stream: true,
        multipart: true,
      },
      async ctx => {
        if (ctx.streams) {
          for (const [stream, options] of ctx.streams) {
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            logger.log(unwrap(await parsePlainTextFile(stream!)), options)
          }
        }

        return 'as' as const
      }
    ),
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
