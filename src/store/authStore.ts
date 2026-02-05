import { create } from 'zustand'
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth'
import { auth, db } from '../services/firebase'
import { doc, setDoc, Timestamp } from 'firebase/firestore'

interface AuthState {
  user: FirebaseUser | null
  loading: boolean
  initialized: boolean
  error: string | null
  
  // Actions
  signup: (email: string, password: string) => Promise<FirebaseUser>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  initAuth: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,
  error: null,

  signup: async (email: string, password: string) => {
    set({ loading: true, error: null })
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      
      // Create user document in Firestore
      const currentMonth = new Date().toISOString().slice(0, 7) // "YYYY-MM"
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        createdAt: Timestamp.now(),
        currentMonth
      })
      
      set({ loading: false })
      return user
    } catch (error: any) {
      set({ loading: false, error: error.message })
      throw error
    }
  },

  login: async (email: string, password: string) => {
    set({ loading: true, error: null })
    try {
      await signInWithEmailAndPassword(auth, email, password)
      set({ loading: false })
    } catch (error: any) {
      set({ loading: false, error: error.message })
      throw error
    }
  },

  logout: async () => {
    set({ loading: true, error: null })
    try {
      await signOut(auth)
      set({ user: null, loading: false })
    } catch (error: any) {
      set({ loading: false, error: error.message })
      throw error
    }
  },

  initAuth: () => {
    onAuthStateChanged(auth, (user) => {
      set({ user, initialized: true, loading: false })
    })
  },

  clearError: () => set({ error: null })
}))
