import { Timestamp } from 'firebase/firestore'

export interface User {
  uid: string
  email: string
  createdAt: Timestamp
  currentMonth: string // "YYYY-MM"
}

export interface MonthlyIncome {
  id?: string
  userId: string
  month: string // "YYYY-MM"
  amount: number
  lockedAt: Timestamp
}

export interface MandatoryRule {
  id?: string
  userId: string
  name: string
  amount: number
  isActive: boolean
  createdAt: Timestamp
}

export interface Category {
  id?: string
  userId: string
  month: string
  name: string
  budgeted: number
  spent: number
  createdAt: Timestamp
}

export interface Expense {
  id?: string
  userId: string
  month: string
  categoryId: string
  amount: number
  note: string
  date: Timestamp
  createdAt: Timestamp
}

export interface Savings {
  id?: string
  userId: string
  month: string
  amount: number
  source: 'mandatory' | 'leftover'
  createdAt: Timestamp
}
