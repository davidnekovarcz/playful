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
    return false;
  }
}

/**
 * Submit a score to the leaderboard
 */
export async function submitToLeaderboard(
  gameName: string,
  score: number,
  level: number | undefined,
  name: string,
  email?: string
): Promise<void> {
  try {
    const crossDomainUserId = getCrossDomainUserId();
    if (!crossDomainUserId) {
      throw new Error('No cross-domain user ID available');
    }

    // Create leaderboard entry
    const leaderboardEntry: Omit<LeaderboardEntry, 'id'> = {
      name,
      email,
      score,
      level,
      gameName,
      timestamp: serverTimestamp(),
      crossDomainUserId,
      isPersonalRecord: true
    };

    // Add to leaderboard collection
    const leaderboardRef = collection(db, 'leaderboard');
    await setDoc(doc(leaderboardRef), leaderboardEntry);

    // Card badge and in-game panel read leaderboards/{gameId}/scores.
    if (gameName === 'Marooned') {
      await addDoc(collection(db, 'leaderboards', 'marooned', 'scores'), {
        name,
        score,
        gameName,
        createdAt: Timestamp.now(),
      });
    }

    // Update personal record
    await updatePersonalRecord(gameName, score, level);

    console.log('Score submitted to leaderboard:', leaderboardEntry);
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
 * Update user profile with name and email
 */
export async function updateUserProfile(name: string, email?: string): Promise<void> {
  try {
    const crossDomainUserId = getCrossDomainUserId();
    if (!crossDomainUserId) {
      throw new Error('No cross-domain user ID available');
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
    console.error('Error updating user profile:', error);
    throw error;
  }
}
