import { nanoid } from 'nanoid'
import { ProjectError, unwrap } from '../result/error'
import { pluginSystemTags } from '../tag'
import type { BlobType } from '../utils/common'
import { createContext } from './context'

export const createPlugin = <const O, const R>(
  meta: Sirutils.PluginSystem.Meta,
  pluginInitiator: (
    usePluginContext: Sirutils.Context.Use<
      Sirutils.PluginSystem.Definition<NoInfer<O>, BlobType>,
      [app?: Sirutils.PluginSystem.App, options?: NoInfer<O>]
    >
  ) => R,
  cause: Sirutils.ErrorValues,
  defaultOptions?: O
) => {
  return ((rawOptions?: O) => {
    const $id = `${meta.name}@${meta.version}-${nanoid()}`
    const usePluginContext = createContext(
      (
        context: Sirutils.PluginSystem.Definition<O, R>,
        app?: Sirutils.PluginSystem.App,
        options?: O
      ) => {
        if (app && !context.$boundApps.includes(app)) {
          context.$boundApps.push(app)
        }

        if (options && !Object.hasOwn(context, 'options')) {
          context.options = options
        }

        if (!Object.hasOwn(context, '$boundApi')) {
          context.$boundApi = api => {
            if (!Object.hasOwn(context, 'api')) {
              context.api = api
            }
          }
        }

        if (context.$boundApps.length === 0) {
          unwrap(
            ProjectError.create(
              pluginSystemTags.contextNotInitialized,
              'usePluginContext.options is missing or usePluginContext dont have any bound app'
            ).asResult(cause)
          )
        }
      },
      cause,
      {
        meta,

        $id,
        $boundApps: [],
      } as BlobType
    )

    const options: O | undefined = rawOptions ? { ...defaultOptions, ...rawOptions } : undefined

    const pluginInstance = (app: Sirutils.PluginSystem.App) => {
      usePluginContext(app, options)

      const api = pluginInitiator(usePluginContext)

      usePluginContext().$boundApi(api)

      return new Proxy(
        {},
        {
          get: (_target, p) => {
            const target = usePluginContext(app, options)

            return Reflect.get(target, p)
          },

          set: undefined,
        }
      )
    }

    Object.defineProperty(pluginInstance, 'context', {
      get: () => {
        return usePluginContext()
      },

      set: undefined,
    })

    return pluginInstance
  }) as unknown as Sirutils.PluginSystem.Plugin<O, R>
}
