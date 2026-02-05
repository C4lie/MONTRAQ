import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getSavingsHistory, getTotalSavings } from '../services/savingsService'
import { formatCurrency, formatMonth } from '../utils/dateUtils'

interface SavingsModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  currentMonthSavings: number
  savingsBreakdown: { mandatory: number; leftover: number; total: number }
}

export default function SavingsModal({
  isOpen,
  onClose,
  userId,
  currentMonthSavings,
  savingsBreakdown
}: SavingsModalProps) {
  const [savingsHistory, setSavingsHistory] = useState<{ month: string; total: number }[]>([])
  const [totalSavings, setTotalSavings] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false)

  useEffect(() => {
    if (isOpen && userId) {
      loadSavingsData()
    }
  }, [isOpen, userId])

  const loadSavingsData = async () => {
    try {
      setLoading(true)
      const [history, total] = await Promise.all([
        getSavingsHistory(userId, 12),
        getTotalSavings(userId)
      ])
      setSavingsHistory(history)
      setTotalSavings(total)
    } catch (error) {
      console.error('Error loading savings:', error)
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
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center">
                    <span className="text-2xl">🏦</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Savings Vault</h2>
                    <p className="text-sm text-gray-400">Your financial safety net</p>
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

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="shimmer w-12 h-12 rounded-full" />
                </div>
              ) : (
                <>
                  {/* Total Savings */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-gradient-to-br from-primary-500/20 to-primary-600/20 border border-primary-500/30 rounded-xl mb-6"
                  >
                    <p className="text-sm text-gray-400 mb-2">Total Savings (All Time)</p>
                    <p className="text-4xl font-bold text-primary-300 mb-4">{formatCurrency(totalSavings)}</p>
                    
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-gray-300 text-sm">🔒 Protected Amount</span>
                      <button
                        onClick={() => setShowWithdrawConfirm(true)}
                        disabled={totalSavings === 0}
                        className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-300 text-sm rounded-lg hover:bg-red-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Withdraw
                      </button>
                    </div>
                  </motion.div>

                  {/* Current Month Breakdown */}
                  {currentMonthSavings > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="p-4 bg-white/5 border border-white/10 rounded-xl mb-6"
                    >
                      <p className="text-sm text-gray-400 mb-3">This Month's Savings</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-300 text-sm">From Mandatory Rules</span>
                          <span className="text-white font-medium">{formatCurrency(savingsBreakdown.mandatory)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300 text-sm">Leftover Budget</span>
                          <span className="text-white font-medium">{formatCurrency(savingsBreakdown.leftover)}</span>
                        </div>
                        <div className="pt-2 border-t border-white/10 flex justify-between">
                          <span className="text-primary-400 font-medium">Total This Month</span>
                          <span className="text-primary-400 font-bold">{formatCurrency(currentMonthSavings)}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Savings History */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-white mb-3">Monthly History</h3>
                    
                    {savingsHistory.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-8">No savings history yet</p>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {savingsHistory.map((item, index) => (
                          <motion.div
                            key={item.month}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + index * 0.05 }}
                            className="flex justify-between items-center p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition"
                          >
                            <div>
                              <p className="text-white font-medium">{formatMonth(item.month)}</p>
                              <p className="text-xs text-gray-500">Saved</p>
                            </div>
                            <div className="text-right">
                              <p className="text-primary-400 font-bold">{formatCurrency(item.total)}</p>
                              {index === 0 && (
                                <span className="text-xs text-primary-500">Latest</span>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Info Box */}
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-blue-300 text-sm">
                      💡 <strong>Tip:</strong> Your savings are protected and require confirmation to withdraw. 
                      Keep building your financial safety net month by month!
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </div>

          {/* Withdraw Confirmation Dialog */}
          <AnimatePresence>
            {showWithdrawConfirm && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/80"
                  onClick={() => setShowWithdrawConfirm(false)}
                />
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="glass rounded-xl p-6 max-w-md w-full relative z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                      <span className="text-3xl">⚠️</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Withdraw Savings?</h3>
                    <p className="text-gray-400 text-sm">
                      This action will reduce your total savings. Are you sure you want to proceed?
                    </p>
                  </div>

                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-6">
                    <p className="text-red-300 text-sm text-center">
                      Amount: <strong>{formatCurrency(totalSavings)}</strong>
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowWithdrawConfirm(false)}
                      className="flex-1 py-3 bg-white/10 border border-white/20 text-white font-medium rounded-lg hover:bg-white/20 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        // TODO: Implement withdrawal logic in future enhancement
                        alert('Withdrawal feature coming soon! For v1, savings are view-only.')
                        setShowWithdrawConfirm(false)
                      }}
                      className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition"
                    >
                      Confirm Withdraw
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  )
}
