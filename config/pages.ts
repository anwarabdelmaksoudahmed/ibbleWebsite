import type { Dirent } from 'node:fs'
import { readdirSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import type { NuxtPage } from 'nuxt/schema'

/**
 * Scans module page directories and registers routes with Nuxt.
 * Pattern: src/modules/{module}/pages/{path}.vue -> /{module}/{path}
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

function registerPagesFromDir(
  pages: NuxtPage[],
  dir: string,
  basePath: string,
  moduleName: string,
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
      registerPagesFromDir(pages, fullPath, `${basePath}/${entry.name}`, moduleName)
      continue
    }

    if (!entry.name.endsWith('.vue')) continue

    const pageName = entry.name.replace('.vue', '')
    const routePath = pageName === 'index' ? basePath : `${basePath}/${pageName}`
    const routeName = `${moduleName}-${pageName === 'index' ? 'index' : pageName}`

    pages.push({
      name: routeName,
      path: routePath,
      file: fullPath,
    })
  }
}
