import { wizard } from '../wizard'

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
        rest: true,
        stream: true,
        multipart: true,
      },
      ctx => {
        if (ctx.streams) {
          // biome-ignore lint/suspicious/noConsole: <explanation>
          console.log(ctx.streams)
        }

        return 'sa' as const
      }
    ),
  },

  created: ctx => {
    ctx.logger.info('hi')

    return true
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
