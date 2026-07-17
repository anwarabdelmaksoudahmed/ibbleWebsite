import { goToFirstError, type GoToFirstErrorOptions } from '@shared/utils/go-to-first-error'

/**
 * Thin wrapper so callers can bind a template ref as the search root.
 *
 * @example
 * const formRef = ref<HTMLElement | null>(null)
 * const { goToFirstError } = useGoToFirstError(formRef)
 * if (!valid) await goToFirstError()
 */
export function useGoToFirstError(
  root?: MaybeRefOrGetter<GoToFirstErrorOptions['root']>,
) {
  async function run(overrides: GoToFirstErrorOptions = {}): Promise<boolean> {
    const resolvedRoot =
      overrides.root !== undefined
        ? overrides.root
        : root !== undefined
          ? toValue(root)
          : undefined

    return goToFirstError({
      ...overrides,
      root: resolvedRoot,
    })
  }

  return { goToFirstError: run }
}
