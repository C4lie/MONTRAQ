import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp,
  updateDoc
} from 'firebase/firestore'
import { db } from './firebase'
import type { MonthlyIncome } from '../types'

/**
 * Get monthly income for a specific user and month
 */
export async function getMonthlyIncome(
  userId: string, 
  month: string
): Promise<MonthlyIncome | null> {
  const q = query(
    collection(db, 'monthlyIncome'),
    where('userId', '==', userId),
    where('month', '==', month)
  )
  
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null
  
  const doc = snapshot.docs[0]
  return { id: doc.id, ...doc.data() } as MonthlyIncome
}

/**
 * Create or update monthly income
 */
export async function setMonthlyIncome(
  userId: string,
  month: string,
  amount: number
): Promise<void> {
  const existing = await getMonthlyIncome(userId, month)
  
  if (existing && existing.id) {
    // Update existing
    await updateDoc(doc(db, 'monthlyIncome', existing.id), {
      amount,
      lockedAt: Timestamp.now()
    })
  } else {
    // Create new
    await setDoc(doc(collection(db, 'monthlyIncome')), {
      userId,
      month,
      amount,
      lockedAt: Timestamp.now()
    })
  }
}

/**
 * Add extra money to existing monthly income
 */
export async function addToMonthlyIncome(
  userId: string,
  month: string,
  extraAmount: number
): Promise<void> {
  const existing = await getMonthlyIncome(userId, month)
  
  if (existing && existing.id) {
    const newAmount = existing.amount + extraAmount
    await updateDoc(doc(db, 'monthlyIncome', existing.id), {
      amount: newAmount,
      lockedAt: Timestamp.now()
    })
  } else {
    // If no existing income, create new with the extra amount
    await setMonthlyIncome(userId, month, extraAmount)
  }
}

/**
 * Get all monthly income records for a user (for history)
 */
export async function getUserIncomeHistory(
  userId: string,
  limit = 12
): Promise<MonthlyIncome[]> {
  const q = query(
    collection(db, 'monthlyIncome'),
    where('userId', '==', userId),
    orderBy('month', 'desc')
  )
  
  const snapshot = await getDocs(q)
  return snapshot.docs
    .slice(0, limit)
    .map(doc => ({ id: doc.id, ...doc.data() } as MonthlyIncome))
}
