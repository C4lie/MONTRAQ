import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where,
  orderBy,
  Timestamp,
  deleteDoc
} from 'firebase/firestore'
import { db } from './firebase'
import type { Expense } from '../types'
import { addCategorySpending, subtractCategorySpending } from './categoryService'

/**
 * Get all expenses for a user's current month
 */
export async function getMonthExpenses(
  userId: string,
  month: string
): Promise<Expense[]> {
  const q = query(
    collection(db, 'expenses'),
    where('userId', '==', userId),
    where('month', '==', month),
    orderBy('createdAt', 'desc')
  )
  
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense))
}

/**
 * Get expenses for a specific category
 */
export async function getCategoryExpenses(
  userId: string,
  categoryId: string
): Promise<Expense[]> {
  const q = query(
    collection(db, 'expenses'),
    where('userId', '==', userId),
    where('categoryId', '==', categoryId),
    orderBy('date', 'desc')
  )
  
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense))
}

/**
 * Create a new expense
 */
export async function createExpense(
  userId: string,
  month: string,
  categoryId: string,
  amount: number,
  note: string,
  date?: Date
): Promise<string> {
  const docRef = doc(collection(db, 'expenses'))
  const expenseDate = date ? Timestamp.fromDate(date) : Timestamp.now()
  
  await setDoc(docRef, {
    userId,
    month,
    categoryId,
    amount,
    note,
    date: expenseDate,
    createdAt: Timestamp.now()
  })
  
  // Update category spent amount
  await addCategorySpending(categoryId, amount)
  
  return docRef.id
}

/**
 * Delete an expense
 */
export async function deleteExpense(
  expenseId: string,
  categoryId: string,
  amount: number
): Promise<void> {
  await deleteDoc(doc(db, 'expenses', expenseId))
  
  // Update category spent amount
  await subtractCategorySpending(categoryId, amount)
}

/**
 * Get total expenses for a month
 */
export async function getTotalMonthExpenses(
  userId: string,
  month: string
): Promise<number> {
  const expenses = await getMonthExpenses(userId, month)
  return expenses.reduce((total, expense) => total + expense.amount, 0)
}

/**
 * Get recent expenses (last N expenses)
 */
export async function getRecentExpenses(
  userId: string,
  month: string,
  limit = 10
): Promise<Expense[]> {
  const expenses = await getMonthExpenses(userId, month)
  return expenses.slice(0, limit)
}
