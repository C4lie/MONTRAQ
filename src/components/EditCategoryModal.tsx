import { useState, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { updateCategory } from '../services/categoryService'
import type { Category } from '../types'

interface EditCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  category: Category | null
  onCategoryUpdated: () => void
}

const EditCategoryModal = memo(function EditCategoryModal({
  isOpen,
  onClose,
  category,
  onCategoryUpdated
}: EditCategoryModalProps) {
  const [name, setName] = useState('')
  const [budgeted, setBudgeted] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && category) {
      setName(category.name)
      setBudgeted(category.budgeted.toString())
      setError('')
    }
  }, [isOpen, category])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!category || !category.id) return

    const budgetAmount = parseFloat(budgeted)
    if (!budgetAmount || budgetAmount <= 0) {
      setError('Please enter a valid budget amount')
      return
    }

    if (!name.trim()) {
      setError('Please enter a category name')
      return
    }

    setLoading(true)
    try {
      await updateCategory(category.id, {
        name: name.trim(),
        budgeted: budgetAmount
      })
      onCategoryUpdated()
      onClose()
    } catch (err) {
      console.error('Error updating category:', err)
      setError('Failed to update category. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!category) return null

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
                <h2 className="text-2xl font-bold text-white">Edit Category</h2>
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
                {/* Category Name */}
                <div>
                  <label htmlFor="categoryName" className="block text-sm font-medium text-gray-300 mb-2">
                    Category Name
                  </label>
                  <input
                    id="categoryName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                    placeholder="e.g., Food & Dining"
                    maxLength={50}
                    required
                    autoFocus
                  />
                </div>

                {/* Budgeted Amount */}
                <div>
                  <label htmlFor="budgetAmount" className="block text-sm font-medium text-gray-300 mb-2">
                    Budget Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                      ₹
                    </span>
                    <input
                      id="budgetAmount"
                      type="number"
                      value={budgeted}
                      onChange={(e) => setBudgeted(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-xl font-semibold placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    Current spent: ₹{category.spent.toFixed(2)}
                  </p>
                </div>

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
                    {loading ? 'Saving...' : 'Save Changes'}
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

export default EditCategoryModal
