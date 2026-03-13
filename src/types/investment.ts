/**
 * Investment snapshot types — track daily value of investment accounts
 */

/**
 * A point-in-time value snapshot for one investment account.
 * Saved automatically whenever the account balance is updated.
 */
export interface InvestmentSnapshot {
  id: string // UUID v4
  accountId: string // account.id
  date: string // YYYY-MM-DD (one entry per day; latest overwrites earlier that day)
  value: number // Account balance (current market value) in cents
  costBasis: number // Cost basis in cents at snapshot time
  createdAt: string // ISO 8601 timestamp
}
