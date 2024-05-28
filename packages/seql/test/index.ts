import { Seql } from '../src'
import { generateCacheKey } from '../src/utils/generator'
import { logger } from '../src/internal/logger'

export const query = Seql.query`SELECT * FROM users WHERE ${Seql.or([
  Seql.and({
    name: 'ahmet',
    surname: 'eker',
  }),
  Seql.and({
    name: 'fatih',
    surname: 'yıldırım',
  }),
  Seql.and({
    name: 'volkan',
    surname: 'moğol',
  }),
])}`

logger.info('result query', query, generateCacheKey(query))
