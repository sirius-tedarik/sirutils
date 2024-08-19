import type { BlobType } from '@sirutils/core'

import deepmerge, { type ArrayMergeOptions } from 'deepmerge'

/**
 * Combines two arrays (for deepmerge)
 * @link https://www.npmjs.com/package/deepmerge
 */
export const combineMerge = (
  target: BlobType[],
  source: BlobType[],
  options: ArrayMergeOptions
) => {
  const destination = target.slice()

  source.forEach((item, index) => {
    if (typeof destination[index] === 'undefined') {
      destination[index] = options.cloneUnlessOtherwiseSpecified(item, options)
    } else if (options.isMergeableObject(item)) {
      destination[index] = deepmerge(target[index], item, options)
    } else if (target.indexOf(item) === -1) {
      destination.push(item)
    }
  })
  return destination
}
