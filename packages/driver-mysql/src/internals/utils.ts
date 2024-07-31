export const dummyAsyncFn = () => Promise.resolve()
export const applyCustomPrefix = (key: string | null, prefix?: string) => {
  if (!key) {
    return null
  }

  if (prefix) {
    return `${prefix}.${key}`
  }

  return key
}
