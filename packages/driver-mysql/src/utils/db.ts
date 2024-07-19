import { ProjectError, forwardAsync, unwrap } from '@sirutils/core'
import type { TAnySchema } from '@sirutils/schema'
import { Seql } from '@sirutils/seql'
import mariadb from 'mariadb'

import { mysqlTags } from '../tag'
import { createDBExec } from './internals/db-exec'
import { dbInitialize } from './internals/db-initialize'

export const createDB = async <T extends TAnySchema, S>(
  options: Sirutils.Mysql.DBOptions<T, S>,
  additionalCause: Sirutils.ErrorValues
): Promise<Sirutils.Mysql.DBApi<S>> =>
  forwardAsync(async () => {
    if (!options.connectionOptions.database) {
      ProjectError.create(mysqlTags.createDBOptions, 'database').throw()
    }

    const db = mariadb.createPool({
      ...options.connectionOptions,
      timezone: 'Z',
      rowsAsArray: false,
      autoJsonMap: true,
    })

    const api = {
      db,
      cacher: options.cacher,

      schema: async () => {
        const { data } = await api.exec<'settings[]'>(
          Seql.query`SELECT * FROM ${Seql.table('settings')} WHERE ${Seql.and({ name: 'migration' })}`
        )

        if (!data[0]) {
          return {}
        }

        return data
      },
    } as Sirutils.Mysql.DBApi<S>

    api.exec = createDBExec(api, options, additionalCause)
    unwrap(await dbInitialize(api, options))

    return api
  }, mysqlTags.createDB)
