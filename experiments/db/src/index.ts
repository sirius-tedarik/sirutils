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

/*
wrap((data: ${_.upperFirst(file.name)}) => {
  const result = compiled.Check(data)

  if (!result) {
    unwrap(
      ProjectError.create(schemaTags.invalidData, 'invalid data')
        .appendData([...compiled.Errors(data)])
        .asResult()
    )
  }

  return true as const
}, schemaTags.invalidData)
 */
