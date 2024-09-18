import { mysql } from '../drivers'
import { userMigrations } from './users'

await mysql.api.up(userMigrations)
await mysql.api.down(userMigrations, '0.1.1')
