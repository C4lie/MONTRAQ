import { useState, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { addToMonthlyIncome } from '../services/incomeService'
import { formatCurrency, getCurrentMonth } from '../utils/dateUtils'

interface AddIncomeModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  currentIncome: number
  onIncomeAdded: () => void
}

const AddIncomeModal = memo(function AddIncomeModal({
  isOpen,
  onClose,
  userId,
  currentIncome,
  onIncomeAdded
}: AddIncomeModalProps) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const extraAmount = parseFloat(amount)
    if (!extraAmount || extraAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    setLoading(true)
    try {
      const currentMonth = getCurrentMonth()
      await addToMonthlyIncome(userId, currentMonth, extraAmount)
      onIncomeAdded()
      onClose()
      setAmount('')
    } catch (err) {
      console.error('Error adding income:', err)
      setError('Failed to add income. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const previewAmount = parseFloat(amount) || 0
  const newTotal = currentIncome + previewAmount

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Add Extra Income</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Current Income Display */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Current Monthly Income</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(currentIncome)}</p>
                </div>

                {/* Amount Input */}
                <div>
                  <label htmlFor="extraAmount" className="block text-sm font-medium text-gray-300 mb-2">
                    Extra Amount to Add
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                      ₹
                    </span>
                    <input
                      id="extraAmount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-xl font-semibold placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required
                      autoFocus
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    Received a bonus, gift, or extra income this month?
                  </p>
                </div>

                {/* Preview */}
                {previewAmount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg"
                  >
                    <p className="text-sm text-gray-400 mb-1">New Total Income</p>
                    <p className="text-xl font-bold text-green-300">{formatCurrency(newTotal)}</p>
                    <p className="mt-2 text-xs text-green-200/60">
                      +{formatCurrency(previewAmount)} added
                    </p>
                  </motion.div>
                )}

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg"
                  >
                    <p className="text-red-300 text-sm">{error}</p>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 bg-white/10 border border-white/20 text-white font-medium rounded-lg hover:bg-white/20 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Adding...' : 'Add Income'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
})

export default AddIncomeModal
