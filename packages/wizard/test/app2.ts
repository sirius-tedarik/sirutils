import './handler'
import './wizard'
import './services/test'

import type { BlobType } from '@sirutils/core'

import { wizard } from './wizard'
import { logger } from '../src/internal/logger'

const result = await wizard.api.call('users@0.1.0#create', [
  {
    name: 5 as BlobType,
  },
])

logger.log(result)
