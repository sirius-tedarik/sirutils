import { type PartialDeep, createPlugin } from '@sirutils/core'
import { wizardTags } from '../tag'

export const wizardPlugin = createPlugin<PartialDeep<Sirutils.Wizard.Options>, Sirutils.Wizard.Api>(
  {
    name: 'wizard',
    system: false,
    version: '0.0.1',
    dependencies: {},
  },
  context => {
    return {} as Sirutils.Wizard.Api
  },
  wizardTags.plugin,
  {
    host: '127.0.0.1',
    port: '3000',
  }
)

export type WizardPlugin = typeof wizardPlugin
