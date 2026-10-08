/** Island minutes from a Marooned GAME_OVER score, shown as days and hours. */
export function formatSurvivedMinutes(minutes: number): string {
  const total = Math.max(0, Math.floor(minutes));
  const days = Math.floor(total / (24 * 60));
  const hours = Math.floor((total % (24 * 60)) / 60);
  if (days > 0 && hours > 0) return `${days}d ${hours}h`;
  if (days > 0) return `${days}d`;
  return `${hours}h`;
}
