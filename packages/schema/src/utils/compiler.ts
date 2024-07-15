import type { Static, TAnySchema } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { ProjectError } from '@sirutils/core'

import { schemaTags } from '../tag'

export const customTypeCompiler = <T extends TAnySchema>(schema: T) => {
  const compiled = TypeCompiler.Compile(schema)

  return (datas: Static<T>[]) => {
    if (!compiled.Check(datas)) {
      ProjectError.create(schemaTags.invalidData, 'blogs')
        .appendData([...compiled.Errors(datas)])
        .throw()
    }

    return datas
  }
}
