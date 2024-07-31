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

  appContext.init()

  return new Proxy(
    {},
    {
      get: (_target, p) => {
        return (
          appContext.$system.find(systemPlugin => systemPlugin.meta.name === p)?.api ||
          Reflect.get(appContext, p)
        )
      },
      set: undefined,
    }
  ) as Sirutils.PluginSystem.App
}
