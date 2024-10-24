import { cli } from './cli'
import { builderPlugin } from './plugins/builder'

cli.use(builderPlugin).parse()
