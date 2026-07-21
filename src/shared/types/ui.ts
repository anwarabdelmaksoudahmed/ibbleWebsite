export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export type ComponentVariant =
  | 'primary'
  | 'brand'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success'
  | 'warning'
  | 'info'

export type ComponentState = {
  disabled?: boolean
  loading?: boolean
}

export const SIZE_CLASSES: Record<ComponentSize, string> = {
  xs: 'text-xs px-2 py-1',
  sm: 'text-sm px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-5 py-2.5',
  xl: 'text-lg px-6 py-3',
}

export const INPUT_SIZE_CLASSES: Record<ComponentSize, string> = {
  xs: 'text-xs px-2 py-1 h-7',
  sm: 'text-sm px-3 py-1.5 h-8',
  md: 'text-sm px-3 py-2 h-10',
  lg: 'text-base px-4 py-2.5 h-11',
  xl: 'text-lg px-4 py-3 h-12',
}

export const VARIANT_CLASSES: Record<ComponentVariant, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500',
  brand:
    'rounded-xl bg-ibbil-green px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-ibbil-green/20 transition-all hover:bg-ibbil-green-dark hover:shadow-lg active:scale-[0.99] focus-visible:ring-ibbil-green disabled:cursor-not-allowed disabled:opacity-60',
  secondary: 'bg-surface-muted text-foreground border border-border hover:bg-surface-elevated',
  outline: 'border border-border bg-transparent hover:bg-surface-muted text-foreground',
  ghost: 'bg-transparent hover:bg-surface-muted text-foreground',
  danger: 'bg-danger text-white hover:opacity-90',
  success: 'bg-success text-white hover:opacity-90',
  warning: 'bg-warning text-foreground hover:opacity-90',
  info: 'bg-info text-white hover:opacity-90',
}
