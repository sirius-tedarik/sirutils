import { createActions } from '@sirutils/core'

import { nutsTags } from '../../tag'

export const brokerActions = createActions(
  (context: Sirutils.Nuts.Context): Sirutils.Nuts.BrokerApi => {
    const serializer = context.lookup('nuts-serializer')
    const transport = context.lookup('nuts-transport')

    return {
      broker: {},
    }
  },
  nutsTags.broker
)
