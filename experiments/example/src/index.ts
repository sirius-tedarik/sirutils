import './definition'

import { $sayHi } from './users/say-hi'

// biome-ignore lint/suspicious/noConsole: Redundant
console.log($sayHi('yui').unwrap())

export * from './tag'
