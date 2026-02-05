import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { getMonthlyIncome } from '../services/incomeService'
import { getTotalMandatoryAmount } from '../services/rulesService'
import { createCategory } from '../services/categoryService'
import { getCurrentMonth, formatCurrency } from '../utils/dateUtils'

interface CategoryBudget {
  name: string
  budgeted: string
  emoji: string
}

const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', emoji: '🍔' },
  { name: 'Transportation', emoji: '🚗' },
  { name: 'Shopping', emoji: '🛍️' },
  { name: 'Entertainment', emoji: '🎬' },
  { name: 'Bills & Utilities', emoji: '⚡' },
  { name: 'Healthcare', emoji: '🏥' },
  { name: 'Personal Care', emoji: '💇' },
  { name: 'Miscellaneous', emoji: '📦' }
]

export default function CategorySetup() {
  const [categories, setCategories] = useState<CategoryBudget[]>(
    DEFAULT_CATEGORIES.map(cat => ({ ...cat, budgeted: '' }))
  )
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState('')
  const [income, setIncome] = useState(0)
  const [mandatoryTotal, setMandatoryTotal] = useState(0)
  const { user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    const loadData = async () => {
      if (!user) return

      try {
        const currentMonth = getCurrentMonth()
        const incomeData = await getMonthlyIncome(user.uid, currentMonth)
        const mandatoryAmount = await getTotalMandatoryAmount(user.uid)

        setIncome(incomeData?.amount || 0)
        setMandatoryTotal(mandatoryAmount)
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Failed to load income data')
      } finally {
        setInitialLoading(false)
      }
    }

    loadData()
  }, [user])

  const updateCategoryBudget = (index: number, value: string) => {
    const updated = [...categories]
    updated[index].budgeted = value
    setCategories(updated)
  }

  const totalBudgeted = categories.reduce((sum, cat) => {
    const amount = parseFloat(cat.budgeted) || 0
    return sum + amount
  }, 0)

  const availableBalance = income - mandatoryTotal
  const remaining = availableBalance - totalBudgeted

  const handleSubmit = async () => {
    if (!user) {
      setError('User not authenticated')
      return
    }

    // Validation
    const categoriesWithBudget = categories.filter(cat => parseFloat(cat.budgeted) > 0)
    
    if (categoriesWithBudget.length === 0) {
      setError('Please set at least one category budget')
      return
    }

    if (remaining < 0) {
      setError('Total budget exceeds available balance')
      return
    }

    setLoading(true)
    try {
      const currentMonth = getCurrentMonth()
      
      // Create only categories with budget > 0
      for (const cat of categoriesWithBudget) {
        await createCategory(
          user.uid,
          currentMonth,
          cat.name,
          parseFloat(cat.budgeted)
        )
      }

      navigate('/dashboard')
    } catch (err) {
      console.error('Error saving categories:', err)
      setError('Failed to save categories. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-8">
          <div className="flex items-center space-x-3">
            <div className="shimmer w-12 h-12 rounded-full" />
            <p className="text-gray-300">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass rounded-2xl p-8 max-w-3xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-500/20 mb-4">
            <span className="text-3xl">📊</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Budget Categories</h1>
          <p className="text-gray-400">Allocate your budget across spending categories</p>
        </div>

        {/* Budget Overview */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-white/5 border border-white/10 rounded-lg text-center">
            <p className="text-xs text-gray-400 mb-1">Income</p>
            <p className="text-lg font-bold text-white">{formatCurrency(income)}</p>
          </div>
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
            <p className="text-xs text-gray-400 mb-1">Mandatory</p>
            <p className="text-lg font-bold text-red-300">{formatCurrency(mandatoryTotal)}</p>
          </div>
          <div className="p-4 bg-primary-500/10 border border-primary-500/20 rounded-lg text-center">
            <p className="text-xs text-gray-400 mb-1">Available</p>
            <p className="text-lg font-bold text-primary-300">{formatCurrency(availableBalance)}</p>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 max-h-96 overflow-y-auto pr-2">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 bg-white/5 border border-white/10 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{cat.emoji}</span>
                  <span className="text-white font-medium text-sm">{cat.name}</span>
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                <input
                  type="number"
                  value={cat.budgeted}
                  onChange={(e) => updateCategoryBudget(index, e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                  placeholder="0"
                  min="0"
                  step="1"
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="p-4 bg-gradient-to-r from-primary-500/10 to-primary-600/10 border border-primary-500/20 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">Total Budgeted</span>
            <span className="text-xl font-bold text-white">{formatCurrency(totalBudgeted)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Remaining</span>
            <span className={`text-xl font-bold ${remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(remaining)}
            </span>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg mb-6"
          >
            <p className="text-red-300 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/rules-setup')}
            className="flex-1 py-3 bg-white/10 border border-white/20 text-white font-medium rounded-lg hover:bg-white/20 transition"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Setting up...' : 'Complete Setup'}
          </button>
        </div>

        {/* Progress indicator */}
        <div className="mt-8 flex items-center justify-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-primary-500/50"></div>
          <div className="w-2 h-2 rounded-full bg-primary-500/50"></div>
          <div className="w-2 h-2 rounded-full bg-primary-500"></div>
        </div>
        <p className="text-center text-xs text-gray-500 mt-2">Step 3 of 3</p>
      </motion.div>
    </div>
  )
}
