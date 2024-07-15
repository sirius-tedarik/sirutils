import { type PartialDeep, createPlugin } from '@sirutils/core'

import { wizardTags } from '../tag'
import { baseApi } from './api/base'

export const wizardPlugin = createPlugin<PartialDeep<Sirutils.Wizard.Options>, Sirutils.Wizard.Api>(
  {
    name: 'wizard',
    system: false,
    version: '0.0.1',
    dependencies: {},
  },
  context => ({}) as Sirutils.Wizard.Api,
  wizardTags.plugin,
  {
    host: '127.0.0.1',
    port: '3000',
  }
).register(baseApi)

export type WizardPlugin = typeof wizardPlugin
