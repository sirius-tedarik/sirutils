import { ProjectError, getCircularReplacer } from '@sirutils/core'
import { CACHEABLE_OPERATIONS, createAdapter } from '../src'
import { logger } from '../src/internal/logger'

const mysql = await createAdapter(
  async () => ({
    handleJson: data => JSON.stringify(data, getCircularReplacer),
    handleRaw: data => data.toString(),
    parameterPattern: () => '?',
    transformData: data => data,
    transformResponse: data => data,
    generateCacheKey: query => {
      if (!query.builder.cache.tableName || query.builder.cache.tableName.length === 0) {
        ProjectError.create('generate-cache-key' as Sirutils.ErrorValues, 'test').throw()
      }

      if (query.builder.operations.some(operation => !CACHEABLE_OPERATIONS.includes(operation))) {
        ProjectError.create(
          'generate-cache-key-cache-evicted' as Sirutils.ErrorValues,
          'test'
        ).throw()
      }

      let result = `${query.builder.cache.tableName}#${query.builder.cache.entry}`
      result = result.trim()
      if (result === '') {
        ProjectError.create('generate-cache-key-result' as Sirutils.ErrorValues, 'test').throw()
      }
      return result
    },

    columns: (columns: string[] = []) => {
      const str = columns.length === 0 ? '*' : columns.join(',')

      return mysql.extra('columns', str, undefined, false)
    },

    table: (tableName: string) => {
      return mysql.extra('tableName', tableName, undefined, false)
    },
  }),
  'mysql-adapter' as Sirutils.ErrorValues
)

const logic = mysql.and([
  mysql.or([{ age: 15 }, { name: 'salih' }]),
  mysql.or([{ age: 15 }, { name: 'ahmet' }]),
])
const query = mysql.query`SELECT ${mysql.columns()} FROM ${mysql.table('users')} WHERE ${logic}`
const cacheKey = mysql.generateCacheKey(query)

logger.info(query, cacheKey)
