import { createActions, createPlugin } from '@sirutils/core'

import { cronTags } from '../../tag'

const exampleApi = createActions(
  app => ({
    sayHi: (name: string) => `Hi ${name}`,
  }),
  cronTags.exampleApi
)

export const cronPlugin = createPlugin(
  {
    name: 'cron',
    version: '0.0.1',
    system: true,
  },
  () => ({}),
  cronTags.cronPlugin
).register(exampleApi)

type CronPlugin = typeof cronPlugin
