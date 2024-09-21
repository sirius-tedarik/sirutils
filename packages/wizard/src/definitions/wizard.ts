import type { ServiceBroker } from 'moleculer'

import type { BlobType, Fn, LiteralUnion } from '@sirutils/core'
import type Moleculer from 'moleculer'
import type { WizardTags } from '../tag'
import type { createWizard } from '../utils/create'

declare global {
  namespace Sirutils {
    interface CustomErrors {
      wizard: WizardTags
    }

    interface PluginDefinitions {
      wizard: Sirutils.PluginSystem.ExtractDefinition<typeof createWizard>
    }

    interface WizardServices {}

    namespace Wizard {
      interface Options {
        environment?: 'production' | 'development' | 'test'
        id?: string
      }

      interface Service<T, S, R extends Record<string, Fn<BlobType, BlobType>>> {
        $service: Moleculer.Service
      }

      interface BaseApi {
        broker: ServiceBroker

        service: <
          const T extends string,
          const S extends string,
          const R extends Record<string, Fn<BlobType, BlobType>>,
        >(service: {
          name: T
          version: S
          description: string

          actions?: R
        }) => Promise<Sirutils.Wizard.Service<T, S, R>>

        call: <
          const N extends keyof Sirutils.WizardServices,
          const M extends Sirutils.WizardServices[N] extends Sirutils.Wizard.Service<
            BlobType,
            BlobType,
            infer R
          >
            ? keyof R
            : never,
        >(
          name: LiteralUnion<`${N}#${M}`, string>,
          params: Sirutils.WizardServices[N] extends Sirutils.Wizard.Service<
            BlobType,
            BlobType,
            infer R
          >
            ? Parameters<R[M]>
            : never
        ) => Promise<
          Sirutils.WizardServices[N] extends Sirutils.Wizard.Service<BlobType, BlobType, infer R>
            ? ReturnType<R[M]>
            : never
        >
      }

      type Context = Sirutils.PluginSystem.Context<Sirutils.Wizard.Options, Sirutils.Wizard.BaseApi>
    }
  }
}
