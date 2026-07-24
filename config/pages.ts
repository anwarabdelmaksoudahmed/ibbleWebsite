import type { Dirent } from 'node:fs'
import { readdirSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import type { NuxtPage } from 'nuxt/schema'

/**
 * Scans module page directories and registers routes with Nuxt.
 * Pattern: src/modules/{module}/pages/{path}.vue -> /{module}/{path}
 *
 * Dynamic file segments are converted for vue-router:
 * - `[id].vue`      -> `/:id`
 * - `[...slug].vue` -> `/:slug(.*)*`
 * - `[[...slug]].vue` -> `/:slug(.*)*?`
 */
export function extendModulePages(pages: NuxtPage[], srcDir: string) {
  const modulesDir = resolve(srcDir, 'modules')

  let modules: string[]
  try {
    modules = readdirSync(modulesDir).filter((name) =>
      statSync(resolve(modulesDir, name)).isDirectory(),
    )
  } catch {
    return
  }

  for (const moduleName of modules) {
    registerPagesFromDir(pages, resolve(modulesDir, moduleName, 'pages'), `/${moduleName}`, moduleName)
  }
}

function fileNameToRouteSegment(fileName: string): string {
  if (fileName.startsWith('[[...') && fileName.endsWith(']]')) {
    return `:${fileName.slice(5, -2)}(.*)*?`
  }
  if (fileName.startsWith('[...') && fileName.endsWith(']')) {
    return `:${fileName.slice(4, -1)}(.*)*`
  }
  if (fileName.startsWith('[') && fileName.endsWith(']')) {
    return `:${fileName.slice(1, -1)}`
  }
  return fileName
}

function fileNameToRouteNamePart(fileName: string): string {
  if (fileName.startsWith('[[...') && fileName.endsWith(']]')) {
    return fileName.slice(5, -2)
  }
  if (fileName.startsWith('[...') && fileName.endsWith(']')) {
    return fileName.slice(4, -1)
  }
  if (fileName.startsWith('[') && fileName.endsWith(']')) {
    return fileName.slice(1, -1)
  }
  return fileName
}

function registerPagesFromDir(
  pages: NuxtPage[],
  dir: string,
  basePath: string,
  moduleName: string,
  namePrefix = moduleName,
) {
  let entries: Dirent[]
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }

  for (const entry of entries) {
    const fullPath = resolve(dir, entry.name)

    if (entry.isDirectory()) {
      const dirSegment = fileNameToRouteSegment(entry.name)
      const dirNamePart = fileNameToRouteNamePart(entry.name)
      registerPagesFromDir(
        pages,
        fullPath,
        `${basePath}/${dirSegment}`,
        moduleName,
        `${namePrefix}-${dirNamePart}`,
      )
      continue
    }

    if (!entry.name.endsWith('.vue')) continue

    const pageName = entry.name.replace(/\.vue$/, '')
    const segment = fileNameToRouteSegment(pageName)
    const routePath = pageName === 'index' ? basePath : `${basePath}/${segment}`
    const routeName =
      pageName === 'index'
        ? namePrefix === moduleName
          ? `${moduleName}-index`
          : namePrefix
        : `${namePrefix}-${fileNameToRouteNamePart(pageName)}`

    pages.push({
      name: routeName,
      path: routePath,
      file: fullPath,
    })
  }
}
