import { Evt } from 'evt'
import { nanoid } from 'nanoid'

import type { BlobType } from '../utils/common'
import { createContext } from './context'
import { createUse } from './internal/use'

export const createApp = (cause: Sirutils.ErrorValues) => {
  const appContext = createContext(
    context => {
      if (!Object.hasOwn(context, 'use')) {
        context.use = createUse(appContext as BlobType)
      }
    },
    cause,
    {
      $id: nanoid(),
      $event: Evt.create<Sirutils.MessageResult>(),
      $cause: cause,

      $plugins: [],
      $system: [],
    } as unknown as Sirutils.PluginSystem.App
  )

  return new Proxy(
    {},
    {
      get: (_target, p) => {
        const target = appContext()

        return (
          target.$system.find(systemPlugin => systemPlugin.meta.name === p)?.api ||
          Reflect.get(target, p)
        )
      },
      set: undefined,
    }
  ) as Sirutils.PluginSystem.App
}
