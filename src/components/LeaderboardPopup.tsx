'use client';

import { useState, useEffect } from 'react';
import { X, Trophy, Star, Mail, User } from 'lucide-react';
import { formatSurvivedMinutes } from '@/lib/survivedTime';

interface LeaderboardPopupProps {
  isOpen: boolean;
  onClose: () => void;
  gameName: string;
  score: number;
  level: number;
  onSubmit: (data: { name: string; email?: string }) => Promise<void>;
}

export default function LeaderboardPopup({
  isOpen,
  onClose,
  gameName,
  score,
  level,
  onSubmit
}: LeaderboardPopupProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset form when popup opens
      setName('');
      setEmail('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Name is required to appear on the leaderboard');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim() || undefined
      });
      onClose();
    } catch (err) {
      setError('Failed to submit score. Please try again.');
      console.error('Leaderboard submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-card border border-border rounded-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">New Personal Record!</h2>
              <p className="text-sm text-muted-foreground">Claim your spot on the leaderboard</p>
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
        <div className="p-6">
          {/* Score Display */}
          <div className="mb-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-primary" />
              <span className="font-semibold text-primary">{gameName}</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {gameName === 'Space Shooter' ? `Level ${level}` : 
               gameName === 'Crossy Road' ? `Score: ${score}` :
               gameName === 'Traffic Run' ? `Laps: ${score}` :
               gameName === 'Marooned' ? formatSurvivedMinutes(score) : score}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {gameName === 'Space Shooter' ? 'Asteroids destroyed!' :
               gameName === 'Crossy Road' ? 'Rows crossed!' :
               gameName === 'Traffic Run' ? 'Laps completed!' :
               gameName === 'Marooned' ? 'Time survived' : 'Great score!'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Your Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email (Optional)
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground mt-1">
                We&apos;ll notify you if someone beats your score!
              </p>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                disabled={isSubmitting}
              >
                Skip
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Score'}
              </button>
            </div>
          </form>

          <p className="text-xs text-muted-foreground mt-4 text-center">
            Your score will be saved and displayed on the leaderboard. 
            You can update your name anytime by achieving a new record.
          </p>
        </div>
      </div>
    </div>
  );
}
