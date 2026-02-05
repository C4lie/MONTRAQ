import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where,
  Timestamp,
  deleteDoc,
  updateDoc
} from 'firebase/firestore'
import { db } from './firebase'
import type { MandatoryRule } from '../types'

/**
 * Get all active mandatory rules for a user
 */
export async function getActiveMandatoryRules(userId: string): Promise<MandatoryRule[]> {
  const q = query(
    collection(db, 'mandatoryRules'),
    where('userId', '==', userId),
    where('isActive', '==', true)
  )
  
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MandatoryRule))
}

/**
 * Get all mandatory rules (active and inactive) for a user
 */
export async function getAllMandatoryRules(userId: string): Promise<MandatoryRule[]> {
  const q = query(
    collection(db, 'mandatoryRules'),
    where('userId', '==', userId)
  )
  
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MandatoryRule))
}

/**
 * Create a new mandatory rule
 */
export async function createMandatoryRule(
  userId: string,
  name: string,
  amount: number
): Promise<string> {
  const docRef = doc(collection(db, 'mandatoryRules'))
  
  await setDoc(docRef, {
    userId,
    name,
    amount,
    isActive: true,
    createdAt: Timestamp.now()
  })
  
  return docRef.id
}

/**
 * Update a mandatory rule
 */
export async function updateMandatoryRule(
  ruleId: string,
  updates: Partial<Pick<MandatoryRule, 'name' | 'amount' | 'isActive'>>
): Promise<void> {
  await updateDoc(doc(db, 'mandatoryRules', ruleId), updates)
}

/**
 * Delete a mandatory rule
 */
export async function deleteMandatoryRule(ruleId: string): Promise<void> {
  await deleteDoc(doc(db, 'mandatoryRules', ruleId))
}

/**
 * Calculate total mandatory amount for a user
 */
export async function getTotalMandatoryAmount(userId: string): Promise<number> {
  const rules = await getActiveMandatoryRules(userId)
  return rules.reduce((total, rule) => total + rule.amount, 0)
}
