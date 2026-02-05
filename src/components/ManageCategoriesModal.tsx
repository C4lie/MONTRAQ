import { useState, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { updateCategory, createCategory, deleteCategory } from '../services/categoryService'
import { formatCurrency, getCurrentMonth } from '../utils/dateUtils'
import { Timestamp } from 'firebase/firestore'
import type { Category } from '../types'

interface ManageCategoriesModalProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  userId: string
  onCategoriesUpdated: () => void
}

const ManageCategoriesModal = memo(function ManageCategoriesModal({
  isOpen,
  onClose,
  categories,
  userId,
  onCategoriesUpdated
}: ManageCategoriesModalProps) {
  const [editingCategories, setEditingCategories] = useState<Category[]>([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryBudget, setNewCategoryBudget] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setEditingCategories([...categories])
      setNewCategoryName('')
      setNewCategoryBudget('')
      setError('')
    }
  }, [isOpen, categories])

  const handleUpdateCategory = (index: number, field: 'name' | 'budgeted', value: string | number) => {
    const updated = [...editingCategories]
    if (field === 'name') {
      updated[index].name = value as string
    } else {
      updated[index].budgeted = typeof value === 'string' ? parseFloat(value) : value
    }
    setEditingCategories(updated)
  }

  const handleAddCategory = () => {
    const budgetAmount = parseFloat(newCategoryBudget)
    if (!newCategoryName.trim()) {
      setError('Please enter a category name')
      return
    }
    if (!budgetAmount || budgetAmount <= 0) {
      setError('Please enter a valid budget amount')
      return
    }

    // Add to editing list
    const newCategory: Category = {
      id: `temp-${Date.now()}`,
      userId,
      month: getCurrentMonth(),
      name: newCategoryName.trim(),
      budgeted: budgetAmount,
      spent: 0,
      createdAt: Timestamp.now()
    }
    setEditingCategories([...editingCategories, newCategory])
    setNewCategoryName('')
    setNewCategoryBudget('')
    setError('')
  }

  const handleDeleteCategory = (index: number) => {
    const updated = [...editingCategories]
    updated.splice(index, 1)
    setEditingCategories(updated)
  }

  const handleSaveAll = async () => {
    setError('')
    setLoading(true)

    try {
      const currentMonth = getCurrentMonth()

      // Update existing categories and create new ones
      for (const cat of editingCategories) {
        if (cat.id?.startsWith('temp-')) {
          // New category - create it
          await createCategory(userId, currentMonth, cat.name, cat.budgeted)
        } else if (cat.id) {
          // Existing category - update it
          await updateCategory(cat.id, {
            name: cat.name,
            budgeted: cat.budgeted
          })
        }
      }

      // Delete categories that were removed
      const deletedCategories = categories.filter(
        cat => !editingCategories.find(ec => ec.id === cat.id)
      )
      for (const cat of deletedCategories) {
        if (cat.id) {
          await deleteCategory(cat.id)
        }
      }

      onCategoriesUpdated()
      onClose()
    } catch (err) {
      console.error('Error saving categories:', err)
      setError('Failed to save categories. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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
              className="glass rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Manage Categories</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Add New Category Section */}
              <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-lg">
                <h3 className="text-sm font-semibold text-white mb-3">Add New Category</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Category name (e.g., Food)"
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                      <input
                        type="number"
                        value={newCategoryBudget}
                        onChange={(e) => setNewCategoryBudget(e.target.value)}
                        placeholder="Budget"
                        className="w-full pl-8 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <button
                      onClick={handleAddCategory}
                      className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Existing Categories */}
              <div className="space-y-3 mb-6">
                <h3 className="text-sm font-semibold text-white">Your Categories</h3>
                {editingCategories.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">
                    No categories yet. Add one above to get started!
                  </p>
                ) : (
                  editingCategories.map((cat, index) => (
                    <div
                      key={cat.id}
                      className="p-3 bg-white/5 border border-white/10 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={cat.name}
                            onChange={(e) => handleUpdateCategory(index, 'name', e.target.value)}
                            className="px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                              <input
                                type="number"
                                value={cat.budgeted}
                                onChange={(e) => handleUpdateCategory(index, 'budgeted', e.target.value)}
                                className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                min="0"
                                step="0.01"
                              />
                            </div>
                            <button
                              onClick={() => handleDeleteCategory(index)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition"
                              title="Delete category"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                      {!cat.id?.startsWith('temp-') && cat.id && (
                        <p className="text-xs text-gray-400 mt-2">
                          Spent: {formatCurrency(cat.spent)} / {formatCurrency(cat.budgeted)}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg"
                >
                  <p className="text-red-300 text-sm">{error}</p>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-white/10 border border-white/20 text-white font-medium rounded-lg hover:bg-white/20 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAll}
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Save All Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
})

export default ManageCategoriesModal
