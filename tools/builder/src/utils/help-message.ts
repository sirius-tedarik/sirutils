export const createHelpMessage = (
  usage: string[] | readonly string[] = [],
  commands: string[] | readonly string[] = [],
  options: string[] | readonly string[] = [],
  others: string[] | readonly string[] = []
) => {
  return `
Usage
  ${usage.map(str => `\t${str}`).join('\n')}

Commands
  ${commands.map(str => `\t${str}`).join('\n')}

Options
  ${options.map(str => `\t${str}`).join('\n')}

${others.map(str => `\t${str}`).join('\n')}
`
}

export const helpMessages = {
  usage: ['$ sirbuilder <input>'],
  commands: ['$ sirbuilder build -e'],
  options: [
    "--entrypoints, -e Entry names, default to ['src/**/*.ts']",
    '--externals, -x Entry names, default to []',
    '--outdir, -o Output folder name, default to "dist"',
    '--minify, -m to compress the output, default to true',
    "--target, -t to output mode, default to bun, choises ['bun', 'node', 'browser']",
    "--sourcemap, -s to output sourcemaps, default to external, choises ['external', 'inline', 'none']",
    '--cwd current working directory, default to process.cwd()',
    '\n',
    '--externall-all, -a to mark all the dependencies as external, default true',
    '--help, -h to display the help message',
  ],
  others: [],
}
