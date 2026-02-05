import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where,
  Timestamp,
  deleteDoc,
  updateDoc,
  increment
} from 'firebase/firestore'
import { db } from './firebase'
import type { Category } from '../types'

/**
 * Get all categories for a user's current month
 */
export async function getMonthCategories(
  userId: string,
  month: string
): Promise<Category[]> {
  const q = query(
    collection(db, 'categories'),
    where('userId', '==', userId),
    where('month', '==', month)
  )
  
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category))
}

/**
 * Create a new category for a month
 */
export async function createCategory(
  userId: string,
  month: string,
  name: string,
  budgeted: number
): Promise<string> {
  const docRef = doc(collection(db, 'categories'))
  
  await setDoc(docRef, {
    userId,
    month,
    name,
    budgeted,
    spent: 0,
    createdAt: Timestamp.now()
  })
  
  return docRef.id
}

/**
 * Update category budget
 */
export async function updateCategoryBudget(
  categoryId: string,
  budgeted: number
): Promise<void> {
  await updateDoc(doc(db, 'categories', categoryId), { budgeted })
}

/**
 * Update category name and/or budget
 */
export async function updateCategory(
  categoryId: string,
  updates: { name?: string; budgeted?: number }
): Promise<void> {
  await updateDoc(doc(db, 'categories', categoryId), updates)
}

/**
 * Add spending to a category (used when expense is created)
 */
export async function addCategorySpending(
  categoryId: string,
  amount: number
): Promise<void> {
  await updateDoc(doc(db, 'categories', categoryId), {
    spent: increment(amount)
  })
}

/**
 * Subtract spending from a category (used when expense is deleted)
 */
export async function subtractCategorySpending(
  categoryId: string,
  amount: number
): Promise<void> {
  await updateDoc(doc(db, 'categories', categoryId), {
    spent: increment(-amount)
  })
}

/**
 * Delete a category
 */
export async function deleteCategory(categoryId: string): Promise<void> {
  await deleteDoc(doc(db, 'categories', categoryId))
}

/**
 * Get category overview (total budgeted, total spent, remaining)
 */
export async function getCategoryOverview(
  userId: string,
  month: string
): Promise<{
  totalBudgeted: number
  totalSpent: number
  remaining: number
  categories: Category[]
}> {
  const categories = await getMonthCategories(userId, month)
  
  const totalBudgeted = categories.reduce((sum, cat) => sum + cat.budgeted, 0)
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0)
  
  return {
    totalBudgeted,
    totalSpent,
    remaining: totalBudgeted - totalSpent,
    categories
  }
}
