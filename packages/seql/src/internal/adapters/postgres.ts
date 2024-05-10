export const postgresAdapter: Sirutils.Seql.AdapterOptions = {
  paramterPattern: str => `$${str}`,
}
