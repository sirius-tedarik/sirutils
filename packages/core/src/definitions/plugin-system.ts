import type { Evt } from 'evt'
import type { LiteralUnion, ReadonlyDeep } from 'type-fest'

import type { PluginSystemTags } from '../tag'
import type { BlobType } from '../utils/common'

declare global {
  namespace Sirutils {
    // ------------ Errors ------------

    interface CustomErrors {
      pluginSystem: PluginSystemTags
    }

    // ------------ Messages ------------

    interface CustomMessages {}

    namespace Context {
      type Use<R, A extends BlobType[]> = (...args: A) => ReadonlyDeep<R>
      type UseUnsafe<R, A extends BlobType[]> = (...args: A) => R
    }

    namespace Plugins {
      interface SystemApi {}
      interface PluginApi {}
      interface BaseApi {
        use: (plugin: Sirutils.PluginSystem.PluginInstance<BlobType, BlobType>) => boolean
      }

      interface Api extends Sirutils.Plugins.SystemApi, Sirutils.Plugins.PluginApi {}

      type ApiNames = keyof Sirutils.Plugins.Api
    }

    namespace PluginSystem {
      // ------------ App ------------

      interface AppBase {
        $id: string
        $event: Evt<Sirutils.MessageResult>
        $cause: Sirutils.ErrorValues

        $plugins: ReadonlyDeep<Sirutils.PluginSystem.Definition<BlobType, BlobType>>[]
        $system: ReadonlyDeep<Sirutils.PluginSystem.Definition<BlobType, BlobType>>[]
      }

      type AppContext = Sirutils.Context.Use<Sirutils.PluginSystem.AppBase, []>

      type MakeBaseApi<K extends keyof Sirutils.Plugins.BaseApi> = (
        appContext: Sirutils.Context.UseUnsafe<Sirutils.PluginSystem.AppBase, []>
      ) => Sirutils.Plugins.BaseApi[K]

      interface App
        extends Sirutils.PluginSystem.AppBase,
          Sirutils.Plugins.BaseApi,
          Sirutils.Plugins.Api {}

      // ------------ Plugin ------------

      interface Meta {
        name: string
        version: string
        system?: boolean

        dependencies?: Record<LiteralUnion<keyof Sirutils.Plugins.Api, string>, string>
      }

      interface Definition<O, R> {
        meta: Sirutils.PluginSystem.Meta
        options: O
        api: R

        $id: string
        $boundApps: Sirutils.PluginSystem.App[]
        $boundApi: (api: R) => void
      }

      interface PluginInstance<O, R> {
        (app: R): ReadonlyDeep<Definition<O, R>>

        get context(): ReadonlyDeep<Definition<O, R>>
      }

      type Plugin<O, R> = (options?: O) => Sirutils.PluginSystem.PluginInstance<O, R>

      type ExtractPlugin<P extends Sirutils.PluginSystem.Plugin<BlobType, BlobType>> = ReturnType<
        ReturnType<P>
      >['api']
    }
  }
}
