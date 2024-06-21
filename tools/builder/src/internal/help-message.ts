export const helpMessage = `
  Usage
    $ sirbuilder <input>
  
  Commands
    $ sirbuilder build -e

  Options
    --entrypoints, -e Entry names, default to ['src/**/*.ts']
    --externals, -x Entry names, default to []
    --outdir, -o Output folder name, default to "dist"
    --minify, -m to compress the output, default to true
    --target, -t to output mode, default to bun, choises ['bun', 'node', 'browser']
    --sourcemap, -s to output sourcemaps, default to external, choises ['external', 'inline', 'none']
    --cwd current working directory, default to process.cwd()

    --externall-all, -a to mark all the dependencies as external, default true
    --help, -h to display the help message
`
