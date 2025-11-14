import { getApps, getApp } from 'firebase/app';
import { getFirestore, collection, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';

// Lazy initialize the database connection
let db: ReturnType<typeof getFirestore> | null = null;

function getDb() {
  if (!db) {
    // Ensure Firebase is initialized first
    const apps = getApps();
    if (apps.length === 0) {
      throw new Error('Firebase app not initialized. Make sure firebase.ts is imported before using leaderboardClient.');
    }
    const app = getApp();
    db = getFirestore(app);
  }
  return db;
}

export type GameId = 'crossy-road' | 'traffic-run';

export interface LeaderboardEntry {
  userId: string;
  name: string;
  score: number;
  createdAt?: Timestamp | Date;
}

export async function getTopScores(gameId: GameId, topN = 10): Promise<LeaderboardEntry[]> {
  const firestore = getDb();
  const col = collection(firestore, 'leaderboards', gameId, 'scores');
  const q = query(col, orderBy('score', 'desc'), limit(topN));
  const snap = await getDocs(q);
  return snap.docs.map(d => {
    const data = d.data() as LeaderboardEntry;
    return { ...data };
  });
}

