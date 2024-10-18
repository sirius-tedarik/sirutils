// import fs from 'node:fs'
import { type BlobType, capsule, createActions } from '@sirutils/core'

import { logger } from '../../internal/logger'
import { createTag } from '../../internal/tag'
import { wizardTags } from '../../tag'

import type { LoggerInstance, ServiceAction } from 'moleculer'

export const middlewareActions = createActions(
  (context: Sirutils.Wizard.Context): Sirutils.Wizard.MiddlewareApi => ({
    createMiddleware(meta, rawHandler) {
      const middlewareLogger = logger.create({
        defaults: {
          tag: createTag(`middleware.${meta.name}`),
        },
      })

      const handler = capsule(
        rawHandler,
        `${wizardTags.middleware}#createMiddleware.handler.${meta.name}` as Sirutils.ErrorValues,
        context.$cause
      )

      const result: Sirutils.Wizard.MiddlewareSchema<BlobType, BlobType> = {
        logger: middlewareLogger,
        share: Array.from(new Set(meta.share ? meta.share : [])),
        handler,
      }

      const settings = context.api.middleware.settings

      if (meta.name) {
        if (settings.middlewareSchemas === undefined) {
          settings.middlewareSchemas = {}
        }

        settings.middlewareSchemas[meta.name] = result

        context.api.middleware.actions[meta.name] = handler as ServiceAction
      }

      return result
    },
    async processMiddlewares(actionCtx, middlewares) {
      if (middlewares.length === 0) {
        return { contiune: true }
      }

      let willContiune = true
      let returnedData: BlobType

      const share: Record<string, BlobType> = {}
      // @ts-ignore
      const interCtx: Sirutils.Wizard.MiddlewareContext<BlobType, BlobType, BlobType, BlobType> = {
        ...actionCtx,
        share,
      }

      const nextSymbol = Symbol('next-middleware')
      const settings = context.api.middleware.settings

      const shareKeys: string[] = middlewares.flatMap(middleware => {
        if (typeof middleware === 'string') {
          return settings.middlewareSchemas[middleware].share
        }
        return middleware.share
      })

      //biome-ignore lint/complexity/noForEach: <explanation>
      shareKeys.forEach(key => {
        if (!Object.hasOwn(share, key)) {
          Object.defineProperty(share, key, { writable: true })
        }
      })

      for (const middleware of middlewares) {
        if (typeof middleware === 'string') {
          const middlewareSchema = settings.middlewareSchemas[
            middleware
          ] as Sirutils.Wizard.MiddlewareSchema<keyof Sirutils.Wizard.ContextShare, BlobType>

          interCtx.logger = middlewareSchema.logger as LoggerInstance
          returnedData = await middlewareSchema.handler(interCtx, nextSymbol)
        } else {
          interCtx.logger = middleware.logger as LoggerInstance
          returnedData = await middleware.handler(interCtx, nextSymbol)
        }

        if (returnedData !== nextSymbol) {
          willContiune = false
          break
        }
      }

      actionCtx.share = shareKeys.reduce(
        (acc, key) => {
          if (share[key] !== undefined) {
            acc[key] = share[key]
          }
          return acc
        },
        {} as Record<string, BlobType>
      )

      return willContiune ? { contiune: willContiune } : { contiune: willContiune, returnedData }
    },
  }),
  wizardTags.middleware
)
