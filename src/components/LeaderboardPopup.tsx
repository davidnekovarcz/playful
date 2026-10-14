'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Trophy, Star, Mail, User } from 'lucide-react';
import { formatSurvivedMinutes } from '@/lib/survivedTime';
import { formatGtaDistance } from '@/lib/gtaDistance';
import { googleAccount, googleDisplayName, isGoogleUser, signInWithGoogle } from '@/lib/googleAuth';

interface LeaderboardPopupProps {
  isOpen: boolean;
  onClose: () => void;
  gameName: string;
  score: number;
  level: number;
  onSubmit: (data: {
    name: string;
    email?: string;
    uid?: string;
  }) => Promise<void>;
}

function scoreLabel(gameName: string, score: number, level: number): string {
  switch (gameName) {
    case 'Space Shooter':
      return `Level ${level}`;
    case 'Crossy Road':
      return `Score: ${score}`;
    case 'Traffic Run':
      return `Laps: ${score}`;
    case 'Marooned':
      return formatSurvivedMinutes(score);
    case 'GTA Praha':
      return formatGtaDistance(score);
    default:
      return String(score);
  }
}

function scoreHint(gameName: string): string {
  switch (gameName) {
    case 'Space Shooter':
      return 'Asteroids destroyed!';
    case 'Crossy Road':
      return 'Rows crossed!';
    case 'Traffic Run':
      return 'Laps completed!';
    case 'Marooned':
      return 'Time survived';
    case 'GTA Praha':
      return 'Distance driven this run';
    default:
      return 'Great score!';
  }
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
  const [showGuest, setShowGuest] = useState(false);
  const [signedInName, setSignedInName] = useState<string | null>(null);
  const [saveSucceeded, setSaveSucceeded] = useState(false);
  const autoSavedRef = useRef(false);

  const submitScore = async (data: { name: string; email?: string; uid?: string }) => {
    setIsSubmitting(true);
    setError('');
    try {
      await onSubmit(data);
      setSaveSucceeded(true);
      onClose();
    } catch (err) {
      setError('Failed to submit score. Please try again.');
      console.error('Leaderboard submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      autoSavedRef.current = false;
      return;
    }

    setName('');
    setEmail('');
    setError('');
    setShowGuest(false);
    setSaveSucceeded(false);

    const account = googleAccount();
    if (account) {
      setSignedInName(account.name);
      if (!autoSavedRef.current) {
        autoSavedRef.current = true;
        void submitScore(account);
      }
    } else {
      setSignedInName(isGoogleUser() ? googleDisplayName() : null);
    }
    // Auto-save once per open when already signed in; submitScore closes on success.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally keyed on isOpen only
  }, [isOpen]);

  const handleGoogle = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const user = await signInWithGoogle();
      const display = user.displayName || user.email?.split('@')[0] || 'Player';
      setSignedInName(display);
      await submitScore({
        name: display,
        email: user.email || undefined,
        uid: user.uid,
      });
    } catch (err) {
      console.error('Google sign-in failed:', err);
      setError('Google sign-in failed. You can still save with a guest name.');
      setShowGuest(true);
      setIsSubmitting(false);
    }
  };

  const handleSaveSignedIn = async () => {
    const account = googleAccount();
    if (!account) return;
    await submitScore(account);
  };

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required to appear on the leaderboard');
      return;
    }
    await submitScore({
      name: name.trim(),
      email: email.trim() || undefined,
    });
  };

  if (!isOpen) return null;

  // Gate on live auth so the Google/guest chooser never flashes for a signed-in user.
  const account = googleAccount();
  const alreadySignedIn = !!account;
  const displayName = account?.name || signedInName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-card border border-border rounded-lg shadow-2xl">
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

        <div className="p-6">
          <div className="mb-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-primary" />
              <span className="font-semibold text-primary">{gameName}</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {scoreLabel(gameName, score, level)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {scoreHint(gameName)}
            </p>
          </div>

          {alreadySignedIn ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Signed in as <span className="text-foreground font-medium">{displayName}</span>
              </p>
              {saveSucceeded ? (
                <p className="text-sm text-primary font-medium">Score saved.</p>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveSignedIn}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isSubmitting ? 'Saving…' : 'Save score'}
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isSubmitting ? 'Saving…' : 'Continue with Google'}
                </button>

                {!showGuest && (
                  <button
                    type="button"
                    onClick={() => setShowGuest(true)}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Save as guest instead
                  </button>
                )}
              </div>

              {showGuest && (
                <form onSubmit={handleGuestSubmit} className="space-y-4 mt-6 pt-4 border-t border-border">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Guest name *
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
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !name.trim()}
                    className="w-full px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit as guest'}
                  </button>
                </form>
              )}
            </>
          )}

          {error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
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
          </div>

          {!alreadySignedIn && (
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Continue with Google uses your Google display name on the leaderboard.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
