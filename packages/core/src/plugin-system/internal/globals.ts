import type { BlobType } from '../utils/common'

export const contextStore: Record<
  string,
  Sirutils.Context.Use<
    Sirutils.PluginSystem.Definition<BlobType, BlobType>,
    [app?: Sirutils.PluginSystem.App, options?: BlobType]
  >
> = {}
