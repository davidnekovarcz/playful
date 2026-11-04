import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  HIGH_SCORE_GAMES,
  buildScoreWrite,
  rankScores,
  type ScoreWrite,
} from './leaderboardGames.ts';

/** Mirrors the live rules: the flat `leaderboard` collection is denied; the nested board accepts creates. */
class HighScoreStore {
  readonly rows = new Map<string, ScoreWrite['data'][]>();

  add(write: ScoreWrite): void {
    const [root, gameId, leaf] = write.collectionPath;
    if (root !== 'leaderboards' || leaf !== 'scores') {
      throw new Error('Missing or insufficient permissions');
    }
    const allowed = HIGH_SCORE_GAMES.some((game) => game.gameId === gameId);
    if (!allowed) {
      throw new Error('Missing or insufficient permissions');
    }
    const list = this.rows.get(gameId) ?? [];
    list.push(write.data);
    this.rows.set(gameId, list);
  }
}

function submit(store: HighScoreStore, input: Parameters<typeof buildScoreWrite>[0]): ScoreWrite {
  const write = buildScoreWrite(input);
  store.add(write);
  return write;
}

describe('high scores', () => {
  it('writes every game onto leaderboards/{gameId}/scores', () => {
    for (const game of HIGH_SCORE_GAMES) {
      const write = buildScoreWrite({
        gameName: game.gameName,
        score: 3,
        name: 'Player',
      });
      assert.deepEqual(write.collectionPath, ['leaderboards', game.gameId, 'scores']);
      assert.equal(write.collectionPath[0] === 'leaderboards', true);
      assert.notEqual(write.collectionPath.join('/'), 'leaderboard');
    }
  });

  it('accepts a signed-in Traffic Run score of 5 laps', () => {
    const store = new HighScoreStore();
    const write = submit(store, {
      gameName: 'Traffic Run',
      score: 5,
      name: 'David Nekovář',
      email: 'player@example.com',
      uid: 'signed-in-user',
    });

    assert.deepEqual(write.collectionPath, ['leaderboards', 'traffic-run', 'scores']);
    const saved = store.rows.get('traffic-run');
    assert.equal(saved?.length, 1);
    assert.equal(saved?.[0].name, 'David Nekovář');
    assert.equal(saved?.[0].score, 5);
    assert.equal(saved?.[0].uid, 'signed-in-user');
    assert.equal(saved?.[0].email, 'player@example.com');
  });

  it('keeps a 2025 score and a new submit on one board for each game', () => {
    const historicalCreatedAt = new Date('2025-11-12T07:43:10.917Z');

    for (const game of HIGH_SCORE_GAMES) {
      const store = new HighScoreStore();
      const historical = submit(store, {
        gameName: game.gameName,
        score: 4,
        name: 'Jan Michek',
        createdAt: historicalCreatedAt,
      });
      submit(store, {
        gameName: game.gameName,
        score: game.gameName === 'Traffic Run' ? 5 : 9,
        name: 'David Nekovář',
        uid: 'signed-in-user',
      });

      const ranked = rankScores(store.rows.get(game.gameId) ?? []);
      assert.equal(ranked.length, 2);
      assert.equal(ranked[0].name, 'David Nekovář');
      assert.equal(ranked.some((row) => row.name === 'Jan Michek' && row.score === 4), true);
      assert.equal(historical.data.createdAt.toISOString(), '2025-11-12T07:43:10.917Z');
    }
  });

  it('rejects a zero score and a game with no board', () => {
    assert.throws(
      () => buildScoreWrite({ gameName: 'Traffic Run', score: 0, name: 'Player' }),
      /greater than zero/,
    );
    assert.throws(
      () => buildScoreWrite({ gameName: 'Crazy Vacuum 3D', score: 10, name: 'Player' }),
      /No high-score board/,
    );
  });
});
