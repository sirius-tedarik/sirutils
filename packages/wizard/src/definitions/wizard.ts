import type { ServiceBroker } from 'moleculer'

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

    namespace Wizard {
      interface Options {
        environment?: 'production' | 'development' | 'test'
        id?: string
      }

      interface Service<T, S, R> {}

      interface BaseApi {
        broker: ServiceBroker

        service: <T, S, R>(service: {
          name: T
          version: S
          description: string

          actions?: R
        }) => Service<T, S, R>
      }

      type Context = Sirutils.PluginSystem.Context<Sirutils.Wizard.Options, Sirutils.Wizard.BaseApi>
    }
  }
}
