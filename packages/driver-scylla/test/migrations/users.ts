import { scylla } from '../drivers'

export const userMigrations = [
  scylla.api.migration(
    'users',
    '0.1.0',
    async () => {
      await scylla.api.execWith({ cache: false })`CREATE TABLE IF NOT EXISTS users (
        id text,
        name text,
        surname text,
        roles set<text>,
        PRIMARY KEY (id, name, surname)
      )`
    },
    async () => {
      await scylla.api.execWith({ cache: false })`DROP TABLE IF EXISTS users;`
    }
  ),
  scylla.api.migration(
    'users',
    '0.1.1',
    async () => {
      await scylla.api.execWith({ cache: false })`ALTER TABLE users ADD logins varint`
    },
    async () => {
      await scylla.api.execWith({ cache: false })`ALTER TABLE users DROP logins`
    }
  ),
  scylla.api.migration(
    'users',
    '0.1.3',
    async () => {
      await scylla.api.execWith({ cache: false })`ALTER TABLE users ADD tests varint`
    },
    async () => {
      await scylla.api.execWith({ cache: false })`ALTER TABLE users DROP tests`
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
          roles: Sirutils.Seql.QueryBuilder<string[]>
        }
        '0.1.1': Sirutils.DBSchemas['users']['0.1.0'] & {
          logins: number
        }
        '0.1.3': Sirutils.DBSchemas['users']['0.1.1'] & {
          tests: number
        }
      }
    }
  }
}
