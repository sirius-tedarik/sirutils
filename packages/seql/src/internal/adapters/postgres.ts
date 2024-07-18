export const postgresAdapter: Sirutils.Seql.AdapterOptions = {
  parameterPattern: str => `$${str}`,
  handleJson: JSON.stringify,
}
