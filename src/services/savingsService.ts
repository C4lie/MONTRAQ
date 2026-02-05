import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore'
import { db } from './firebase'
import type { Savings } from '../types'

/**
 * Get all savings for a user's current month
 */
export async function getMonthSavings(
  userId: string,
  month: string
): Promise<Savings[]> {
  const q = query(
    collection(db, 'savings'),
    where('userId', '==', userId),
    where('month', '==', month)
  )
  
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Savings))
}

/**
 * Add savings for a month
 */
export async function addSavings(
  userId: string,
  month: string,
  amount: number,
  source: 'mandatory' | 'leftover'
): Promise<string> {
  const docRef = doc(collection(db, 'savings'))
  
  await setDoc(docRef, {
    userId,
    month,
    amount,
    source,
    createdAt: Timestamp.now()
  })
  
  return docRef.id
}

/**
 * Get total savings for a user across all months
 */
export async function getTotalSavings(userId: string): Promise<number> {
  const q = query(
    collection(db, 'savings'),
    where('userId', '==', userId)
  )
  
  const snapshot = await getDocs(q)
  const allSavings = snapshot.docs.map(doc => doc.data() as Savings)
  
  return allSavings.reduce((total, saving) => total + saving.amount, 0)
}

/**
 * Get total savings for a specific month
 */
export async function getTotalMonthSavings(
  userId: string,
  month: string
): Promise<number> {
  const savings = await getMonthSavings(userId, month)
  return savings.reduce((total, saving) => total + saving.amount, 0)
}

/**
 * Get savings history (last N months)
 */
export async function getSavingsHistory(
  userId: string,
  limit = 12
): Promise<{ month: string; total: number }[]> {
  const q = query(
    collection(db, 'savings'),
    where('userId', '==', userId),
    orderBy('month', 'desc')
  )
  
  const snapshot = await getDocs(q)
  const savingsByMonth = new Map<string, number>()
  
  snapshot.docs.forEach(doc => {
    const data = doc.data() as Savings
    const current = savingsByMonth.get(data.month) || 0
    savingsByMonth.set(data.month, current + data.amount)
  })
  
  return Array.from(savingsByMonth.entries())
    .map(([month, total]) => ({ month, total }))
    .slice(0, limit)
}

/**
 * Get savings breakdown by source for a month
 */
export async function getSavingsBreakdown(
  userId: string,
  month: string
): Promise<{ mandatory: number; leftover: number; total: number }> {
  const savings = await getMonthSavings(userId, month)
  
  const mandatory = savings
    .filter(s => s.source === 'mandatory')
    .reduce((sum, s) => sum + s.amount, 0)
  
  const leftover = savings
    .filter(s => s.source === 'leftover')
    .reduce((sum, s) => sum + s.amount, 0)
  
  return {
    mandatory,
    leftover,
    total: mandatory + leftover
  }
}
