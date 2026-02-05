import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { createMandatoryRule } from '../services/rulesService'
import { formatCurrency } from '../utils/dateUtils'

interface Rule {
  id: string
  name: string
  amount: string
}

export default function RulesSetup() {
  const [rules, setRules] = useState<Rule[]>([])
  const [currentName, setCurrentName] = useState('')
  const [currentAmount, setCurrentAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const addRule = () => {
    const amount = parseFloat(currentAmount)
    if (!currentName.trim()) {
      setError('Please enter a rule name')
      return
    }
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    const newRule: Rule = {
      id: Date.now().toString(),
      name: currentName.trim(),
      amount: currentAmount
    }

    setRules([...rules, newRule])
    setCurrentName('')
    setCurrentAmount('')
    setError('')
  }

  const removeRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id))
  }

  const handleSubmit = async () => {
    if (!user) {
      setError('User not authenticated')
      return
    }

    setLoading(true)
    try {
      // Save all rules to Firestore
      for (const rule of rules) {
        await createMandatoryRule(user.uid, rule.name, parseFloat(rule.amount))
      }
      navigate('/category-setup')
    } catch (err) {
      console.error('Error saving rules:', err)
      setError('Failed to save rules. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const totalMandatory = rules.reduce((sum, rule) => sum + parseFloat(rule.amount), 0)

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass rounded-2xl p-8 max-w-2xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-500/20 mb-4">
            <span className="text-3xl">🔒</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Mandatory Rules</h1>
          <p className="text-gray-400">Set fixed expenses and savings that automatically deduct each month</p>
        </div>

        {/* Add Rule Form */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ruleName" className="block text-sm font-medium text-gray-300 mb-2">
                Rule Name
              </label>
              <input
                id="ruleName"
                type="text"
                value={currentName}
                onChange={(e) => setCurrentName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addRule()}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                placeholder="e.g., Netflix, Savings"
              />
            </div>

            <div>
              <label htmlFor="ruleAmount" className="block text-sm font-medium text-gray-300 mb-2">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                <input
                  id="ruleAmount"
                  type="number"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addRule()}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                  placeholder="0"
                  min="0"
                  step="1"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={addRule}
            className="w-full py-3 bg-white/10 border border-white/20 text-white font-medium rounded-lg hover:bg-white/20 transition"
          >
            + Add Rule
          </button>
        </div>

        {/* Rules List */}
        <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
          <AnimatePresence>
            {rules.map((rule) => (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg"
              >
                <div>
                  <p className="text-white font-medium">{rule.name}</p>
                  <p className="text-primary-400 text-sm">{formatCurrency(parseFloat(rule.amount))}</p>
                </div>
                <button
                  onClick={() => removeRule(rule.id)}
                  className="text-red-400 hover:text-red-300 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {rules.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No rules added yet</p>
              <p className="text-xs mt-1">You can skip this step if you don't have any mandatory expenses</p>
            </div>
          )}
        </div>

        {/* Total Summary */}
        {totalMandatory > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-primary-500/10 border border-primary-500/20 rounded-lg mb-6"
          >
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Mandatory Spending</span>
              <span className="text-2xl font-bold text-primary-300">{formatCurrency(totalMandatory)}</span>
            </div>
          </motion.div>
        )}

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
            onClick={() => navigate('/income-setup')}
            className="flex-1 py-3 bg-white/10 border border-white/20 text-white font-medium rounded-lg hover:bg-white/20 transition"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : rules.length === 0 ? 'Skip' : 'Continue'}
          </button>
        </div>

        {/* Progress indicator */}
        <div className="mt-8 flex items-center justify-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-primary-500/50"></div>
          <div className="w-2 h-2 rounded-full bg-primary-500"></div>
          <div className="w-2 h-2 rounded-full bg-white/20"></div>
        </div>
        <p className="text-center text-xs text-gray-500 mt-2">Step 2 of 3</p>
      </motion.div>
    </div>
  )
}
