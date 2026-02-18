/**
 * Net worth tracking types
 */

/**
 * Point-in-time net worth snapshot
 */
export interface NetWorthSnapshot {
  id: string // UUID v4
  date: string // Snapshot date (YYYY-MM-DD)
  totalAssets: number // Sum of all asset balances in cents
  totalLiabilities: number // Sum of all liability balances in cents
  netWorth: number // totalAssets - totalLiabilities (in cents)
  createdAt: string // ISO 8601 timestamp
}

/**
 * Net worth calculation result
 * Used for displaying current net worth without saving snapshot
 */
export interface NetWorthCalculation {
  totalAssets: number // In cents
  totalLiabilities: number // In cents
  netWorth: number // In cents
  assetCount: number
  liabilityCount: number
  calculatedAt: string // ISO 8601 timestamp
}

/**
 * Net worth trend data for charting
 */
export interface NetWorthTrend {
  date: string // YYYY-MM-DD
  netWorth: number // In cents
  totalAssets: number // In cents
  totalLiabilities: number // In cents
}

/**
 * Date range for net worth history queries
 */
export interface NetWorthDateRange {
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
}

/**
 * Net worth summary statistics
 */
export interface NetWorthSummary {
  current: NetWorthCalculation
  change30Days?: number // In cents
  change90Days?: number // In cents
  change1Year?: number // In cents
  percentChange30Days?: number // Percentage (e.g., 5.5 for 5.5%)
  percentChange90Days?: number
  percentChange1Year?: number
}
