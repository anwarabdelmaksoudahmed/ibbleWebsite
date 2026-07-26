export type ChartSlice = {
  id: string
  label: string
  value: number
  color?: string
}

export type LazyChartKind = 'doughnut' | 'bar'
