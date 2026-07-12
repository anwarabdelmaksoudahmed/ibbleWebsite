import { describe, it, expect } from 'vitest'
import { cn } from '@shared/utils/cn'
import { hasPermission } from '@core/permissions/checker'

describe('cn utility', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('filters falsy values', () => {
    expect(cn('foo', false && 'bar', undefined, 'baz')).toBe('foo baz')
  })
})

describe('hasPermission', () => {
  it('checks any permission by default', () => {
    const permissions = ['dashboard.view', 'products.view'] as const
    expect(hasPermission([...permissions], 'dashboard.view')).toBe(true)
    expect(hasPermission([...permissions], ['orders.view', 'products.view'])).toBe(true)
    expect(hasPermission([...permissions], ['orders.view', 'customers.view'])).toBe(false)
  })

  it('checks all permissions when mode is all', () => {
    const permissions = ['dashboard.view', 'products.view'] as const
    expect(hasPermission([...permissions], ['dashboard.view', 'products.view'], 'all')).toBe(true)
    expect(hasPermission([...permissions], ['dashboard.view', 'orders.view'], 'all')).toBe(false)
  })
})
