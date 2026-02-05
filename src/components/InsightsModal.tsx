import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatCurrency, formatMonth } from '../utils/dateUtils'
import type { Category } from '../types'

interface InsightsModalProps {
  isOpen: boolean
  onClose: () => void
  currentMonth: string
  income: number
  totalSpent: number
  categories: Category[]
  savingsTotal: number
}

interface Insight {
  icon: string
  label: string
  value: string
  color: string
}

export default function InsightsModal({
  isOpen,
  onClose,
  currentMonth,
  income,
  totalSpent,
  categories,
  savingsTotal
}: InsightsModalProps) {
  const [insights, setInsights] = useState<Insight[]>([])

  useEffect(() => {
    if (isOpen) {
      calculateInsights()
    }
  }, [isOpen, income, totalSpent, categories, savingsTotal])

  const calculateInsights = () => {
    const newInsights: Insight[] = []

    // Calculate percentages
    const spentPercentage = income > 0 ? Math.round((totalSpent / income) * 100) : 0
    const savedPercentage = income > 0 ? Math.round((savingsTotal / income) * 100) : 0

    // Find top spending category
    const topCategory = categories.reduce((max, cat) => 
      cat.spent > max.spent ? cat : max
    , categories[0] || { name: 'None', spent: 0 })

    // Build insights array
    newInsights.push({
      icon: '💰',
      label: 'Total Income',
      value: formatCurrency(income),
      color: 'text-primary-400'
    })

    newInsights.push({
      icon: '💸',
      label: 'Total Spent',
      value: `${formatCurrency(totalSpent)} (${spentPercentage}%)`,
      color: 'text-red-400'
    })

    newInsights.push({
      icon: '🏦',
      label: 'Total Saved',
      value: `${formatCurrency(savingsTotal)} (${savedPercentage}%)`,
      color: 'text-green-400'
    })

    if (topCategory && topCategory.spent > 0) {
      newInsights.push({
        icon: '📊',
        label: 'Top Spending',
        value: `${topCategory.name} (${formatCurrency(topCategory.spent)})`,
        color: 'text-yellow-400'
      })
    }

    setInsights(newInsights)
  }

  const spentPercentage = income > 0 ? (totalSpent / income) * 100 : 0
  const savedPercentage = income > 0 ? (savingsTotal / income) * 100 : 0
  const remaining = income - totalSpent

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
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center">
                    <span className="text-2xl">📈</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Monthly Insights</h2>
                    <p className="text-sm text-gray-400">{formatMonth(currentMonth)}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {insights.map((insight, index) => (
                  <motion.div
                    key={insight.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-white/5 border border-white/10 rounded-xl"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{insight.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm text-gray-400">{insight.label}</p>
                        <p className={`text-lg font-bold ${insight.color}`}>{insight.value}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Spending Breakdown Bar */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-6 bg-gradient-to-br from-primary-500/10 to-primary-600/10 border border-primary-500/20 rounded-xl mb-6"
              >
                <h3 className="text-lg font-bold text-white mb-4">Income Breakdown</h3>
                
                {/* Visual Bar */}
                <div className="w-full h-12 bg-white/10 rounded-lg overflow-hidden mb-4 flex">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${spentPercentage}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center"
                  >
                    {spentPercentage > 15 && (
                      <span className="text-white text-sm font-medium">{Math.round(spentPercentage)}%</span>
                    )}
                  </motion.div>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${savedPercentage}%` }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center"
                  >
                    {savedPercentage > 15 && (
                      <span className="text-white text-sm font-medium">{Math.round(savedPercentage)}%</span>
                    )}
                  </motion.div>
                </div>

                {/* Legend */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span className="text-gray-400">Spent</span>
                    </div>
                    <p className="text-white font-medium">{Math.round(spentPercentage)}%</p>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span className="text-gray-400">Saved</span>
                    </div>
                    <p className="text-white font-medium">{Math.round(savedPercentage)}%</p>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-3 h-3 bg-gray-500 rounded"></div>
                      <span className="text-gray-400">Remaining</span>
                    </div>
                    <p className="text-white font-medium">{formatCurrency(remaining)}</p>
                  </div>
                </div>
              </motion.div>

              {/* Monthly Summary */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl"
              >
                <h3 className="text-lg font-bold text-white mb-3">Monthly Summary</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-300">
                    {savingsTotal > 0 ? (
                      <>
                        🎉 Great job! You've saved <strong className="text-green-400">{formatCurrency(savingsTotal)}</strong> this month.
                      </>
                    ) : (
                      <>
                        💡 Try to save some money this month for your financial goals.
                      </>
                    )}
                  </p>
                  <p className="text-gray-300">
                    {spentPercentage > 90 ? (
                      <>
                        ⚠️ You've spent <strong className="text-red-400">{Math.round(spentPercentage)}%</strong> of your income. Consider reducing expenses.
                      </>
                    ) : spentPercentage > 70 ? (
                      <>
                        ⚡ You've spent <strong className="text-yellow-400">{Math.round(spentPercentage)}%</strong> of your income. Watch your spending.
                      </>
                    ) : (
                      <>
                        ✅ You're doing well! Only <strong className="text-primary-400">{Math.round(spentPercentage)}%</strong> of income spent.
                      </>
                    )}
                  </p>
                  {categories.length > 0 && (
                    <p className="text-gray-300">
                      📊 You're tracking expenses across <strong className="text-primary-400">{categories.length}</strong> categories.
                    </p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
