import { useState, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createExpense } from '../services/expenseService'
import { formatCurrency, getCurrentMonth } from '../utils/dateUtils'
import type { Category } from '../types'

interface AddExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  userId: string
  onExpenseAdded: () => void
}

function AddExpenseModal({ 
  isOpen, 
  onClose, 
  categories, 
  userId,
  onExpenseAdded 
}: AddExpenseModalProps) {
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setAmount('')
      setCategoryId('')
      setNote('')
      setError('')
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const expenseAmount = parseFloat(amount)
    if (!expenseAmount || expenseAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (!categoryId) {
      setError('Please select a category')
      return
    }

    setLoading(true)
    try {
      const currentMonth = getCurrentMonth()
      await createExpense(userId, currentMonth, categoryId, expenseAmount, note.trim())
      onExpenseAdded()
      onClose()
    } catch (err) {
      console.error('Error adding expense:', err)
      setError('Failed to add expense. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const selectedCategory = categories.find(c => c.id === categoryId)
  const previewAmount = parseFloat(amount) || 0

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
                <h2 className="text-2xl font-bold text-white">Add Expense</h2>
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
                {/* Amount Input */}
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                      ₹
                    </span>
                    <input
                      id="amount"
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
                </div>

                {/* Category Selection */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                    required
                  >
                    <option value="" className="bg-gray-900">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id} className="bg-gray-900">
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Note Input */}
                <div>
                  <label htmlFor="note" className="block text-sm font-medium text-gray-300 mb-2">
                    Note (Optional)
                  </label>
                  <input
                    id="note"
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                    placeholder="e.g., Grocery shopping"
                    maxLength={100}
                  />
                </div>

                {/* Preview and Overspending Warning */}
                {previewAmount > 0 && selectedCategory && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className={`p-4 border rounded-lg ${
                      selectedCategory.spent + previewAmount > selectedCategory.budgeted
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-primary-500/10 border-primary-500/20'
                    }`}
                  >
                    <p className="text-sm text-gray-400 mb-1">Adding to {selectedCategory.name}</p>
                    <p className="text-xl font-bold text-primary-300">{formatCurrency(previewAmount)}</p>
                    <div className="mt-2 text-xs">
                      {selectedCategory.spent + previewAmount > selectedCategory.budgeted ? (
                        <>
                          <p className="text-red-400 font-semibold flex items-center gap-1">
                            ⚠️ Overspending Alert
                          </p>
                          <p className="text-red-300 mt-1">
                            This expense will exceed your budget by {formatCurrency(selectedCategory.spent + previewAmount - selectedCategory.budgeted)}
                          </p>
                        </>
                      ) : (
                        <p className="text-gray-500">
                          Remaining after: {formatCurrency(selectedCategory.budgeted - selectedCategory.spent - previewAmount)}
                        </p>
                      )}
                    </div>
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
                    className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Adding...' : 'Add Expense'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

export default memo(AddExpenseModal)
