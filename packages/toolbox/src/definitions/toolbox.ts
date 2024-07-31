import type { ToolboxTags } from '../tag'

declare global {
  namespace Sirutils {
    interface CustomErrors {
      toolbox: ToolboxTags
    }

    interface Env {
      target: 'node' | 'bun'
    }
  }
}
