import './handler'
import './services/users'
import './services/mails'
import './wizard'

import fs from 'node:fs'
import { logger } from '../src/internal/logger'
import { wizard } from './wizard'

const result = await wizard.api.call(
  'mails@0.1.1#test',
  {
    id: '1',
    name: 'alice',
  },
  {
    stream: fs.createReadStream('.env'),
  }
)

logger.log(result)
