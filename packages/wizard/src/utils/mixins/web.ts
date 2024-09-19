import { type BlobType, group, wrap } from '@sirutils/core'

import type Moleculer from 'moleculer'
import ApiService from 'moleculer-web'

// Holding brokers' http servers
const serverEntiries: [string, Moleculer.Service][] = []

export const web = (context: Sirutils.Wizard.Context, service: BlobType) =>
  group(() => {
    return {
      // Runs when a mixin instance is created
      created() {
        const broker = context.api.broker
        const brokerNodeID = broker.nodeID

        const serverEntirie = serverEntiries.find(([nodeID, _server]) => {
          return brokerNodeID === nodeID
        })

        // Create aliases for redirect to endpoints
        const createAliases = (aliases: [string, string[]][]) => {
          const result: { [k: string]: BlobType } = {}
          // biome-ignore lint/complexity/noForEach: <explanation>
          aliases.forEach(([endpoint, methods]) => {
            // biome-ignore lint/complexity/noForEach: <explanation>
            methods.forEach(method => {
              result[`${method} ${endpoint}`] = (req: BlobType, res: BlobType) => {
                // Process http request safely
                wrap(service.actions[endpoint](req, res))
              }
            })
          })
          return result
        }

        if (serverEntirie) {
          // If broker has a running moleculer-web server, aliases is added to it with .addRoute()
          serverEntirie[1].addRoute({
            path: `/${service.name}`,
            aliases: createAliases(Object.entries(service.settings.http)),
          })
        } else {
          const aliases = createAliases(Object.entries(service.settings.http))

          const serverConfig = {
            name: 'api',
            mixins: [ApiService],
            settings: {
              routes: [
                {
                  path: `/${service.name}`,
                  aliases,
                },
              ],
            },
          }

          const server = broker.createService(serverConfig)
          serverEntiries.push([brokerNodeID, server])
        }
      },
    }
  })
