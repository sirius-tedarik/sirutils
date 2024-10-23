import { tagBuilder } from '@sirutils/core'

export const createTag = tagBuilder('@sirutils/nuts#nats')

export const natsTags = {
  plugin: createTag('plugin'),
  logger: createTag('logger'),

  // actions
  api: createTag('api'),

  // errors
  noResponse: createTag('no-response'),
  timeout: createTag('timeout'),
  unexpected: createTag('unexpected'),
} as const

export type NatsTags = (typeof natsTags)[keyof typeof natsTags]
