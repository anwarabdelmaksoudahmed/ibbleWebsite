/** Brand-aligned chart palette (Ibbil green / gold family). */
export const CHART_PALETTE = [
  '#2d533d',
  '#d4a044',
  '#4a7a5c',
  '#c09030',
  '#1f3a2b',
  '#8fa894',
  '#e8c988',
  '#6b8f78',
] as const

export const CHART_COLORS = {
  green: '#2d533d',
  greenSoft: 'rgba(45, 83, 61, 0.72)',
  greenMuted: 'rgba(45, 83, 61, 0.18)',
  gold: '#d4a044',
  goldSoft: 'rgba(212, 160, 68, 0.78)',
  goldMuted: 'rgba(212, 160, 68, 0.2)',
  grid: 'rgba(45, 83, 61, 0.08)',
  label: '#5b6b61',
  tooltipBg: '#1f3a2b',
  tooltipText: '#ffffff',
} as const

export function chartColorAt(index: number): string {
  return CHART_PALETTE[index % CHART_PALETTE.length]!
}

export function chartColors(count: number): string[] {
  return Array.from({ length: count }, (_, i) => chartColorAt(i))
}
