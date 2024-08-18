type TagMapper<S, T> = T extends string ? (S extends string ? `${T}.${S}` : null) : null

/**
 * For usage navigate link below
 * @link https://github.com/sirius-tedarik/sirutils/blob/development/packages/core/src/tag.ts
 */
export const tagBuilder = <const T>(tag: T) => {
  return <const S>(str: S) => `${tag}.${str}` as TagMapper<S, T>
}
