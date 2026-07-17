export function formatDistanceKm(meters: number): string {
  const km = meters / 1000
  if (km >= 100) return km.toFixed(0)
  if (km >= 10) return km.toFixed(1)
  return km.toFixed(2)
}
