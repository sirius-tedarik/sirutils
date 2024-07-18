import { tagBuilder } from '@sirutils/core'

const createTag = tagBuilder('@sirutils/driver-mysql')

export const mysqlTags = {
  logger: createTag('logger'),
  createDB: createTag('create-db'),
  createRedisCacher: createTag('create-redis-cacher'),

  // errors
  cacherGet: createTag('cacher-get'),
  cacherSet: createTag('cacher-set'),
  cacherDelete: createTag('cacher-delete'),
  cacherMatch: createTag('cacher-match'),

  createDBOptions: createTag('create-db-options'),
  createDBInitialize: createTag('create-db-initialize'),
  dbExec: createTag('db-exec'),
  dbExecHandleCache: createTag('db-exec-handle-cache'),
} as const

export type MysqlTags = (typeof mysqlTags)[keyof typeof mysqlTags]
