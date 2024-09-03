import { type BlobType, createActions } from '@sirutils/core'
import { proxy } from '@sirutils/safe-toolbox'

import { driverScyllaTags } from '../tag'

export const driverActions = createActions(
  (context: Sirutils.DriverScylla.Context): Sirutils.DriverScylla.Api => {
    return {
      exec: async (texts: TemplateStringsArray, ...values: BlobType[]) => {
        const query = context.api.query(texts, ...values)
        const result = proxy(
          await context.api.$client.execute(query.text, query.values),
          driverScyllaTags.resultSet,
          true
        )

        return result
      },
    }
  },
  driverScyllaTags.driver
)
