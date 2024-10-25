import { err, ok } from '@sirutils/std/results'

export const sayHi = (name?: string): Std.Result<string> => {
  if (!name) {
    return err('?invalidData', 'name is undefined')
  }

  return ok(`Hi ${name}`)
}

const alice = sayHi('alice')
const yui = sayHi('yui')
const other = sayHi()

console.log(alice, yui, other)
