import { forward, forwardAsync } from '../result/error'
import type { BlobType } from '../utils/common'
import { pluginSystemTags } from '../tag'

export const createAction = <T, A extends BlobType[]>(
  cb: (...args: A) => T,
  cause: Sirutils.ErrorValues
) => {
  return (...args: NoInfer<A>) => forward(() => cb(...args), cause, pluginSystemTags.createAction)
}

export const createActionAsync = <T, A extends BlobType[]>(
  cb: (...args: A) => Promise<T>,
  cause: Sirutils.ErrorValues
) => {
  return (...args: NoInfer<A>) =>
    forwardAsync(() => cb(...args), cause, pluginSystemTags.createAction)
}
