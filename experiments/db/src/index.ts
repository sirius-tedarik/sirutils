import '../schemas/_'
import { users } from '../schemas/_'

const data = users({
  name: 'ahmet',
  age: 15,
  surname: 'eker',
  id: '',
  attributes: [
    {
      id: 15,
    },
  ],
})

if (data.isErr()) {
  // biome-ignore lint/nursery/noConsole: <explanation>
  console.error(data.error.data)
}
