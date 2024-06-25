import type { TNull, TSchema, TUndefined, TUnion, Type } from '@sinclair/typebox'
import type { BlobType } from '@sirutils/core'

export const Nullable =
  (t: typeof Type) =>
  <T extends TSchema>(schema: T): TUnion<[T, TNull]> =>
    t.Union([t.Null(), schema]) as BlobType

/**
 * Allow Optional, Nullable and Undefined
 */
export const MaybeEmpty =
  (t: typeof Type) =>
  <T extends TSchema>(schema: T): TUnion<[T, TUndefined]> =>
    t.Union([t.Null(), t.Undefined(), schema]) as BlobType
