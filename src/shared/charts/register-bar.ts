import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js'

let registered = false

export function ensureBarChartRegistered() {
  if (registered) return
  ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)
  registered = true
}
