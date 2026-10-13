/** GTA Praha high score is distance driven in whole metres. */
export function formatGtaDistance(metres: number): string {
  const m = Math.max(0, Math.round(Number(metres) || 0));
  if (m >= 1000) return `${(m / 1000).toFixed(2)} km`;
  return `${m} m`;
}
