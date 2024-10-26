import { err, fn, ok, safeTry } from '@sirutils/std/results'

interface User {
  name: string
  age: number
}

const users: User[] = [
  {
    name: 'alice',
    age: 19,
  },
]

const getUser = fn((name: string) => {
  const found = users.find(user => user.name === name)

  if (!found) {
    return err('?notFound', 'user not found')
  }

  return ok(found)
}, '?getUser')

const sayHi = (name?: string) =>
  safeTry(function* () {
    if (!name) {
      return err('?invalidParams', 'name should be defined')
    }

    const found = yield* getUser(name)

    if (found.age < 18) {
      yield* err('?underage', 'under age')
    }

    return `Hi ${found.name}-${found.age}`
  }, '?sayHi')

// biome-ignore lint/suspicious/noConsole: <explanation>
console.log(sayHi('alice'))
