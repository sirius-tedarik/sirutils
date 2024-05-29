import type { ToolboxTags } from '../tag'

declare global {
  // biome-ignore lint/style/noNamespace: Redundant
  namespace Sirutils {
    interface CustomErrors {
      schema: ToolboxTags
    }

    // biome-ignore lint/style/noNamespace: Redundant
    namespace Toolbox {
      interface Env {
        target: 'node' | 'bun'
      }
    }
  }
}
