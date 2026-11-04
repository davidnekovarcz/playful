/**
 * Playful high scores live in the Smarlify API Firestore project (`smarlify-api`),
 * collection `leaderboards/{gameId}/scores`. That board has scores from 2025-11-12.
 * New submits must use the same path so old and new rows are one list.
 */

export const HIGH_SCORE_GAMES = [
  { gameName: 'Marooned', gameId: 'marooned' },
  { gameName: 'GTA Praha', gameId: 'gta-praha' },
  { gameName: 'Crossy Road', gameId: 'crossy-road' },
  { gameName: 'Traffic Run', gameId: 'traffic-run' },
] as const;

export type HighScoreGameId = (typeof HIGH_SCORE_GAMES)[number]['gameId'];
export type HighScoreGameName = (typeof HIGH_SCORE_GAMES)[number]['gameName'];

export interface ScoreWriteInput {
  gameName: string;
  score: number;
  name: string;
  email?: string;
  uid?: string;
  level?: number;
  createdAt?: Date;
}

export interface ScoreWrite {
  /** Firestore path segments. Never the legacy flat `leaderboard` collection. */
  collectionPath: ['leaderboards', HighScoreGameId, 'scores'];
  data: {
    name: string;
    score: number;
    gameName: HighScoreGameName;
    createdAt: Date;
    email?: string;
    uid?: string;
    level?: number;
  };
}

export function gameIdForHighScore(gameName: string): HighScoreGameId | null {
  const row = HIGH_SCORE_GAMES.find((game) => game.gameName === gameName);
  return row ? row.gameId : null;
}

/** Build the document a finished game writes. Throws instead of using a denied collection. */
export function buildScoreWrite(input: ScoreWriteInput): ScoreWrite {
  const gameId = gameIdForHighScore(input.gameName);
  if (!gameId) {
    throw new Error(`No high-score board for ${input.gameName}`);
  }
  if (!Number.isFinite(input.score) || input.score <= 0) {
    throw new Error('Score must be greater than zero');
  }
  const name = input.name.trim();
  if (!name) {
    throw new Error('Name is required');
  }

  const gameName = input.gameName as HighScoreGameName;
  const data: ScoreWrite['data'] = {
    name,
    score: input.score,
    gameName,
    createdAt: input.createdAt ?? new Date(),
  };
  if (input.email) data.email = input.email;
  if (input.uid) data.uid = input.uid;
  if (input.level !== undefined) data.level = input.level;

  return {
    collectionPath: ['leaderboards', gameId, 'scores'],
    data,
  };
}

export interface RankedScore {
  name: string;
  score: number;
}

/** One list, highest first. Historical rows and a new submit share this ranking. */
export function rankScores<T extends RankedScore>(rows: T[], limit = 10): T[] {
  return [...rows]
    .filter((row) => Number.isFinite(row.score))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, limit);
}
