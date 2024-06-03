/// <reference types="@sirutils/seql" />
/// <reference types="@sirutils/core" />

import '../schemas/_'
import './definitions'

import { createApp } from '@sirutils/core'

import { cronPlugin } from './plugins/cron/plugin'
import { cronTags } from './tag'

const app = createApp(cronTags.dbExperiment)
const publishCron = cronPlugin({})

app.use(publishCron)

// biome-ignore lint/nursery/noConsole: <explanation>
console.log(app.cron.sayHi('ahmet'))
// console.log(publishCron.context.api.sayHi('ahmet'))

export * from '../schemas/_'
