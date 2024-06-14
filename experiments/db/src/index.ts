/// <reference types="@sirutils/seql" />
/// <reference types="@sirutils/core" />

import '../schemas/_'
import './definitions'

import { createApp } from '@sirutils/core'

import { logger } from './internal/logger'
import { cronPlugin } from './plugins/cron/plugin'
import { cronTags } from './tag'

const app = createApp(cronTags.dbExperiment)
const publishCron = cronPlugin({})

await app.use(publishCron)

logger.info(app.cron.sayHi('Sirius'))

export * from '../schemas/_'
