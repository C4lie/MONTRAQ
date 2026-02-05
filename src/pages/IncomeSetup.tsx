import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { setMonthlyIncome } from '../services/incomeService'
import { getCurrentMonth, formatCurrency } from '../utils/dateUtils'

export default function IncomeSetup() {
  const [income, setIncome] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const amount = parseFloat(income)
    if (!amount || amount <= 0) {
      setError('Please enter a valid income amount')
      return
    }

    if (!user) {
      setError('User not authenticated')
      return
    }

    setLoading(true)
    try {
      const currentMonth = getCurrentMonth()
      await setMonthlyIncome(user.uid, currentMonth, amount)
      navigate('/rules-setup')
    } catch (err) {
      console.error('Error setting income:', err)
      setError('Failed to save income. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const previewAmount = parseFloat(income) || 0

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass rounded-2xl p-8 max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-500/20 mb-4">
            <span className="text-3xl">💰</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Monthly Income</h1>
          <p className="text-gray-400">Let's start by setting your monthly income</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="income" className="block text-sm font-medium text-gray-300 mb-2">
              Your Monthly Income
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                ₹
              </span>
              <input
                id="income"
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="w-full pl-10 pr-4 py-4 bg-white/5 border border-white/10 rounded-lg text-white text-2xl font-semibold placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                placeholder="0"
                min="0"
                step="1"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Preview */}
          {previewAmount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-primary-500/10 border border-primary-500/20 rounded-lg"
            >
              <p className="text-sm text-gray-400 mb-1">You'll have</p>
              <p className="text-2xl font-bold text-primary-300">
                {formatCurrency(previewAmount)}
              </p>
              <p className="text-xs text-gray-500 mt-1">to manage this month</p>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg"
            >
              <p className="text-red-300 text-sm">{error}</p>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading || !income}
            className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </form>

        {/* Progress indicator */}
        <div className="mt-8 flex items-center justify-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-primary-500"></div>
          <div className="w-2 h-2 rounded-full bg-white/20"></div>
          <div className="w-2 h-2 rounded-full bg-white/20"></div>
        </div>
        <p className="text-center text-xs text-gray-500 mt-2">Step 1 of 3</p>
      </motion.div>
    </div>
  )
}
