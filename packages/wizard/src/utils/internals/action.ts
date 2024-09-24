import { type BlobType, capsule, createActions, group, unwrap } from '@sirutils/core'
import { createAsyncSchema } from '@sirutils/schema'
import { isRawObject, isStream } from '@sirutils/toolbox'
import formidable from 'formidable'
import fs from 'node:fs'

import { logger } from '../../internal/logger'
import { wizardTags } from '../../tag'
import { createTag } from '../../internal/tag'

export const actionActions = createActions(
  (context: Sirutils.Wizard.Context): Sirutils.Wizard.ActionApi => ({
    createAction: (meta, handler) => {
      const bodySchema = meta.body && createAsyncSchema(meta.body)
      const paramsSchema = meta.params && createAsyncSchema(meta.params)
      const queriesSchema = meta.queries && createAsyncSchema(meta.queries)

      if (typeof meta.cache === 'undefined') {
        meta.cache = false
      }

      if (typeof meta.stream === 'undefined') {
        meta.stream = false
      }

      if (typeof meta.multipart === 'undefined') {
        meta.multipart = false
      }

      return (serviceOptions, actionName) => {
        const serviceLogger = logger.create({
          defaults: {
            tag: createTag(`${serviceOptions.name}.${serviceOptions.version}.${actionName}`),
          },
        })

        return {
          ...((meta.rest ? { rest: meta.rest } : {}) as BlobType),
          cache: meta.cache,
          handler: capsule(
            // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Redundant
            async ctx => {
              const isParamsStream = isStream(ctx.params)

              if (ctx.params.req && meta.rest) {
                // @ts-ignore
                const subctx: Sirutils.Wizard.ActionContext<BlobType, BlobType, BlobType> = {
                  params: ctx.params.req.params,
                  body: ctx.params.req.body,
                  queries: ctx.params.req.query,
                  req: ctx.params.req,
                  res: ctx.params.res,
                  logger: serviceLogger,
                }

                let requiresCheck = true

                if (
                  !isParamsStream &&
                  isRawObject(subctx.body) &&
                  Object.keys(subctx.body).length === 0 &&
                  ctx.params.req.headers['content-type'] !== 'application/json'
                ) {
                  const form = formidable(isRawObject(meta.multipart) ? meta.multipart : {})

                  const multipart = await group(
                    () => form.parse(ctx.params.req),
                    wizardTags.parserMultipart
                  )

                  if (multipart.isOk()) {
                    subctx.body = Object.fromEntries(
                      Object.entries(multipart.value[0]).map(x => x.flat(1))
                    )
                    subctx.streams = Object.entries(multipart.value[1]).reduce(
                      (acc, [key, files]) => {
                        if (files) {
                          acc.push(
                            ...(files.map(file => {
                              return [
                                fs.createReadStream(file.filepath),
                                {
                                  filename: file.originalFilename,
                                  mimetype: file.mimetype,
                                  name: key,
                                },
                              ]
                            }) as BlobType)
                          )
                        }

                        return acc
                      },
                      [] as BlobType
                    )
                  } else if (meta.stream) {
                    subctx.body = {}
                    subctx.streams = [[(ctx.params as BlobType).req, {}]]

                    const merged = Object.assign(
                      {},
                      (ctx.params as BlobType).req.params,
                      (ctx.params as BlobType).req.query
                    )

                    if (bodySchema) {
                      unwrap(await bodySchema(merged))
                    }

                    requiresCheck = false
                  }
                }

                if (requiresCheck) {
                  if (bodySchema) {
                    unwrap(await bodySchema(subctx.body as BlobType), wizardTags.invalidBody)
                  }
                }

                if (paramsSchema) {
                  unwrap(await paramsSchema(ctx.params.req.params), wizardTags.invalidParams)
                }

                if (queriesSchema) {
                  unwrap(await queriesSchema(ctx.params.req.query), wizardTags.invalidQueries)
                }

                return handler(subctx)
              }

              if (meta.rest) {
                if (paramsSchema) {
                  unwrap(
                    await paramsSchema(isParamsStream ? ctx.meta : ctx.params),
                    wizardTags.invalidParams
                  )
                }

                if (queriesSchema) {
                  unwrap(
                    await queriesSchema(isParamsStream ? ctx.meta : ctx.params),
                    wizardTags.invalidQueries
                  )
                }
              }

              if (bodySchema) {
                unwrap(
                  await bodySchema(isParamsStream ? ctx.meta : ctx.params),
                  wizardTags.invalidBody
                )
              }

              const subctx: Sirutils.Wizard.ActionContext<BlobType, BlobType, BlobType> = {
                body: isParamsStream ? ctx.meta : ctx.params,
                logger: serviceLogger,
              }

              if (isParamsStream) {
                subctx.streams = [[ctx.params, ctx.meta.$params]]
              }

              return handler(subctx)
            },
            `${wizardTags.action}#createAction.handler.${serviceOptions.name}@${serviceOptions.version}` as Sirutils.ErrorValues,
            context.$cause
          ),
        }
      }
    },
  }),
  wizardTags.action
)
