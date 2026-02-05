import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import { getMonthlyIncome } from '../services/incomeService'
import { getActiveMandatoryRules, getTotalMandatoryAmount } from '../services/rulesService'
import { getCategoryOverview } from '../services/categoryService'
import { getTotalMonthSavings, getSavingsBreakdown } from '../services/savingsService'
import { checkMonthMigration, performMonthMigration } from '../services/monthService'
import { getCurrentMonth, formatMonth, formatCurrency, calculatePercentage } from '../utils/dateUtils'
import AddExpenseModal from '../components/AddExpenseModal'
import SavingsModal from '../components/SavingsModal'
import InsightsModal from '../components/InsightsModal'
import ManageCategoriesModal from '../components/ManageCategoriesModal'
import AddIncomeModal from '../components/AddIncomeModal'
import { FloatingNav } from '../components/FloatingNav'
import { EncryptedText } from '../components/ui/encrypted-text'
import { CardContainer, CardBody, CardItem } from '../components/ui/3d-card'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import type { MandatoryRule, Category } from '../types'





export default function Dashboard() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const isOnline = useOnlineStatus()
  const [loading, setLoading] = useState(true)
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [isSavingsModalOpen, setIsSavingsModalOpen] = useState(false)
  const [isInsightsModalOpen, setIsInsightsModalOpen] = useState(false)
  const [isManageCategoriesModalOpen, setIsManageCategoriesModalOpen] = useState(false)
  const [isAddIncomeModalOpen, setIsAddIncomeModalOpen] = useState(false)
  const [income, setIncome] = useState(0)
  const [mandatoryRules, setMandatoryRules] = useState<MandatoryRule[]>([])
  const [mandatoryTotal, setMandatoryTotal] = useState(0)
  const [categories, setCategories] = useState<Category[]>([])
  const [totalBudgeted, setTotalBudgeted] = useState(0)
  const [totalSpent, setTotalSpent] = useState(0)
  const [savingsTotal, setSavingsTotal] = useState(0)
  const [savingsBreakdown, setSavingsBreakdown] = useState({ mandatory: 0, leftover: 0, total: 0 })

  const currentMonth = getCurrentMonth()

  useEffect(() => {
    checkAndMigrateMonth()
  }, [user])

  const checkAndMigrateMonth = async () => {
    if (!user) return

    try {
      const needsMigration = await checkMonthMigration(user.uid)
      
      if (needsMigration) {
        await performMonthMigration(user.uid)
      }

      await loadDashboardData()
    } catch (error) {
      console.error('Error in month migration:', error)
      setLoading(false)
    }
  }

  // Memoize expensive calculations
  const availableBalance = useMemo(() => income - mandatoryTotal, [income, mandatoryTotal])
  const remaining = useMemo(() => totalBudgeted - totalSpent, [totalBudgeted, totalSpent])

  // Optimize callbacks to prevent unnecessary re-renders
  const loadDashboardData = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)

      // Batch parallel requests for better performance
      const [
        incomeData,
        rules,
        categoryData,
        monthSavings,
        breakdown
      ] = await Promise.all([
        getMonthlyIncome(user.uid, currentMonth),
        getActiveMandatoryRules(user.uid),
        getCategoryOverview(user.uid, currentMonth),
        getTotalMonthSavings(user.uid, currentMonth),
        getSavingsBreakdown(user.uid, currentMonth)
      ])

      const mandatory = await getTotalMandatoryAmount(user.uid)

      setIncome(incomeData?.amount || 0)
      setMandatoryRules(rules)
      setMandatoryTotal(mandatory)
      setCategories(categoryData.categories)
      setTotalBudgeted(categoryData.totalBudgeted)
      setTotalSpent(categoryData.totalSpent)
      setSavingsTotal(monthSavings)
      setSavingsBreakdown(breakdown)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [user, currentMonth])

  const handleLogout = useCallback(async () => {
    await logout()
    navigate('/login')
  }, [logout, navigate])

  const handleOpenExpenseModal = useCallback(() => {
    // Check if user has available balance
    const currentAvailableBalance = income - mandatoryTotal
    if (currentAvailableBalance <= 0) {
      // Show alert or message - user needs to add income first
      alert('You have no available balance to budget. Please add extra income or increase your monthly income.')
      setIsAddIncomeModalOpen(true)
      return
    }
    setIsExpenseModalOpen(true)
  }, [income, mandatoryTotal])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-8">
          <div className="flex items-center space-x-3">
            <div className="shimmer w-12 h-12 rounded-full" />
            <p className="text-gray-300">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 pb-24 sm:pb-28">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1">
            <EncryptedText text="MONTRAQ" />
          </h1>
          <p className="text-sm sm:text-base text-gray-400">{formatMonth(currentMonth)}</p>
        </motion.div>

        {/* Offline Status Indicator */}
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 md:mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📡</span>
              <div className="flex-1">
                <h3 className="text-orange-300 font-semibold mb-1">You're Offline</h3>
                <p className="text-sm text-orange-200/80">
                  Some features may be limited. Your data will sync when you're back online.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Zero Income Warning */}
        {income === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 md:mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="text-yellow-300 font-semibold mb-1">No Monthly Income Set</h3>
                <p className="text-sm text-yellow-200/80">
                  Please set up your monthly income in the setup screen to start tracking your budget effectively.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Income Summary - with 3D effect */}
        <CardContainer className="w-full mb-4 md:mb-6">
          <CardBody className="w-full h-auto">
            <CardItem translateZ="50" className="w-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-xl hover:shadow-primary-500/10 active:shadow-xl active:shadow-primary-500/10 transition-all duration-300"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  <motion.div 
                    className="text-center"
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <p className="text-xs sm:text-sm text-gray-400 mb-1">Monthly Income</p>
                    <p className="text-lg sm:text-2xl font-bold text-white">{formatCurrency(income)}</p>
                    <button
                      onClick={() => setIsAddIncomeModalOpen(true)}
                      className="mt-2 text-xs text-primary-400 hover:text-primary-300 transition flex items-center gap-1 mx-auto"
                    >
                      <span>+</span>
                      <span>Add Extra</span>
                    </button>
                  </motion.div>
                  <motion.div 
                    className="text-center"
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}

                  >
                    <p className="text-xs sm:text-sm text-gray-400 mb-1">Mandatory</p>
                    <p className="text-lg sm:text-2xl font-bold text-red-400">{formatCurrency(mandatoryTotal)}</p>
                  </motion.div>
                  <motion.div 
                    className="text-center"
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}

                  >
                    <p className="text-xs sm:text-sm text-gray-400 mb-1">Available</p>
                    <p className={`text-lg sm:text-2xl font-bold ${availableBalance > 0 ? 'text-primary-400' : 'text-red-400'}`}>
                      {formatCurrency(availableBalance)}
                    </p>
                    {availableBalance <= 0 && (
                      <p className="mt-1 text-xs text-red-300">Add income to budget</p>
                    )}
                  </motion.div>
                  <motion.div 
                    className="text-center"
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}

                  >
                    <p className="text-xs sm:text-sm text-gray-400 mb-1">Remaining</p>
                    <p className={`text-lg sm:text-2xl font-bold ${remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(remaining)}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </CardItem>
          </CardBody>
        </CardContainer>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Left Column: Categories */}
          <div className="space-y-3 md:space-y-4">
            <div className="flex justify-between items-center mb-3 md:mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-white">Budget Categories</h2>
              <button
                onClick={() => setIsManageCategoriesModalOpen(true)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 active:bg-primary-700 transition flex items-center gap-2"
              >
                <span>⚙️</span>
                <span>Manage</span>
              </button>
            </div>
            
            {categories.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass rounded-xl p-5 sm:p-6 text-center"
              >
                <p className="text-sm sm:text-base text-gray-400">
                  <EncryptedText text="No categories set up yet" />
                </p>
                <button
                  onClick={() => setIsManageCategoriesModalOpen(true)}
                  className="mt-4 px-5 sm:px-6 py-2.5 sm:py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 active:bg-primary-700 transition text-sm sm:text-base touch-manipulation min-h-[44px]"
                >
                  Add Categories
                </button>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {categories.map((category, index) => {
                  const percentage = calculatePercentage(category.spent, category.budgeted)
                  const isOverspent = category.spent > category.budgeted
                  
                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      className="glass rounded-lg sm:rounded-xl p-3 sm:p-4 cursor-pointer hover:bg-white/5 active:bg-white/10 transition"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm sm:text-base text-white font-medium">{category.name}</h3>
                        <div className="text-right">
                          <p className="text-xs sm:text-sm text-gray-400">
                            {formatCurrency(category.spent)} / {formatCurrency(category.budgeted)}
                          </p>
                          <p className={`text-xs ${isOverspent ? 'text-red-400' : 'text-gray-500'}`}>
                            {percentage}% {isOverspent && '(Over!)'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(percentage, 100)}%` }}
                          transition={{ duration: 1, delay: 0.3 + index * 0.05, ease: 'easeOut' }}
                          className={`h-full ${
                            isOverspent
                              ? 'bg-gradient-to-r from-red-500 to-red-600'
                              : percentage > 80
                              ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                              : 'bg-gradient-to-r from-primary-500 to-primary-600'
                          }`}
                        />
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right Column: Mandatory Rules & Savings */}
          <div className="space-y-3 md:space-y-4">
            {/* Savings Vault - with 3D effect */}
            <CardContainer className="w-full mb-4 group cursor-pointer" containerClassName="py-0">
              <CardBody className="w-full h-auto">
                <CardItem translateZ="30" className="w-full">
                  <motion.div
                    onClick={() => setIsSavingsModalOpen(true)}
                    className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20 hover:border-blue-500/40 relative overflow-hidden transition-all duration-300"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-50">
                      <span className="text-4xl">🏦</span>
                    </div>
                    <div className="relative z-10">
                      <p className="text-sm text-blue-300 font-medium mb-1">Total Savings</p>
                      <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                        {formatCurrency(savingsTotal)}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-blue-200/70">
                        <span>View Breakdown</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                </CardItem>
              </CardBody>
            </CardContainer>

            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 md:mb-4">Mandatory Rules</h2>
            
            {/* Mandatory Rules */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-lg sm:rounded-xl p-4 sm:p-6 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300"
            >
              <div className="flex items-center justify-end mb-3 sm:mb-4">
                <span className="text-xs sm:text-sm text-gray-400 flex items-center gap-1">
                  <span>🔒</span>
                  <span>Locked</span>
                </span>
              </div>

              {mandatoryRules.length === 0 ? (
                <p className="text-gray-400 text-sm">
                  <EncryptedText text="No mandatory rules" />
                </p>
              ) : (
                <div className="space-y-3">
                  {mandatoryRules.map((rule, index) => (
                    <motion.div
                      key={rule.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className="group"
                    >
                      <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5 transition-colors duration-200">
                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                          {rule.name}
                        </span>
                        <span className="text-sm font-medium text-primary-300 group-hover:text-primary-200 transition-colors">
                          {formatCurrency(rule.amount)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                  
                  <div className="pt-3 mt-3 border-t border-white/10">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-400">Total</span>
                      <span className="text-base font-bold text-red-400">
                        {formatCurrency(mandatoryTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Add Expense Modal */}
        <AddExpenseModal
          isOpen={isExpenseModalOpen}
          onClose={() => setIsExpenseModalOpen(false)}
          categories={categories}
          userId={user?.uid || ''}
          onExpenseAdded={loadDashboardData}
        />

        {/* Savings Modal */}
        <SavingsModal
          isOpen={isSavingsModalOpen}
          onClose={() => setIsSavingsModalOpen(false)}
          userId={user?.uid || ''}
          currentMonthSavings={savingsTotal}
          savingsBreakdown={savingsBreakdown}
        />

        {/* Insights Modal */}
        <InsightsModal
          isOpen={isInsightsModalOpen}
          onClose={() => setIsInsightsModalOpen(false)}
          currentMonth={currentMonth}
          income={income}
          totalSpent={totalSpent}
          categories={categories}
          savingsTotal={savingsTotal}
        />

        {/* Manage Categories Modal */}
        <ManageCategoriesModal
          isOpen={isManageCategoriesModalOpen}
          onClose={() => setIsManageCategoriesModalOpen(false)}
          categories={categories}
          userId={user?.uid || ''}
          onCategoriesUpdated={loadDashboardData}
        />

        {/* Add Income Modal */}
        <AddIncomeModal
          isOpen={isAddIncomeModalOpen}
          onClose={() => setIsAddIncomeModalOpen(false)}
          userId={user?.uid || ''}
          currentIncome={income}
          onIncomeAdded={loadDashboardData}
        />

        {/* Floating Navigation */}
        <FloatingNav
          onAddExpense={handleOpenExpenseModal}
          onInsights={() => setIsInsightsModalOpen(true)}
          onSavings={() => setIsSavingsModalOpen(true)}
          onLogout={handleLogout}
        />
      </div>
    </div>
  )
}
