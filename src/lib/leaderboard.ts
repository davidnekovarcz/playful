/**
 * Leaderboard Service
 * 
 * Handles leaderboard operations including personal record detection,
 * score submission, and leaderboard queries
 */

import { db } from './firebase';
import { 
  addDoc,
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { getCrossDomainUserId } from './firebase';
import { buildScoreWrite } from './leaderboardGames';

export interface LeaderboardEntry {
  id?: string;
  name: string;
  email?: string;
  score: number;
  level?: number;
  gameName: string;
  timestamp: unknown; // Firebase serverTimestamp
  crossDomainUserId: string;
  isPersonalRecord: boolean;
}

export interface PersonalRecord {
  gameName: string;
  score: number;
  level?: number;
  timestamp: string;
}

/**
 * Check if the current score is a personal record
 */
export async function isPersonalRecord(
  gameName: string, 
  score: number
): Promise<boolean> {
  try {
    const crossDomainUserId = getCrossDomainUserId();
    if (!crossDomainUserId) return false;

    // Get user's personal records
    const personalRecordsRef = doc(db, 'personalRecords', crossDomainUserId);
    const personalRecordsDoc = await getDoc(personalRecordsRef);
    
    if (!personalRecordsDoc.exists()) {
      // No previous records, this is definitely a personal record
      return true;
    }

    const personalRecords = personalRecordsDoc.data();
    const gameRecord = personalRecords[gameName];

    if (!gameRecord) {
      // No record for this game, this is a personal record
      return true;
    }

    // Compare scores (higher is better for all games)
    return score > gameRecord.score;
  } catch (error) {
    console.error('Error checking personal record:', error);
    // Fail open so a Firestore blip does not hide the claim / Google UI.
    return true;
  }
}

/**
 * Submit a score to leaderboards/{gameId}/scores in the Smarlify API project.
 * Crossy Road, Traffic Run, GTA Praha, and Marooned share that store with the
 * scores recorded since 2025-11-12. The flat `leaderboard` collection is denied.
 */
export async function submitToLeaderboard(
  gameName: string,
  score: number,
  level: number | undefined,
  name: string,
  email?: string,
  uid?: string
): Promise<void> {
  try {
    const crossDomainUserId = getCrossDomainUserId();
    if (!crossDomainUserId) {
      throw new Error('No cross-domain user ID available');
    }

    const write = buildScoreWrite({
      gameName,
      score,
      name,
      email,
      uid,
      level,
    });
    const [root, gameId, leaf] = write.collectionPath;
    const payload: Record<string, unknown> = {
      name: write.data.name,
      score: write.data.score,
      gameName: write.data.gameName,
      createdAt: Timestamp.fromDate(write.data.createdAt),
    };
    if (write.data.email) payload.email = write.data.email;
    if (write.data.uid) payload.uid = write.data.uid;
    if (write.data.level !== undefined) payload.level = write.data.level;

    await addDoc(collection(db, root, gameId, leaf), payload);
    console.log('Score submitted to leaderboards/%s/scores:', gameId, payload);

    // Best-effort: rules currently deny client writes to personalRecords.
    await updatePersonalRecord(gameName, score, level);
  } catch (error) {
    console.error('Error submitting to leaderboard:', error);
    throw error;
  }
}

/**
 * Update personal record for a user
 */
export async function updatePersonalRecord(
  gameName: string,
  score: number,
  level?: number
): Promise<void> {
  try {
    const crossDomainUserId = getCrossDomainUserId();
    if (!crossDomainUserId) return;

    const personalRecordsRef = doc(db, 'personalRecords', crossDomainUserId);
    const personalRecordsDoc = await getDoc(personalRecordsRef);
    
    const personalRecords = personalRecordsDoc.exists() 
      ? personalRecordsDoc.data() 
      : {};

    // Update the record for this game
    personalRecords[gameName] = {
      score,
      level,
      timestamp: new Date().toISOString(),
      gameName
    };

    await setDoc(personalRecordsRef, personalRecords, { merge: true });
    console.log('Personal record updated:', personalRecords[gameName]);
  } catch (error) {
    console.error('Error updating personal record:', error);
  }
}

/**
 * Get leaderboard entries for a specific game
 */
export async function getLeaderboard(gameName: string, limitCount: number = 10): Promise<LeaderboardEntry[]> {
  try {
    const leaderboardRef = collection(db, 'leaderboard');
    const q = query(
      leaderboardRef,
      where('gameName', '==', gameName),
      orderBy('score', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const entries: LeaderboardEntry[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      entries.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate?.()?.toISOString() || data.timestamp
      } as LeaderboardEntry);
    });

    return entries;
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
}

/**
 * Get user's personal records
 */
export async function getPersonalRecords(): Promise<Record<string, PersonalRecord>> {
  try {
    const crossDomainUserId = getCrossDomainUserId();
    if (!crossDomainUserId) return {};

    const personalRecordsRef = doc(db, 'personalRecords', crossDomainUserId);
    const personalRecordsDoc = await getDoc(personalRecordsRef);
    
    if (!personalRecordsDoc.exists()) {
      return {};
    }

    return personalRecordsDoc.data() as Record<string, PersonalRecord>;
  } catch (error) {
    console.error('Error getting personal records:', error);
    return {};
  }
}

/**
 * Check if user has a name set (for leaderboard eligibility)
 */
export async function hasUserName(): Promise<boolean> {
  try {
    const crossDomainUserId = getCrossDomainUserId();
    if (!crossDomainUserId) return false;

    const userProfileRef = doc(db, 'userProfiles', crossDomainUserId);
    const userProfileDoc = await getDoc(userProfileRef);
    
    if (!userProfileDoc.exists()) {
      return false;
    }

    const userProfile = userProfileDoc.data();
    return !!(userProfile.name && userProfile.name.trim());
  } catch (error) {
    console.error('Error checking user name:', error);
    return false;
  }
}

/**
 * Update user profile with name and email.
 * Best-effort only: live Firestore rules deny client writes to userProfiles, and a
 * failed profile update must not block leaderboard score submission.
 */
export async function updateUserProfile(name: string, email?: string): Promise<void> {
  try {
    const crossDomainUserId = getCrossDomainUserId();
    if (!crossDomainUserId) {
      console.warn('No cross-domain user ID available; skipping profile update');
      return;
    }

    const userProfileRef = doc(db, 'userProfiles', crossDomainUserId);
    const userProfile = {
      name: name.trim(),
      email: email?.trim() || null,
      updatedAt: serverTimestamp(),
      crossDomainUserId
    };

    await setDoc(userProfileRef, userProfile, { merge: true });
    console.log('User profile updated:', userProfile);
  } catch (error) {
    console.warn('Error updating user profile (non-blocking):', error);
  }
}
