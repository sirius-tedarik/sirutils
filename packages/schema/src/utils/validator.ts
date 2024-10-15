import Validator from 'fastest-validator'

export const validator = new Validator({
  considerNullAsAValue: true,
})

validator.add('ulid', ({ messages }) => {
  return {
    source: `
        if((/^[a-zA-Z0-9]{26}$/gm.test(value))) {
            return value
        }
            
        ${validator.makeError({ type: 'evenNumber', actual: 'value', messages })}
    `,
  }
})
