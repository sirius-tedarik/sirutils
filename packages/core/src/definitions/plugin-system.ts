import type { ReadonlyDeep } from 'type-fest'
import type { Spread, Spreadable } from 'type-fest/source/spread'
import type { PluginSystemTags } from '../tag'
import type { BlobType } from '../utils/common'

declare global {
  namespace Sirutils {
    interface Env {}

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

    /**
     * All the plugins should be added here with
     * @example
     * const plugin = ...
     *
     * declare global {
     *    namespace Sirutils {
     *      interface PluginDefinitions {
     *        examplePlugin: Sirutils.PluginSystem.ExtractDefinition<typeof plugin>
     *      }
     *    }
     * }
     */
    interface PluginDefinitions {}

    namespace PluginSystem {
      /**
       * Plugin metadata definitions
       */
      interface Meta {
        name: string
        version: string

        dependencies?: Partial<Record<keyof Sirutils.PluginDefinitions, string>>
      }

      /**
       * Plugin instance
       */
      interface Definition<O, R> extends Sirutils.PluginSystem.Api {
        meta: Sirutils.PluginSystem.Meta
        options: O
        api: R

        $id: string
        $cause: Sirutils.ErrorValues
        $boundPlugins: Sirutils.PluginSystem.Definition<BlobType, BlobType>[]
      }

      /**
       * Plugin Context
       */
      type Context<O, R> = Sirutils.Context.Context<
        Sirutils.PluginSystem.Definition<O, R>,
        [options?: O | undefined]
      >

      /**
       * Special Plugin Api
       */
      interface Api {
        use: (plugin: Sirutils.PluginSystem.Definition<BlobType, BlobType>) => boolean
        get: <K extends keyof Sirutils.PluginDefinitions>(
          name: K,
          version?: string
        ) => Sirutils.PluginDefinitions[K]
        lookup: <K extends keyof Sirutils.PluginDefinitions>(
          name: K,
          version?: string
        ) => Sirutils.PluginDefinitions[K]['api']
        lookupByOption: <K extends keyof Sirutils.PluginDefinitions>(
          key: string,
          value: unknown
        ) => Sirutils.PluginDefinitions[K]['api']
      }

      /**
       * To generate createX functions (X is keys of Sirutils.PluginSystem.Api)
       */
      type MakeApi<K extends keyof Sirutils.PluginSystem.Api, O = BlobType, R = BlobType> = (
        pluginContext: Sirutils.PluginSystem.Context<O, R>
      ) => Sirutils.PluginSystem.Api[K]

      /**
       * Any action type (for plugin.register)
       */
      type Action = (
        context: Sirutils.PluginSystem.Context<BlobType, BlobType>,
        ...additionalCauses: Sirutils.ErrorValues[]
      ) => PromiseLike<BlobType>

      /**
       * Plugin constructor definition
       */
      interface Plugin<O, R extends Spreadable> {
        (options?: O): Promise<ReadonlyDeep<Sirutils.PluginSystem.Definition<O, R>>>

        register<A extends Sirutils.PluginSystem.Action>(
          actions: A
        ): Sirutils.PluginSystem.Plugin<
          O,
          Spread<ReadonlyDeep<Awaited<ReturnType<A>>>, ReadonlyDeep<R>>
        >
      }

      /**
       * For extracting definition of plugin constructor
       */
      type ExtractDefinition<P> = P extends Sirutils.PluginSystem.Plugin<infer O, infer R>
        ? Sirutils.PluginSystem.Context<O, R>
        : never
    }
  }
}
