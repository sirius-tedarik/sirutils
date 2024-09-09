import { ServiceBroker } from 'moleculer'
import { WizardLogger } from '../src/internal/logger'

const broker = new ServiceBroker({
  logger: new WizardLogger(),
})

// Define a service
const service = broker.createService({
  name: 'math',
  actions: {
    add(ctx) {
      service.logger.warn('as')
      return Number(ctx.params.a) + Number(ctx.params.b)
    },
  },
})

await broker.start()

const result = await broker.call('math.add', {
  a: 5,
  b: 8,
})
