import './handler'

import { createWizard } from '../src'
import { redis, scylla } from './drivers'

const wizard = await createWizard(
  {
    environment: 'development',
  },
  redis,
  scylla
)

wizard.api.service({
  name: 'users',
  version: '0.1.0',
  description: 'service for users',
})
