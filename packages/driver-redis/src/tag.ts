import { tagBuilder } from '@sirutils/core'

const createTag = tagBuilder('@sirutils/driver-redis')

export const driverRedisTags = {
  logger: createTag('logger'),
  plugin: createTag('plugin'),
  driver: createTag('driver'),

  redisGlobal: createTag('redis-global'),
  scan: createTag('driver#scan'),
  invalidResponse: createTag('invalid-response'),
} as const

export type DriverRedisTags = (typeof driverRedisTags)[keyof typeof driverRedisTags]
