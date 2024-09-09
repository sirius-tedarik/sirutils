import pkg from '../../package.json'

import { createPlugin } from '@sirutils/core'
import { wizardTags } from '../tag'

export const createWizard = createPlugin(
  {
    name: pkg.name,
    version: pkg.version,
  },
  // biome-ignore lint/suspicious/noEmptyBlockStatements: <explanation>
  async () => {},
  wizardTags.plugin
)
