import type { BlobType, ResultAsync } from '@sirutils/core'
import type { customTypeCompiler } from '@sirutils/schema'
import type { Server } from 'bun'

import type { importErrorConfig } from '../internal/error-config'
import type { WizardPlugin } from '../plugin/main'
import type { WizardTags } from '../tag'
import type { Router } from '../utils/router'

declare global {
  namespace Sirutils {
    interface CustomErrors {
      wizard: WizardTags
    }

    namespace Plugins {
      interface Definitions {
        wizard: Sirutils.PluginSystem.ExtractDefinition<WizardPlugin>
      }

      interface SystemApi {
        wizard: Sirutils.Plugins.Definitions['wizard']['api']
      }
    }

    interface Env {
      target: 'node' | 'bun'
      mode: 'dev' | 'prod'
      errors: 'hash' | 'complete'
      errorConfigPath: string
    }

    namespace Wizard {
      interface Options {
        name?: Sirutils.ErrorValues
        host: string
        port: string
      }

      type PluginContext = Sirutils.PluginSystem.PluginContext<
        Sirutils.Wizard.Options,
        Sirutils.Wizard.Api
      >

      type RawHandler<T> = (
        ctx: PluginContext,
        req: WizardRequest<T>
      ) => T[] | Promise<T[]> | Response

      type RawHandlerDummy<T> = (ctx: PluginContext, req: WizardRequest<T>) => BlobType

      type Handler<T> = (
        ctx: PluginContext,
        req: WizardRequest<T>
      ) => ResultAsync<T, Sirutils.ProjectErrorType>

      namespace InternalApis {
        interface Service<T> {
          find: (
            cb: Sirutils.Wizard.RawHandler<T>,
            options?: {
              after?: boolean
            }
          ) => Sirutils.Wizard.InternalApis.Service<T>
          create: (
            cb: Sirutils.Wizard.RawHandler<T>,
            options?: {
              before?: ReturnType<typeof customTypeCompiler> | boolean
              after?: boolean
            }
          ) => Sirutils.Wizard.InternalApis.Service<T>
          update: (
            cb: Sirutils.Wizard.RawHandler<T>,
            options?: {
              before?: ReturnType<typeof customTypeCompiler> | boolean
              after?: boolean
            }
          ) => Sirutils.Wizard.InternalApis.Service<T>
          patch: (
            cb: Sirutils.Wizard.RawHandler<T>,
            options?: {
              before?: ReturnType<typeof customTypeCompiler> | boolean
              after?: boolean
            }
          ) => Sirutils.Wizard.InternalApis.Service<T>
          delete: (
            cb: Sirutils.Wizard.RawHandlerDummy<T>
          ) => Sirutils.Wizard.InternalApis.Service<T>
        }
      }

      namespace PublicApis {
        interface Base {
          router: Router
          errors: ReturnType<typeof importErrorConfig> extends ResultAsync<infer T, BlobType>
            ? T
            : never
          service: <T>(
            name: string,
            version: string,
            validator: ReturnType<typeof customTypeCompiler>
          ) => Sirutils.Wizard.InternalApis.Service<T>

          listen: () => Server
        }
      }

      interface Api extends Sirutils.Wizard.PublicApis.Base {}
    }
  }
}
