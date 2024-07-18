export const mysqlAdapter: Sirutils.Seql.AdapterOptions = {
  parameterPattern: () => '?',
  handleJson: JSON.stringify,
}
