import { createAction, createPlugin } from '@sirutils/core'

import { cronTags } from '../../tag'

export const cronPlugin = createPlugin(
  {
    name: 'cron',
    version: '0.0.1',
    system: true,
  },
  usePluginContext => {
    const context = usePluginContext()

    return {
      sayHi: createAction((name: string) => {
        // throw new Error('sa')
        return `Hi ${name}`
      }, cronTags.hi),
    }
  },
  cronTags.cronPlugin,
  {}
)
