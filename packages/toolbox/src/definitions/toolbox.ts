import type { ToolboxTags } from '../tag'

declare global {
  namespace Sirutils {
    interface CustomErrors {
      toolbox: ToolboxTags
    }

    /**
     * Add the env definitions
     */
    interface Env {
      target: 'node' | 'bun'
    }
  }
}
