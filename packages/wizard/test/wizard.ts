import { ENV } from './consts'
import { createWizard } from '../src'
import { redis, scylla } from './drivers'

export const wizard = await createWizard(
  {
    environment: ENV.mode,
  },
  redis,
  scylla
)
