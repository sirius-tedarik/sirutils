import { type BlobType, createPlugin } from '@sirutils/core'

const dbPlugin = createPlugin(
  {
    name: 'db',
    version: '1.0.0',
  },
  usePluginContext => {
    return {
      sayHi: (name: string) => `Hi ${name}`,
    } as const
  },
  '@sirutils/core.invalid-env',
  {}
)

const usePluginContext = dbPlugin({})({} as BlobType)

// biome-ignore lint/nursery/noConsole: <explanation>
console.log(dbPlugin.context.api.sayHi('ahmet'))
