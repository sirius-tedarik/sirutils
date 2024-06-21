import type { BuildConfig } from 'bun'
import type { Flag, Options as MeowOptions } from 'meow'

declare global {
  namespace Sirutils {
    namespace Builder {
      type StringFlag = Flag<'string', string> | Flag<'string', string[], true>
      type BooleanFlag = Flag<'boolean', boolean> | Flag<'boolean', boolean[], true>
      type NumberFlag = Flag<'number', number> | Flag<'number', number[], true>
      type AnyFlag =
        | Sirutils.Builder.StringFlag
        | Sirutils.Builder.BooleanFlag
        | Sirutils.Builder.NumberFlag
      type AnyFlags = Record<string, Sirutils.Builder.AnyFlag>

      type BaseFlags = {
        help: {
          type: 'string'
          shortFlag: 'h'
        }
      }

      interface CustomOptions {}
      interface BaseOptions<T extends Sirutils.Builder.AnyFlags> {
        helpMessage: string
        bundle: BuildConfig
        cli: MeowOptions<T>

        actions: Record<string, (options: Options<T>) => Promise<void>>
        generated: {
          projectName: string
          tmpDistPath: string
          distPath: string
          entryPaths: string[]
          externals: string[]
        }
      }

      interface Options<T extends Sirutils.Builder.AnyFlags>
        extends Sirutils.Builder.BaseOptions<T>,
          Sirutils.Builder.CustomOptions {}

      interface Utils {
        meow: typeof import('meow')
        ora: typeof import('ora')
      }

      type Plugin = <T extends Sirutils.Builder.AnyFlags>(
        utils: Sirutils.Builder.Utils
      ) => Sirutils.Builder.Options<T> | void
    }
  }
}
