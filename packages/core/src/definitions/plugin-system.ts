import type { LiteralUnion, ReadonlyDeep } from 'type-fest'

import type { Evt } from 'evt'
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
    }

    namespace Plugins {
      interface SystemApi {}
      interface PluginApi {}
      interface BaseApi {
        use: (plugin: Sirutils.PluginSystem.Definition<BlobType, BlobType>) => boolean
      }

      interface Api extends Sirutils.Plugins.SystemApi, Sirutils.Plugins.PluginApi {}
      type ApiNames = keyof Sirutils.Plugins.Api
    }

    namespace PluginSystem {
      // ------------ App ------------

      interface AppBase {
        $id: string
        $event: Evt<Sirutils.MessageResult>
      }

      interface App extends Sirutils.PluginSystem.AppBase, Sirutils.Plugins.BaseApi {}

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

        $boundApps: Sirutils.PluginSystem.App[]
        $boundApi: (api: R) => void
      }

      interface Plugin<O, R> {
        (options?: O): (app: R) => ReadonlyDeep<Definition<O, R>>

        get context(): ReadonlyDeep<Definition<O, R>>
      }
    }
  }
}
