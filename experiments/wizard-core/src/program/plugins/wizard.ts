import { wizardPlugin } from '@sirutils/wizard'
import { app } from '../app'

await app.use(wizardPlugin())
export const wizard = app.lookup('wizard')
