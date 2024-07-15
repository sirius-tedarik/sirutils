import type { PartialDeep } from '@sirutils/core'

declare global {
  interface Request {
    urlPattern: ReturnType<URLPattern['exec']>
    params: PartialDeep<{
      [key: string]: string | string[] | undefined
    }> | null
  }

  interface WizardRequest<T> extends Request {
    datas: T[]
  }
}
