export const wait = async <T = true>(ms: number, defaultValue?: T): Promise<T> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve((defaultValue ?? true) as T)
    }, ms)
  })
}
