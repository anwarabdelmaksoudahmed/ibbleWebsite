import type { ChartOptions, TooltipItem } from 'chart.js'
import { CHART_COLORS } from './colors'

function prefersReducedMotion(): boolean {
  if (!import.meta.client) return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function baseFont() {
  return {
    family: "'Tajawal', 'Inter', ui-sans-serif, system-ui, sans-serif",
    size: 12,
  }
}

export function createBaseChartOptions(isRtl = false): ChartOptions {
  const reduceMotion = prefersReducedMotion()

  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: reduceMotion
      ? false
      : {
          duration: 650,
          easing: 'easeOutQuart',
        },
    interaction: {
      mode: 'nearest',
      intersect: true,
    },
    plugins: {
      legend: {
        position: isRtl ? 'left' : 'right',
        align: 'center',
        rtl: isRtl,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
          boxHeight: 8,
          padding: 14,
          color: CHART_COLORS.label,
          font: baseFont(),
        },
      },
      tooltip: {
        backgroundColor: CHART_COLORS.tooltipBg,
        titleColor: CHART_COLORS.tooltipText,
        bodyColor: CHART_COLORS.tooltipText,
        cornerRadius: 10,
        padding: 10,
        displayColors: true,
        boxPadding: 4,
        titleFont: { ...baseFont(), weight: 700, size: 13 },
        bodyFont: baseFont(),
        rtl: isRtl,
        textDirection: isRtl ? 'rtl' : 'ltr',
      },
    },
  }
}

export function createDoughnutOptions(isRtl = false): ChartOptions<'doughnut'> {
  const base = createBaseChartOptions(isRtl) as ChartOptions<'doughnut'>

  return {
    ...base,
    cutout: '68%',
    plugins: {
      ...base.plugins,
      legend: {
        ...base.plugins?.legend,
        position: 'bottom',
        align: 'center',
      },
      tooltip: {
        ...base.plugins?.tooltip,
        callbacks: {
          label(ctx: TooltipItem<'doughnut'>) {
            const label = ctx.label ?? ''
            const value = typeof ctx.parsed === 'number' ? ctx.parsed : 0
            const total = ctx.dataset.data.reduce<number>((sum, item) => {
              return sum + (typeof item === 'number' ? item : 0)
            }, 0)
            const pct = total > 0 ? Math.round((value / total) * 100) : 0
            return `${label}: ${value} (${pct}%)`
          },
        },
      },
    },
  }
}

export function createBarOptions(isRtl = false): ChartOptions<'bar'> {
  const base = createBaseChartOptions(isRtl) as ChartOptions<'bar'>

  return {
    ...base,
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: CHART_COLORS.label,
          font: baseFont(),
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: CHART_COLORS.grid,
        },
        border: { display: false },
        ticks: {
          color: CHART_COLORS.label,
          font: baseFont(),
          precision: 0,
        },
      },
    },
    plugins: {
      ...base.plugins,
      legend: {
        display: false,
      },
    },
  }
}
