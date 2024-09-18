import { tagBuilder } from '@sirutils/core'

const createTag = tagBuilder('@sirutils/driver-mysql')

export const driverMysqlTags = {
  logger: createTag('logger'),
  plugin: createTag('plugin'),

  // # driver
  driver: createTag('driver'),
  resultSet: createTag('exec#result-set'),

  migration: createTag('migration'),
} as const

export type DriverMysqlTags = (typeof driverMysqlTags)[keyof typeof driverMysqlTags]
