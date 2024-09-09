import { scylla } from '../drivers'

scylla.api.migration(
  'users',
  '0.1.1',
  async () => {
    await scylla.api.execWith({ cache: false })`ALTER TABLE users ADD logins varint`
  },
  async () => {
    await scylla.api.execWith({ cache: false })`ALTER TABLE users DROP logins`
  }
)
