import { type BlobType, forwardAsync, wrap, wrapAsync } from '@sirutils/core'
import type { customTypeCompiler } from '@sirutils/schema'

import { logger } from '../../internal/logger'
import { wizardTags } from '../../tag'

// TODO: implement head & options methods
// TODO: implement default handlers

export const serviceApi = wrap(
  <T>(
    context: Sirutils.Wizard.PluginContext,
    name: string,
    version: string,
    defaultValidator?: ReturnType<typeof customTypeCompiler>
  ) => {
    const boundMethods: string[] = []

    const makeHandler = (
      tag: string,
      cb: Sirutils.Wizard.RawHandler<T> | Sirutils.Wizard.RawHandlerDummy<T>,
      checks?: { after?: BlobType; before?: BlobType }
    ) => {
      return wrapAsync(
        async (ctx, req: WizardRequest<T>) => {
          if (checks?.before) {
            req.datas = (await forwardAsync(
              async () => await checks.before(await req.json()),
              wizardTags.badData
            )) as T[]
          }

          const result = await cb(ctx, req)

          if (!checks?.after || result instanceof Response) {
            return result
          }

          return checks.after(result)
        },
        `${tag}:${name}@${version}` as Sirutils.ErrorValues,
        wizardTags.serviceApi
      )
    }

    const checkIsRegistered = (method: string) => {
      if (boundMethods.includes(method)) {
        logger.warn(`${name}@${version} already has method ${method}`)

        return
      }

      boundMethods.push(method)
    }

    const api = {
      find: (
        cb,
        options = {
          after: true,
        }
      ) => {
        checkIsRegistered('find')

        context.api.router.add(
          'GET',
          `/services/${name}/${version}/paginate/:size/:page`,
          makeHandler('get-paginate', cb, {
            after: options.after === true ? defaultValidator : null,
          })
        )

        context.api.router.add(
          'GET',
          `/services/${name}/${version}/:id+`,
          makeHandler('get-by-id', cb, {
            after: options.after === true ? defaultValidator : null,
          })
        )

        return api
      },

      create: (
        cb,
        options = {
          before: defaultValidator,
        }
      ) => {
        checkIsRegistered('create')

        context.api.router.add(
          'POST',
          `/services/${name}/${version}`,
          makeHandler('create', cb, {
            before: options.before === true ? defaultValidator : options.before,
            after: options.after === true ? defaultValidator : null,
          })
        )

        return api
      },

      update: (
        cb,
        options = {
          before: defaultValidator,
        }
      ) => {
        checkIsRegistered('update')

        context.api.router.add(
          'PUT',
          `/services/${name}/${version}/:id+`,
          makeHandler('create', cb, {
            before: options.before === true ? defaultValidator : options.before,
            after: options.after === true ? defaultValidator : null,
          })
        )

        return api
      },

      patch: (
        cb,
        options = {
          before: defaultValidator,
        }
      ) => {
        checkIsRegistered('patch')

        context.api.router.add(
          'PATCH',
          `/services/${name}/${version}/:id+`,
          makeHandler('create', cb, {
            before: options.before === true ? defaultValidator : options.before,
            after: options.after === true ? defaultValidator : null,
          })
        )

        return api
      },

      delete: cb => {
        checkIsRegistered('delete')

        context.api.router.add(
          'DELETE',
          `/services/${name}/${version}/:id+`,
          makeHandler('create', cb)
        )

        return api
      },
    } as Sirutils.Wizard.InternalApis.Service<T>

    return api
  },
  wizardTags.serviceApi
)
