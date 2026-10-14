'use client';

import { Game } from '@/types';
import { ArrowLeft, ExternalLink, RefreshCw, Trophy } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ShareButton from './ShareButton';
import LeaderboardPopup from './LeaderboardPopup';
import Leaderboard from './Leaderboard';
import { trackGamePlayed } from '@/lib/analytics';
import { initializeFirebaseAuth } from '@/lib/firebase';
import { isPersonalRecord, submitToLeaderboard, updateUserProfile } from '@/lib/leaderboard';

interface GameIframeProps {
  game: Game;
}

export default function GameIframe({ game }: GameIframeProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showLeaderboardPopup, setShowLeaderboardPopup] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [gameScore, setGameScore] = useState<{ score: number; level?: number } | null>(null);

  // Initialize Firebase and track game play on component mount
  useEffect(() => {
    const initializeAndTrack = async () => {
      // Initialize Firebase auth (creates anonymous user if needed)
      await initializeFirebaseAuth();
      
      // Track game play
      await trackGamePlayed(game.name);
    };
    
    initializeAndTrack();
  }, [game.name]);

  // Listen for game events from iframe
  useEffect(() => {
    const primaryOrigin = new URL(game.url).origin;

    const isAllowedOrigin = (origin: string) => {
      if (origin === primaryOrigin) return true;
      // GTA Praha is listed as gtapraha.online but the same build also serves from Heroku.
      if (game.id !== 'gta-praha') return false;
      try {
        const host = new URL(origin).hostname;
        return (
          host === 'gtapraha.online' ||
          host === 'www.gtapraha.online' ||
          (host.endsWith('.herokuapp.com') && host.includes('gta-prague'))
        );
      } catch {
        return false;
      }
    };

    const handleMessage = async (event: MessageEvent) => {
      if (!isAllowedOrigin(event.origin)) return;

      const data = event.data;
      if (!data || typeof data !== 'object' || data.type !== 'GAME_OVER') return;
      if (typeof data.score !== 'number' || !Number.isFinite(data.score)) return;

      const score = data.score;
      const level = typeof data.level === 'number' ? data.level : undefined;

      // Always offer the claim UI for a positive GTA run. The game hides in-iframe
      // Google when embedded and tells players to sign in on Playful — gating only on
      // personal-record left them with no Gmail path when the check failed or was not a PR.
      if (score <= 0) return;

      const isRecord = await isPersonalRecord(game.name, score).catch(() => true);
      if (!isRecord && game.id !== 'gta-praha') return;

      setGameScore({ score, level });
      setShowLeaderboardPopup(true);
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [game.id, game.name, game.url]);

  const handleBack = () => {
    router.push('/');
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setHasError(false);
    // Force iframe reload by changing key
    window.location.reload();
  };

  const handleLeaderboardSubmit = async (data: {
    name: string;
    email?: string;
    uid?: string;
  }) => {
    if (!gameScore) return;

    // Profile is best-effort (rules may deny); score write must still succeed.
    await updateUserProfile(data.name, data.email);

    // Nested leaderboards/{gameId}/scores for GTA / Marooned (same as Crossy/Traffic)
    await submitToLeaderboard(
      game.name,
      gameScore.score,
      gameScore.level,
      data.name,
      data.email,
      data.uid
    );
  };

  const handleShowLeaderboard = () => {
    setShowLeaderboard(true);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Games</span>
              </button>
              
              <div className="h-6 w-px bg-white/20" />
              
              <div>
                <h1 className="text-xl font-bold text-white">{game.name}</h1>
                {/* <p className="text-sm text-muted-foreground">{game.shortDescription}</p> */}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleShowLeaderboard}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Leaderboard</span>
              </button>
              
              <ShareButton game={game} />
              
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              
              <a
                href={game.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Open in New Tab</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Game Container - Takes remaining height */}
      <div className="flex-1 relative">
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/80 backdrop-blur-md">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-white/80">Loading {game.name}...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/80 backdrop-blur-md">
            <div className="text-center max-w-md mx-auto p-6">
              <div className="bg-destructive/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Game Failed to Load</h3>
              <p className="text-muted-foreground mb-6">
                There was an error loading {game.name}. Please check your connection and try again.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleRefresh}
                  className="btn-gaming"
                >
                  <RefreshCw className="w-4 h-4 inline mr-2" />
                  Try Again
                </button>
                <button
                  onClick={handleBack}
                  className="btn-neon"
                >
                  <ArrowLeft className="w-4 h-4 inline mr-2" />
                  Back to Games
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game Iframe - Takes full remaining height */}
        <iframe
          src={game.url}
          className="w-full h-full border-0"
          title={game.name}
          onLoad={handleLoad}
          onError={handleError}
          allow="fullscreen; gamepad; microphone; camera; accelerometer; gyroscope"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
        />
      </div>

      {/* Leaderboard Popup */}
      {gameScore && (
        <LeaderboardPopup
          isOpen={showLeaderboardPopup}
          onClose={() => setShowLeaderboardPopup(false)}
          gameName={game.name}
          score={gameScore.score}
          level={gameScore.level || 0}
          onSubmit={handleLeaderboardSubmit}
        />
      )}

      {/* Leaderboard Display */}
      <Leaderboard
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        gameId={game.id}
        gameName={game.name}
      />
    </div>
  );
}
