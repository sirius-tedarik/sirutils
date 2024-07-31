import { type BlobType, ProjectError, unwrap, wrapAsync } from '@sirutils/core'
import { URLPattern } from 'urlpattern-polyfill'

import { wizardTags } from '../tag'

class Route {
  constructor(
    public method: string,
    public urlPattern: URLPattern,
    public handler: Sirutils.Wizard.Handler<BlobType>
  ) {}
}

export type URLPatternResultParams = { [key: string]: string | undefined }

export class Router {
  private routeList: Route[] = []

  constructor(private ctx: Sirutils.Wizard.PluginContext) {}

  add(method: string, pattern: string, handler: Sirutils.Wizard.Handler<BlobType>): void {
    const route = new Route(
      method.toUpperCase(),
      new URLPattern({
        pathname: pattern,
      }),
      handler
    )
    this.routeList.push(route)
  }

  match = wrapAsync(async (request: WizardRequest<BlobType>) => {
    const url = request.url[request.url.length - 1] === '/' ? request.url.slice(0, -1) : request.url

    for (const route of this.routeList) {
      if (request.method === route.method) {
        const result = route.urlPattern.exec(url)

        if (result) {
          request.urlPattern = result
          request.params = Object.fromEntries(
            Object.entries(result.pathname.groups).map((data: BlobType) => {
              if (data[1]?.includes('/')) {
                data[1] = data[1].split('/')
              }

              return data
            })
          )

          const response = await route.handler(this.ctx, request)

          return unwrap(response)
        }
      }
    }

    ProjectError.create(wizardTags.badUrl, request.url).throw()
  }, wizardTags.match)
}
