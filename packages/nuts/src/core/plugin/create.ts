import { createPlugin } from '@sirutils/core'

import { nutsTags } from '../tag'
import { brokerActions } from './internal/broker'

export const createNuts = createPlugin<Sirutils.Nuts.Options, Sirutils.Nuts.BaseApi>(
  {
    name: 'nuts',
    version: '0.2.3',

    dependencies: {
      'nuts-serializer': '*',
      'nuts-transport': '*',
    },
  },
  ctx => {
    return {
      broker: {},
    }
  },
  nutsTags.plugin
)
  .register(brokerActions)
  .lock()
