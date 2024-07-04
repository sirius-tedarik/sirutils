import type { Evt } from 'evt'
import type { LiteralUnion, ReadonlyDeep, Spread } from 'type-fest'

import type { Spreadable } from 'type-fest/source/spread'
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
      type Init<A extends BlobType[]> = (...args: A) => void
      type Context<T, A extends BlobType[]> = T & {
        init: Sirutils.Context.Init<A>
      }
    }

    namespace Plugins {
      interface SystemApi {}
      interface PluginApi {}
      interface BaseApi {
        use: (plugin: Sirutils.PluginSystem.PluginInstance<BlobType, BlobType>) => Promise<boolean>
      }

      interface Api extends Sirutils.Plugins.SystemApi, Sirutils.Plugins.PluginApi {}
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

      type MakeBaseApi<K extends keyof Sirutils.Plugins.BaseApi> = (
        appContext: Sirutils.Context.Context<Sirutils.PluginSystem.AppBase, []>
      ) => Sirutils.Plugins.BaseApi[K]

      interface App
        extends Sirutils.PluginSystem.AppBase,
          Sirutils.Plugins.BaseApi,
          Sirutils.Plugins.Api {
        $id: string
        $event: Evt<Sirutils.MessageResult>
        $cause: Sirutils.ErrorValues

        $plugins: PluginContext<BlobType, BlobType>[]
        $system: PluginContext<BlobType, BlobType>[]
      }

      // ------------ Action ------------

      type Action = (
        context: Sirutils.PluginSystem.App,
        ...additionalCauses: Sirutils.ErrorValues[]
      ) => BlobType

      // ------------ Plugin ------------

      interface Meta {
        name: string
        version: string
        system?: boolean

        dependencies?: Partial<Record<LiteralUnion<keyof Sirutils.Plugins.Api, string>, string>>
      }

      interface Definition<O, R> {
        meta: Sirutils.PluginSystem.Meta
        options: O
        api: R

        $id: string
        $boundApps: Sirutils.PluginSystem.App[]
      }

      interface PluginInstance<O, R> {
        (app: R): Promise<ReadonlyDeep<Definition<O, R>>>

        get context(): ReadonlyDeep<Definition<O, R>>
      }

      interface Plugin<O, R extends Spreadable> {
        (options?: O): Sirutils.PluginSystem.PluginInstance<O, R>

        register<A extends Action>(
          actions: A
        ): Sirutils.PluginSystem.Plugin<O, Spread<ReturnType<A>, R>>
      }

      type PluginContext<O, R> = Sirutils.Context.Context<
        Sirutils.PluginSystem.Definition<O, R>,
        [app: Sirutils.PluginSystem.App | undefined, options: O | undefined]
      >

      type ExtractPlugin<P extends Sirutils.PluginSystem.Plugin<BlobType, BlobType>> = Awaited<
        ReturnType<ReturnType<P>>
      >['api']
    }
  }
}
