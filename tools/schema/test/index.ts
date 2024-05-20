import path from 'node:path'
import { unwrap } from '@sirutils/core/dist'

import { traverse } from '../src'

const data = unwrap(await traverse(path.join(process.cwd(), './test/schemas')))

console.log(data)
