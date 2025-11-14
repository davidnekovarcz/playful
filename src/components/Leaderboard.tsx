'use client';

import { useState, useEffect, useCallback } from 'react';
import { Trophy, Medal, Star, Users, Crown, X } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  name: string;
  email?: string;
  score: number;
  level?: number;
  gameName: string;
  timestamp: string;
  crossDomainUserId: string;
}

interface LeaderboardProps {
  gameId: string;
  gameName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function Leaderboard({ gameId, gameName, isOpen, onClose }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      // Import Firebase functions dynamically
      const { db } = await import('@/lib/firebase');
      const { collection, query, orderBy, limit, getDocs } = await import('firebase/firestore');

      // Use nested collection structure: leaderboards/{gameId}/scores (same as getTopScores)
      const leaderboardRef = collection(db, 'leaderboards', gameId, 'scores');
      const q = query(
        leaderboardRef,
        orderBy('score', 'desc'),
        limit(10)
      );
      
      const querySnapshot = await getDocs(q);
      const leaderboardData: LeaderboardEntry[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        leaderboardData.push({
          id: doc.id,
          ...data,
          timestamp: data.createdAt?.toDate?.()?.toISOString()
        } as LeaderboardEntry);
      });
      
      setEntries(leaderboardData);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    if (isOpen) {
      loadLeaderboard();
    }
  }, [isOpen, loadLeaderboard]);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">
          {index + 1}
        </span>;
    }
  };

  const formatScore = (entry: LeaderboardEntry) => {
    switch (entry.gameName) {
      case 'Space Shooter':
        return `Level ${entry.level || entry.score}`;
      case 'Crossy Road':
        return `Score: ${entry.score}`;
      case 'Traffic Run':
        return `Laps: ${entry.score}`;
      default:
        return entry.score.toString();
    }
  };

  const formatDate = (timestamp: string | undefined) => {
    if (!timestamp) return 'Recent';
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 bg-card border border-border rounded-lg shadow-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{gameName} Leaderboard</h2>
              <p className="text-sm text-muted-foreground">Top 10 players</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">Loading leaderboard...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{error}</p>
              <button
                onClick={loadLeaderboard}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No scores yet. Be the first to set a record!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                    index < 3 
                      ? 'bg-primary/5 border-primary/20' 
                      : 'bg-muted/30 border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {getRankIcon(index)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground truncate">
                        {entry.name}
                      </h3>
                      {index < 3 && (
                        <Star className="w-4 h-4 text-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(entry.timestamp)}
                    </p>
                  </div>
                  
                  <div className="flex-shrink-0 text-right">
                    <div className="font-bold text-foreground">
                      {formatScore(entry)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-muted/20">
          <p className="text-xs text-muted-foreground text-center">
            Leaderboard updates in real-time. Achieve a new personal record to claim your spot!
          </p>
        </div>
      </div>
    </div>
  );
}
