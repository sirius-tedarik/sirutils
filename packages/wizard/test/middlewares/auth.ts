import { wizard } from '../wizard'

export const auth = wizard.api.createMiddleware(
  {
    name: 'auth',
    share: ['token'],
  },
  (ctx, next) => {
    ctx.share.token = 'qwerty1234567890'
    return next
  }
)

declare global {
  // biome-ignore lint/style/noNamespace: <explanatiion>
  namespace Sirutils {
    // biome-ignore lint/style/noNamespace: <explanatiion>
    namespace Wizard {
      interface ContextShare {
        token: string
      }
    }

    interface WizardMiddlewares {
      auth: typeof auth
    }
  }
}
