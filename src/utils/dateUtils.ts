/**
 * Utility functions for date and month handling
 */

/**
 * Get current month in YYYY-MM format
 */
export function getCurrentMonth(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

/**
 * Get previous month in YYYY-MM format
 */
export function getPreviousMonth(monthStr?: string): string {
  const current = monthStr ? new Date(monthStr + '-01') : new Date()
  const previous = new Date(current.getFullYear(), current.getMonth() - 1, 1)
  const year = previous.getFullYear()
  const month = String(previous.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

/**
 * Get next month in YYYY-MM format
 */
export function getNextMonth(monthStr?: string): string {
  const current = monthStr ? new Date(monthStr + '-01') : new Date()
  const next = new Date(current.getFullYear(), current.getMonth() + 1, 1)
  const year = next.getFullYear()
  const month = String(next.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

/**
 * Format month string to readable format
 * @param monthStr - Month in YYYY-MM format
 * @returns Formatted month like "February 2026"
 */
export function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1, 1)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

/**
 * Check if a month string is valid (YYYY-MM format)
 */
export function isValidMonth(monthStr: string): boolean {
  const regex = /^\d{4}-(0[1-9]|1[0-2])$/
  return regex.test(monthStr)
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency = '₹'): string {
  return `${currency}${amount.toLocaleString('en-IN')}`
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}
