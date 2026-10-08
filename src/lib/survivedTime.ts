/** Island minutes from a Marooned GAME_OVER score, shown as "2h 15m". */
export function formatSurvivedMinutes(minutes: number): string {
  const total = Math.max(0, Math.floor(minutes));
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  return `${hours}h ${mins}m`;
}
