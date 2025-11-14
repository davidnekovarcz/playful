'use client';

import { Game } from '@/types';
import { Gamepad2, Clock, Zap, Github, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import '@/lib/firebase'; // Initialize Firebase first
import { getTopScores, type GameId } from '@/lib/leaderboardClient';

interface GameCardProps {
  game: Game;
  onClick: () => void;
}

interface TopScoreData {
  playerName: string;
  score: number;
}

export default function GameCard({ game, onClick }: GameCardProps) {
  const isComingSoon = game.status === 'coming-soon';
  const [topScore, setTopScore] = useState<TopScoreData | null>(null);
  const [isLoadingScore, setIsLoadingScore] = useState(false);

  // Check if this game should show top score instead of stars
  const shouldShowTopScore = ['crossy-road', 'traffic-run'].includes(game.id);

  // Fetch top score from Firebase
  useEffect(() => {
    if (shouldShowTopScore && !isComingSoon) {
      setIsLoadingScore(true);
      getTopScores(game.id as GameId, 1)
        .then((scores) => {
          if (scores.length > 0) {
            setTopScore({
              playerName: scores[0].name,
              score: scores[0].score
            });
          }
          setIsLoadingScore(false);
        })
        .catch((error) => {
          console.error('Error fetching top score:', error);
          setIsLoadingScore(false);
        });
    }
  }, [game.id, shouldShowTopScore, isComingSoon]);

  // Calculate stars dynamically based on project start date
  const calculateStars = (startDate: string, divisor: number = 10): number => {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Use custom divisor for each game
    const stars = Math.floor(diffDays / divisor);
    return Math.max(stars, 1); // Minimum 1 star
  };

  // Different divisors for each game
  const getDivisor = (gameId: string): number => {
    switch (gameId) {
      case 'space-shooter': return 50;
      case 'traffic-run': return 15;
      default: return 10;
    }
  };

  const dynamicStars = game.publishedDate ? calculateStars(game.publishedDate, getDivisor(game.id)) : 0;

  return (
    <div
      className={`game-card group ${isComingSoon ? 'opacity-75' : ''} overflow-hidden`}
    >
      {/* Game Thumbnail */}
      <div className="relative mb-4 overflow-hidden rounded-xl cursor-pointer" onClick={isComingSoon ? undefined : () => {
        // Track game card click event
        if (typeof window !== 'undefined' && window.trackEvent) {
          window.trackEvent('game_card_click', {
            game_id: game.id,
            game_name: game.name,
            event_category: 'game_interaction'
          });
        }
        onClick();
      }}>
        <div className="aspect-video relative">
          {/* Game Screenshot */}
          <img
            src={game.thumbnail}
            alt={game.name}
            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
          />

          {/* Coming Soon Overlay */}
          {isComingSoon && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Clock className="w-16 h-16 mx-auto mb-2 text-white/80" />
                <p className="text-white font-semibold">Coming Soon</p>
              </div>
            </div>
          )}

          {/* Game Icon with Hover Effect */}
          {!isComingSoon && (
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
            </div>
          )}
        </div>

        {/* Status Badge */}
        {/* <div className="absolute top-3 right-3">
          {isComingSoon ? (
            <span className="bg-yellow-500/90 text-black px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
              Coming Soon
            </span>
          ) : (
            <span className="bg-green-500/90 text-white px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
              Ready to play
            </span>
          )}
        </div> */}
      </div>

      {/* Game Info */}
      <div className="space-y-3">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h3 className="text-xl font-bold text-white group-hover:text-gradient transition-colors">
              {game.name}
            </h3>
            {shouldShowTopScore ? (
              // Show top score and player name for crossy-road and traffic-run
              <div className="flex items-center gap-1">
                {isLoadingScore ? (
                  <span className="bg-yellow-400/20 text-yellow-400 text-xs font-medium px-2 py-1 rounded-full">
                    Loading...
                  </span>
                ) : topScore ? (
                  <div className="flex flex-row items-center gap-1 bg-yellow-400/20 text-yellow-400 text-xs font-medium px-2 py-1 rounded-full">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      {topScore.score} {topScore.playerName}
                  </div>
                ) : null}
              </div>
            ) : (
              // Show stars for other games
              dynamicStars > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="bg-yellow-400/20 text-yellow-400 text-xs font-medium px-2 py-1 rounded-full">
                    {dynamicStars}
                  </span>
                </div>
              )
            )}
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {game.shortDescription}
          </p>
        </div>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-2">
          {game.tech.map((tech, index) => (
            <span
              key={index}
              className="bg-white/10 text-white/80 px-2 py-1 rounded-md text-xs font-medium backdrop-blur-sm"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Features */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="w-4 h-4" />
            <span>Key Features</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {game.features.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="bg-primary/20 text-primary px-2 py-1 rounded text-xs font-medium"
              >
                {feature}
              </span>
            ))}
            {/* game.features.length > 3 && (
              <span className="text-muted-foreground text-xs">
                +{game.features.length - 3} more
              </span>
            ) */}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2">
          {isComingSoon ? (
            <button
              disabled
              className="w-full text-white md:p-4 p-3 rounded-lg font-semibold text-sm cursor-not-allowed bg-gray-300/20 border-none inline-flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, hsl(0 0% 30%), hsl(0 0% 25%))',
                boxShadow: '0 25px 50px -12px hsl(0 0% 30% / 0.25)'
              }}
            >
              <Clock className="w-3 h-3 inline mr-1" />
              Coming Soon
            </button>
          ) : (
            <div className="grid md:grid-cols-2 grid-cols-1 gap-5">
              <button
                className="text-white md:p-4 p-3 rounded-lg font-semibold text-sm cursor-pointer bg-gray-500/20 border-none inline-flex items-center justify-center transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, hsl(330 91% 65%), hsl(340 82% 52%))',
                  boxShadow: '0 10px 25px -5px hsl(330 91% 65% / 0.25)'
                }}
                onClick={() => {
                  // Track game play click event
                  if (typeof window !== 'undefined' && window.trackEvent) {
                    window.trackEvent('game_play_click', {
                      game_id: game.id,
                      game_name: game.name,
                      event_category: 'game_interaction'
                    });
                  }
                  onClick();
                }}
              >
                        <Gamepad2 className="w-3 h-3 inline mr-1" />
                        Play {game.name}
              </button>
              {game.githubUrl && (
                <a
                  href={game.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white md:p-4 p-3 rounded-lg font-semibold text-sm cursor-pointer border-none inline-flex items-center justify-center transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, hsl(0 0% 20%), hsl(0 0% 15%))',
                    boxShadow: '0 10px 25px -5px hsl(0 0% 20% / 0.25)'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Track GitHub link click event
                    if (typeof window !== 'undefined' && window.trackEvent) {
                      window.trackEvent('github_link_click', {
                        game_id: game.id,
                        game_name: game.name,
                        github_url: game.githubUrl,
                        event_category: 'external_link'
                      });
                    }
                  }}
                >
                  <Github className="w-3 h-3 inline mr-1" />
                  Contribute on GitHub
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Glow Effect */}
      <div className={`absolute inset-0 rounded-2xl ${game.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`} />
    </div>
  );
}
