/** Public room visits on the Marooned island. One real day is 8 minutes. */
const VISITS_URL =
  "https://grand-island-survival-default-rtdb.europe-west1.firebasedatabase.app/rooms/demo/visits.json";
const DAY_SECONDS = 8 * 60;

export type IslandRecord = { name: string; score: number };

/** Island minutes, the same unit the hub stores as a Marooned score. */
export function islandMinutesFromLivedSeconds(seconds: number): number {
  const hours = (Math.max(0, seconds) / DAY_SECONDS) * 24;
  return Math.floor(hours * 60);
}

export function bestVisit(raw: unknown): IslandRecord | null {
  if (!raw || typeof raw !== "object") return null;
  let best: IslandRecord | null = null;
  for (const value of Object.values(raw as Record<string, unknown>)) {
    if (!value || typeof value !== "object") continue;
    const row = value as { name?: unknown; livedSeconds?: unknown };
    const lived = typeof row.livedSeconds === "number" && Number.isFinite(row.livedSeconds) ? row.livedSeconds : 0;
    const score = islandMinutesFromLivedSeconds(lived);
    if (score <= 0) continue;
    const name = typeof row.name === "string" && row.name.trim() ? row.name.trim() : "Survivor";
    if (!best || score > best.score) best = { name, score };
  }
  return best;
}

export async function fetchMaroonedRecord(): Promise<IslandRecord | null> {
  const response = await fetch(VISITS_URL);
  if (!response.ok) return null;
  return bestVisit(await response.json());
}
