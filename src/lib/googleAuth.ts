/**
 * Google sign-in for leaderboard claims.
 * Uses the shared Playful Auth instance (anonymous upgrade via popup).
 */
import { GoogleAuthProvider, signInWithPopup, type User } from 'firebase/auth';
import { auth } from './firebase';

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export function isGoogleUser(user = auth.currentUser): boolean {
  return !!(user && !user.isAnonymous);
}

export function googleDisplayName(user = auth.currentUser): string | null {
  if (!user || !isGoogleUser(user)) return null;
  return user.displayName || user.email?.split('@')[0] || null;
}
