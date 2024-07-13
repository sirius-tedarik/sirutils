import type { WizardPlugin } from '../plugin/main'
import type { WizardTags } from '../tag'

declare global {
  namespace Sirutils {
    interface CustomErrors {
      wizard: WizardTags
    }

    namespace Plugins {
      interface Definitions {
        wizard: Sirutils.PluginSystem.ExtractDefinition<WizardPlugin>
      }

      interface SystemApi {
        wizard: Sirutils.Plugins.Definitions['wizard']['api']
      }
    }

    interface Env {
      target: 'node' | 'bun'
    }

    namespace Wizard {
      interface Options {
        name?: Sirutils.ErrorValues
        host: string
        port: string
      }

      namespace InternalApis {}

      namespace PublicApis {}

      interface Api {}
    }
  }
}
