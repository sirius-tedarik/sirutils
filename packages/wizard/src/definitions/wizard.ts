import type { BlobType, EmptyType, Fn, Simplify } from '@sirutils/core'
import type formidable from 'formidable'
import type Moleculer from 'moleculer'
import type {
  CacherOptions,
  CallingOptions,
  ActionSchema as MoleculerActionSchema,
  Service as MoleculerService,
  ServiceBroker,
} from 'moleculer'

import type { WizardTags } from '../tag'
import type { createWizard } from '../utils/create'

declare global {
  namespace Sirutils {
    interface CustomErrors {
      wizard: WizardTags
    }

    interface PluginDefinitions {
      wizard: Sirutils.PluginSystem.ExtractDefinition<typeof createWizard>
    }

    interface WizardServices {}

    namespace Wizard {
      interface Options {
        environment?: 'production' | 'development' | 'test'
        id?: string
        nats?: string
        port?: string
        host?: string
      }

      interface Service<
        T,
        S,
        R extends Record<
          string,
          Sirutils.Wizard.ActionSchema<BlobType, BlobType, BlobType, BlobType>
        >,
      > {
        $service: Moleculer.Service
      }

      interface BaseApi {
        broker: ServiceBroker
        gateway: MoleculerService
      }

      interface ServiceOptions<
        T extends string,
        S extends string,
        R extends Record<
          string,
          Sirutils.Wizard.ActionSchema<BlobType, BlobType, BlobType, BlobType>
        >,
      > {
        name: T
        version: S
        description: string

        actions?: R

        created?: <B, P, Q>(ctx: Sirutils.Wizard.ActionContext<B, P, Q>) => BlobType
      }

      type ActionNames = {
        [K in keyof Sirutils.WizardServices as Sirutils.WizardServices[K] extends Sirutils.Wizard.Service<
          BlobType,
          BlobType,
          infer R
        >
          ? keyof R extends string
            ? `${K}#${keyof R}`
            : never
          : never]: BlobType
      }

      type ExtractActionName<T extends keyof Sirutils.Wizard.ActionNames> =
        T extends `${infer N}#${infer M}`
          ? N extends keyof Sirutils.WizardServices
            ? Sirutils.WizardServices[N] extends Sirutils.Wizard.Service<
                BlobType,
                BlobType,
                infer R
              >
              ? M extends keyof R
                ? R[M]
                : never
              : never
            : never
          : never

      interface ServiceApi {
        service: <
          const T extends string,
          const S extends string,
          const R extends Sirutils.Wizard.ActionList,
        >(
          service: Sirutils.Wizard.ServiceOptions<T, S, R>
        ) => Promise<Sirutils.Wizard.Service<T, S, R>>

        call: <const N extends keyof Sirutils.Wizard.ActionNames>(
          name: N,
          params: Sirutils.Wizard.ExtractActionName<N> extends Fn<BlobType, infer Sa>
            ? Sa extends Sirutils.Wizard.ActionSchema<infer B, infer P, infer Q, BlobType>
              ? Simplify<
                  (B extends { $$async?: never } ? EmptyType : B) &
                    (P extends { $$async?: never } ? EmptyType : P) &
                    (Q extends { $$async?: never } ? EmptyType : Q)
                >
              : never
            : never,
          options?: CallingOptions & { stream?: NodeJS.ReadableStream }
        ) => Promise<
          Sirutils.Wizard.ExtractActionName<N> extends Fn<BlobType, infer Sa>
            ? Sa extends Sirutils.Wizard.ActionSchema<BlobType, BlobType, BlobType, infer R>
              ? R
              : never
            : never
        >
      }

      interface ActionContext<B, P, Q> {
        logger: Moleculer.LoggerInstance
        body: B extends Sirutils.Schema.ValidationSchema<BlobType>
          ? Sirutils.Schema.Compose<Sirutils.Schema.ExtractSchemaType<B>>
          : never
        params?: P extends Sirutils.Schema.ValidationSchema<BlobType>
          ? Sirutils.Schema.Compose<Sirutils.Schema.ExtractSchemaType<P>>
          : never
        queries?: Q extends Sirutils.Schema.ValidationSchema<BlobType>
          ? Sirutils.Schema.Compose<Sirutils.Schema.ExtractSchemaType<Q>>
          : never

        req?: Request
        res?: Response
        streams?: [NodeJS.ReadableStream, BlobType][]
      }

      interface ActionSchema<B, P, Q, R> extends MoleculerActionSchema {}

      type ActionList = Record<
        string,
        Sirutils.Wizard.ActionSchema<BlobType, BlobType, BlobType, BlobType>
      >

      type ActionHandler<B, P, Q, R> = (ctx: Sirutils.Wizard.ActionContext<B, P, Q>) => R

      interface ActionApi {
        createAction: <
          const B extends Sirutils.Schema.ValidationSchema<BlobType>,
          const P extends Sirutils.Schema.ValidationSchema<BlobType>,
          const Q extends Sirutils.Schema.ValidationSchema<BlobType>,
          Hr,
        >(
          meta: {
            body?: B
            params?: P
            queries?: Q
            rest?: true | string | string[]
            cache?: boolean | CacherOptions
            stream?: boolean
            multipart?: formidable.Options | boolean
          },
          handler: Sirutils.Wizard.ActionHandler<NoInfer<B>, NoInfer<P>, NoInfer<Q>, Hr>
        ) => (
          serviceOptions: Sirutils.Wizard.ServiceOptions<BlobType, BlobType, BlobType>,
          actionName: string
        ) => Sirutils.Wizard.ActionSchema<
          B extends Sirutils.Schema.ValidationSchema<BlobType>
            ? Sirutils.Schema.Compose<Sirutils.Schema.ExtractSchemaType<B>>
            : never,
          P extends Sirutils.Schema.ValidationSchema<BlobType>
            ? Sirutils.Schema.Compose<Sirutils.Schema.ExtractSchemaType<P>>
            : never,
          Q extends Sirutils.Schema.ValidationSchema<BlobType>
            ? Sirutils.Schema.Compose<Sirutils.Schema.ExtractSchemaType<Q>>
            : never,
          Hr
        >
      }

      type Context = Sirutils.PluginSystem.Context<
        Sirutils.Wizard.Options,
        Sirutils.Wizard.BaseApi & Sirutils.Wizard.ServiceApi & Sirutils.Wizard.ActionApi
      >
    }
  }
}
