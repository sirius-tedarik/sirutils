import { mysql } from '../drivers'

export const userMigrations = [
  mysql.api.migration(
    'users',
    '0.1.0',
    async () => {
      await mysql.api.execWith({ cache: false })`CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(26),
      name VARCHAR(255),
      surname VARCHAR(255),
      roles TEXT,
      PRIMARY KEY (id, name, surname)
    )`
    },
    async () => {
      await mysql.api.execWith({ cache: false })`DROP TABLE IF EXISTS users;`
    }
  ),
  mysql.api.migration(
    'users',
    '0.1.1',
    async () => {
      await mysql.api.execWith({ cache: false })`ALTER TABLE users ADD logins TIMESTAMP`
    },
    async () => {
      await mysql.api.execWith({ cache: false })`ALTER TABLE users DROP logins`
    }
  ),
]

declare global {
  // biome-ignore lint/style/noNamespace: Redundant
  namespace Sirutils {
    interface DBSchemas {
      users: {
        '0.1.0': {
          id: string
          name: string
          surname: string
          roles: string
        }
        '0.1.1': Sirutils.DBSchemas['users']['0.1.0'] & {
          logins: Date
        }
      }
    }
  }
}
