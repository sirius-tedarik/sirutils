import { scylla } from '../drivers'

scylla.api.migration(
  'users',
  '0.1.1',
  async () => {
    await scylla.api.execWith({ cache: false })`ALERT TABLE users ADD logins varint`
  },
  async () => {
    await scylla.api.execWith({ cache: false })`ALERT TABLE users DROP logins`
  }
)
