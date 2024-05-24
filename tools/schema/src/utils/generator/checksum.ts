import { wrap } from '@sirutils/core'

import { type SourceFile, SyntaxKind } from 'ts-morph'
import { schemaTags } from '../../tag'

export const updateChecksum = wrap((sourceFile: SourceFile, file: Sirutils.Schema.Normalized) => {
  const comments = sourceFile?.getStatementsWithComments()

  // biome-ignore lint/complexity/noForEach: <explanation>
  comments.forEach(comment => {
    if (comment.getKind() === SyntaxKind.SingleLineCommentTrivia) {
      comment.remove()
    }
  })

  sourceFile.insertStatements(0, `// ${file.checksum}`)
}, schemaTags.updateChecksum)
