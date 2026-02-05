import { 
  collection, 
  query, 
  where, 
  getDocs, 
  writeBatch,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'
import { getCurrentMonth } from '../utils/dateUtils'
import { getActiveMandatoryRules } from './rulesService'
import { addSavings } from './savingsService'

/**
 * Check if user needs month migration (current month in user doc != actual current month)
 */
export async function checkMonthMigration(userId: string): Promise<boolean> {
  try {
    const userQuery = query(collection(db, 'users'), where('__name__', '==', userId))
    const userDoc = await getDocs(userQuery)
    
    if (userDoc.empty) return false
    
    const userData = userDoc.docs[0].data()
    const userCurrentMonth = userData.currentMonth
    const actualCurrentMonth = getCurrentMonth()
    
    return userCurrentMonth !== actualCurrentMonth
  } catch (error) {
    console.error('Error checking month migration:', error)
    return false
  }
}

/**
 * Perform month migration - called when new month is detected
 * 1. Update user's currentMonth
 * 2. Apply mandatory rules to new month
 * 3. Create fresh categories for new month
 * 4. Archive is handled by Firestore (old data stays with old month)
 */
export async function performMonthMigration(userId: string): Promise<void> {
  try {
    const actualCurrentMonth = getCurrentMonth()
    const batch = writeBatch(db)
    
    // Step 1: Update user's current month
    const userDocRef = doc(db, 'users', userId)
    batch.update(userDocRef, {
      currentMonth: actualCurrentMonth
    })
    
    // Step 2: Get active mandatory rules and create savings entries for new month
    const mandatoryRules = await getActiveMandatoryRules(userId)
    
    // For each mandatory rule, add to savings for the new month
    for (const _rule of mandatoryRules) {
      // We'll create a savings entry for each rule
      // This will be done outside the batch to use the addSavings function
      // which handles the increment logic
    }
    
    // Commit the batch (user update)
    await batch.commit()
    
    // Step 3: Add mandatory rule savings separately (after batch)
    for (const rule of mandatoryRules) {
      await addSavings(userId, actualCurrentMonth, rule.amount, 'mandatory')
    }
    
    console.log(`Month migration completed for user ${userId} to ${actualCurrentMonth}`)
  } catch (error) {
    console.error('Error performing month migration:', error)
    throw error
  }
}

/**
 * Initialize user's first month setup
 * Called during onboarding flow
 */
export async function initializeUserMonth(userId: string, email: string): Promise<void> {
  try {
    const currentMonth = getCurrentMonth()
    const userDocRef = doc(db, 'users', userId)
    
    await updateDoc(userDocRef, {
      uid: userId,
      email: email,
      currentMonth: currentMonth,
      createdAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error initializing user month:', error)
    throw error
  }
}

/**
 * Get user's stored current month
 */
export async function getUserCurrentMonth(userId: string): Promise<string | null> {
  try {
    const userQuery = query(collection(db, 'users'), where('__name__', '==', userId))
    const userDoc = await getDocs(userQuery)
    
    if (userDoc.empty) return null
    
    return userDoc.docs[0].data().currentMonth || null
  } catch (error) {
    console.error('Error getting user current month:', error)
    return null
  }
}
