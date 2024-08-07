type TagMapper<S, T> = T extends string ? (S extends string ? `${T}.${S}` : null) : null

export const tagBuilder = <const T>(tag: T) => {
  return <const S>(str: S) => `${tag}.${str}` as TagMapper<S, T>
}
