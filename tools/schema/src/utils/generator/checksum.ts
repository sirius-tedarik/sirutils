import { wrap } from '@sirutils/core'

import type { SourceFile } from 'ts-morph'
import { schemaTags } from '../../tag'

export const updateChecksum = wrap((sourceFile: SourceFile, file: Sirutils.Schema.Normalized) => {
  const comments = sourceFile?.getStatementsWithComments()

  if (comments && comments.length > 0) {
    const checksum = comments[0]?.getText()

    if (!checksum) {
      sourceFile.insertStatements(0, `// ${file.checksum}`)

      return
    }

    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    comments[0]!.remove()
  }

  sourceFile.insertStatements(0, `// ${file.checksum}`)
}, schemaTags.updateChecksum)
