import { type BlobType, createActionsAsync, unwrap } from '@sirutils/core'

import { ENV } from '../../internal/consts'
import { importErrorConfig } from '../../internal/error-config'
import { hashError } from '../../internal/utils'
import { wizardTags } from '../../tag'
import { Router } from '../../utils/router'
import { serviceApi } from '../internal/service'

export const baseApi = createActionsAsync(async (context: Sirutils.Wizard.PluginContext) => {
  const router = new Router(context)
  const errors = unwrap(await importErrorConfig())

  return {
    router,
    service: (name, version, validator) => unwrap(serviceApi(context, name, version, validator)),
    errors,

    listen: () => {
      return Bun.serve({
        fetch: async (req: WizardRequest<BlobType>) => {
          req.datas = []
          req.url

          const result = await router.match(req)

          if (result.isErr()) {
            const hashed = hashError(result.error)
            const stringified =
              ENV.errors === 'hash' ? JSON.stringify(hashed) : result.error.stringify()

            if (ENV.errors === 'hash') {
              context.api.errors.discover(hashed.code, result.error)
            }

            if (result.error.name === wizardTags.badUrl) {
              return new Response(stringified, {
                status: 404,
              })
            }

            return new Response(stringified, {
              status: 503,
            })
          }

          if (result.value instanceof Response) {
            return result.value
          }

          return new Response(JSON.stringify(result.value))
        },
        websocket: {
          // biome-ignore lint/suspicious/noEmptyBlockStatements: <explanation>
          message() {},
        },
      })
    },
  } satisfies Sirutils.Wizard.PublicApis.Base
}, wizardTags.baseApi)
