import type { ToolboxTags } from '../tag'

declare global {
  namespace Sirutils {
    interface CustomErrors {
      schema: ToolboxTags
    }

    namespace Toolbox {
      interface Env {
        target: 'node' | 'bun'
      }
    }
  }
}
