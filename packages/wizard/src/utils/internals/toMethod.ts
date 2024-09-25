export const toMethod = (value: string) => {
  switch (value) {
    case 'create':
      return 'POST'
    case 'read':
      return 'GET'
    case 'update':
      return 'PUT'
    case 'patch':
      return 'PATCH'
    case 'remove':
      return 'PATCH'
    default:
      return value.toUpperCase()
  }
}
