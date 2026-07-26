import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'

let registered = false

export function ensureDoughnutChartRegistered() {
  if (registered) return
  ChartJS.register(ArcElement, Tooltip, Legend)
  registered = true
}
