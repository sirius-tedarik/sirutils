import { createLogger, createPlugin } from '@sirutils/core'

import { connect } from 'nats'
import { natsTags } from '../tag'
import { transportApiActions } from './internal/api'

export const createNats = createPlugin<Sirutils.Nuts.Nats.Options, Sirutils.Nuts.Nats.BaseApi>(
  {
    name: 'nuts-transport', // nats
    version: '0.2.3',

    dependencies: {
      'nuts-serializer': '*',
    },
  },
  async context => {
    const $connection = await connect(context.options)

    context.options.logger?.info('connected to nats')

    return {
      $connection,
    }
  },
  natsTags.plugin,
  {
    servers: '127.0.0.1:4222',
    logger: createLogger(natsTags.logger),
  }
)
  .register(transportApiActions)
  .lock()
