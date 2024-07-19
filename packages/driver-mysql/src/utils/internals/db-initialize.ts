import { type BlobType, wrapAsync } from '@sirutils/core'
import type { TAnySchema } from '@sirutils/schema'
import { Seql } from '@sirutils/seql'

import { logger } from '../../internals/logger'
import { mysqlTags } from '../../tag'

export const dbInitialize = wrapAsync(
  async <T extends TAnySchema, S>(
    api: Sirutils.Mysql.DBApi<S>,
    options: Sirutils.Mysql.DBOptions<T, S>
  ) => {
    const exists = await api.exec<BlobType[]>(Seql.query`
    SELECT *
    FROM ${Seql.table('INFORMATION_SCHEMA.TABLES')}
    WHERE ${Seql.and({
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      // biome-ignore lint/style/useNamingConvention: <explanation>
      TABLE_SCHEMA: options.connectionOptions.database!,
      // biome-ignore lint/style/useNamingConvention: <explanation>
      TABLE_NAME: 'settings',
    })};
  `)

    if (exists.data?.length === 0) {
      logger.info('initializing database')

      await api.exec(
        Seql.query`
        CREATE TABLE ${Seql.table('settings')} (
          id INT auto_increment NOT NULL,
          name varchar(255) NOT NULL,
          data json NOT NULL,
          timestamp DATETIME NOT NULL,
          CONSTRAINT settings_pk PRIMARY KEY (id)
        );
      `,
        {
          safe: true,
        }
      )
    }
  },
  mysqlTags.createDBInitialize
)
