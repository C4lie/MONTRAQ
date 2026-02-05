import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import ProtectedRoute from './components/ProtectedRoute'
import { InstallPrompt } from './components/InstallPrompt'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import IncomeSetup from './pages/IncomeSetup'
import RulesSetup from './pages/RulesSetup'
import CategorySetup from './pages/CategorySetup'

function App() {
  const { initAuth, user, initialized } = useAuthStore()

  useEffect(() => {
    initAuth()
  }, [initAuth])

  // Don't render routes until auth is initialized
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-8">
          <div className="flex items-center space-x-3">
            <div className="shimmer w-12 h-12 rounded-full" />
            <p className="text-gray-300">Initializing...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        <Route 
          path="/signup" 
          element={user ? <Navigate to="/dashboard" replace /> : <Signup />} 
        />

        {/* Onboarding routes */}
        <Route
          path="/income-setup"
          element={
            <ProtectedRoute>
              <IncomeSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rules-setup"
          element={
            <ProtectedRoute>
              <RulesSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/category-setup"
          element={
            <ProtectedRoute>
              <CategorySetup />
            </ProtectedRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route 
          path="/" 
          element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
        />
      </Routes>
      <InstallPrompt />
    </Router>
  )
}

export default App

