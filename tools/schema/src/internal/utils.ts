import { join, relative } from 'node:path'

export const toRelativeTsPath = (dir: string, path: string) =>
  `./${relative(join(process.cwd(), dir, '_'), join(process.cwd(), path.replace('.ts', '')))}`
