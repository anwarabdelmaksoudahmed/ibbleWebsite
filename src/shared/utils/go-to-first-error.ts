export type GoToFirstErrorOptions = {
  /** Limit search to a form/panel. Accepts an element, CSS selector, or null for `document`. */
  root?: ParentNode | Element | string | null
  behavior?: ScrollBehavior
  block?: ScrollLogicalPosition
}

const FOCUSABLE_SELECTOR = [
  'input:not([disabled]):not([type="hidden"])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  'button:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function resolveRoot(root?: GoToFirstErrorOptions['root']): ParentNode | null {
  if (!import.meta.client) return null
  if (root == null || root === '') return document
  if (typeof root === 'string') return document.querySelector(root)
  return root
}

function prefersReducedMotion(): boolean {
  if (!import.meta.client) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function findFocusableNear(el: HTMLElement): HTMLElement {
  if (el.matches(FOCUSABLE_SELECTOR)) return el

  const fieldRoot = el.closest<HTMLElement>('[data-field]') ?? el.parentElement
  const nested = fieldRoot?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
  if (nested) return nested

  return el
}

function scrollAndFocus(el: HTMLElement, options: GoToFirstErrorOptions): void {
  const target = findFocusableNear(el)
  const behavior = prefersReducedMotion() ? 'auto' : (options.behavior ?? 'smooth')

  let addedTabIndex = false
  if (!target.matches(FOCUSABLE_SELECTOR) && !target.hasAttribute('tabindex')) {
    target.setAttribute('tabindex', '-1')
    addedTabIndex = true
  }

  target.scrollIntoView({
    behavior,
    block: options.block ?? 'center',
  })

  try {
    target.focus({ preventScroll: true })
  } catch {
    // Scroll alone is enough if focus is rejected.
  }

  if (addedTabIndex) {
    const onBlur = () => {
      target.removeAttribute('tabindex')
      target.removeEventListener('blur', onBlur)
    }
    target.addEventListener('blur', onBlur)
  }
}

async function waitForDomPaint(): Promise<void> {
  await nextTick()
  if (!import.meta.client) return
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })
}

/**
 * Scrolls to and focuses the first validation error in the current view.
 * Prefer `[aria-invalid="true"]`, then `[data-validation-error]` banners.
 */
export async function goToFirstError(options: GoToFirstErrorOptions = {}): Promise<boolean> {
  await waitForDomPaint()

  const scope = resolveRoot(options.root)
  if (!scope) return false

  const invalidControl = scope.querySelector<HTMLElement>('[aria-invalid="true"]')
  if (invalidControl) {
    scrollAndFocus(invalidControl, options)
    return true
  }

  const banner = scope.querySelector<HTMLElement>('[data-validation-error]')
  if (banner) {
    scrollAndFocus(banner, options)
    return true
  }

  return false
}
