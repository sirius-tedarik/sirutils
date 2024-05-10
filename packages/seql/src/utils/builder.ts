import type { BlobType } from '@sirutils/core'

import { selectedAdapter } from '../internal/adapters'
import { Generated, Raw } from '../internal/consts'

/**
 * Base builder
 */
const builder = <T = BlobType>(
  values: T[],
  buildText: (nextParamID: number) => string
): Sirutils.Seql.BuildedQuery<T> => {
  return {
    $type: Raw,
    values,
    buildText,
  }
}

/**
 * Check is builder
 */
export const isBuilder = (builder: BlobType): builder is Sirutils.Seql.BuildedQuery => {
  return builder && builder.$type === Raw
}

/**
 * Generate the full query
 */
export const generate = <T>(builder: Sirutils.Seql.BuildedQuery<T>): Sirutils.Seql.Query<T> => {
  return {
    $type: Generated,
    text: builder.buildText(1),
    values: builder.values,

    builder,
  }
}

/**
 * Check is generated
 */
export const isGenerated = (query: BlobType): query is Sirutils.Seql.Query => {
  return query && query.$type === Generated
}

export const join = <T>(
  builders: Sirutils.Seql.BuildedQuery<T>[],
  delimiter = ''
): Sirutils.Seql.BuildedQuery<T> => {
  return builder(
    builders.reduce((acc, { values }) => acc.concat(values), [] as T[]),
    nextParamID => {
      let paramID = nextParamID
      const builtText: string[] = []

      for (const builder of builders) {
        builtText.push(builder.buildText(paramID))
        paramID += builder.values.length
      }

      return builtText.join(delimiter)
    }
  )
}

/**
 * Check if provided value is a BuildedQuery
 */
export const toSqlBuilder = <T>(
  value: Sirutils.Seql.BuildedQuery<T> | T
): Sirutils.Seql.BuildedQuery<T> => {
  return isBuilder(value) ? value : safe(value)
}

/**
 * Use for query (dangerous). use this function carefully
 */
export const raw = (value: string): Sirutils.Seql.BuildedQuery<string> => {
  return builder([], () => value)
}

/**
 * Use for parameters.
 */
export const safe = <T>(value: T): Sirutils.Seql.BuildedQuery<T> => {
  return builder([value], nextParamID => selectedAdapter.paramterPattern(nextParamID.toString()))
}
