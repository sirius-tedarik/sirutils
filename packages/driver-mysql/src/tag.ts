import { tagBuilder } from '@sirutils/core'

const createTag = tagBuilder('@sirutils/driver-mysql')

export const driverMysqlTags = {
  logger: createTag('logger'),
  plugin: createTag('plugin'),

  // # driver
  driver: createTag('driver'),
  resultSet: createTag('execWith#result-set'),

  migration: createTag('migration'),

  invalidUpUsage: createTag('invalid-up-usage'),
  invalidDownUsage: createTag('invalid-down-usage'),
} as const

export type DriverMysqlTags = (typeof driverMysqlTags)[keyof typeof driverMysqlTags]
