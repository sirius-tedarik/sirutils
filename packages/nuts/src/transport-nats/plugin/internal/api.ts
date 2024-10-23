import {
  type BlobType,
  type Err,
  ProjectError,
  createActions,
  group,
  ok,
  wrap,
} from '@sirutils/core'
import { ErrorCode, type NatsError } from 'nats'

import { isRawObject } from '@sirutils/toolbox'
import { DEFAULT_SEND_TIMOUT } from '../../internal/consts'
import { natsTags } from '../../tag'

export const transportApiActions = createActions(
  (context: Sirutils.Nuts.Nats.Context): Sirutils.Nuts.Nats.TransportApi => {
    const serializer = context.lookup('nuts-serializer')

    const handleNatsError = (natsError: NatsError) => {
      switch (natsError?.code) {
        case ErrorCode.NoResponders:
          return natsTags.noResponse

        case ErrorCode.Timeout:
          return natsTags.timeout

        default:
          return natsTags.unexpected
      }
    }

    return {
      send: async (subject, rawData, options = {}) => {
        options.timeout = DEFAULT_SEND_TIMOUT

        const response = await group(() =>
          context.api.$connection.request(
            subject,
            serializer.encode(rawData),
            options as Required<Sirutils.Nuts.TransportApiMethodOptions['send']>
          )
        )

        if (response.isErr()) {
          return response.error
            .appendCause(handleNatsError(response.error.data[0]))
            .appendData(response.error)
            .throw()
        }

        const decoded = serializer.decode(Buffer.from(response.value.data))

        if (
          isRawObject(decoded) &&
          'name' in decoded &&
          'message' in decoded &&
          'cause' in decoded &&
          'data' in decoded &&
          'timestamp' in decoded
        ) {
          const error = ProjectError.create(
            decoded.name as Sirutils.ErrorValues,
            decoded.message as string,
            ...(decoded.cause as Sirutils.ErrorValues[])
          ).appendData(...(decoded.data as BlobType[]))

          error.timestamp = decoded.timestamp as number

          return error.throw()
        }

        return decoded as BlobType
      },

      listen: <T, R>(
        subject: string,
        options: Sirutils.Nuts.TransportApiMethodOptions['listen'],
        rawCallback: (result: Sirutils.ProjectResult<T>) => R | Promise<R>
      ) => {
        if (typeof options.type === 'undefined') {
          options.type = 'tolerate'
        }

        const callback = wrap(
          rawCallback,
          `${natsTags.api}#listen.callback` as Sirutils.ErrorValues
        )

        const subscribtion = context.api.$connection.subscribe(subject, {
          ...options,
          callback: async (rawError, rawData) => {
            const data = (
              rawError
                ? ProjectError.create(natsTags.unexpected, 'unexpected')
                    .appendCause(handleNatsError(rawError))
                    .appendData(rawError)
                    .asResult()
                : ok(serializer.decode(Buffer.from(rawData.data)))
            ) satisfies Sirutils.ProjectResult<BlobType>

            const result = (await callback(data)) as Sirutils.ProjectResult<R>

            rawData.respond(serializer.encode(result.isOk() ? result.value : { ...result.error }))

            if (options.type === 'break' && result.isErr()) {
              return subscribtion.unsubscribe()
            }

            if (options.type === 'tolerate' && result.isErr()) {
              return
            }

            if (result.isErr()) {
              context.options.logger?.error(
                (result as Err<unknown, ProjectError>).error.stringify()
              )
            }

            return
          },
        })

        return subscribtion.unsubscribe
      },
    }
  },
  natsTags.api
)
