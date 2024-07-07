import { Evt } from 'evt'
import { nanoid } from 'nanoid'

import { createContext } from './context'
import { createLookup } from './internal/lookup'
import { createUse } from './internal/use'
import { createLookupByOption } from './internal/lookup-by-option'
import { createGet } from './internal/get'

export const createApp = (cause: Sirutils.ErrorValues) => {
  const appContext = createContext(
    context => {
      if (!Object.hasOwn(context, 'use')) {
        context.use = createUse(appContext)
        context.get = createGet(appContext)
        context.lookup = createLookup(appContext)
        context.lookupByOption = createLookupByOption(appContext)
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
