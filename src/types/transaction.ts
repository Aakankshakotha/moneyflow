/**
 * Transaction-related types
 */

import type { Account } from './account'

/**
 * Transaction category with group
 */
export interface TransactionCategory {
  id: string
  name: string
  group:
    | 'home'
    | 'transportation'
    | 'food'
    | 'healthcare'
    | 'entertainment'
    | 'utilities'
    | 'personal'
    | 'income'
    | 'other'
  color: string
  icon?: string
}

/**
 * Core transaction entity
 * Represents a transfer of money between two accounts
 */
export interface Transaction {
  id: string // UUID v4
  fromAccountId: string // Source account UUID
  toAccountId: string // Destination account UUID
  amount: number // Transfer amount in cents (always positive integer)
  description: string // Transaction description
  date: string // Transaction date (YYYY-MM-DD)
  category?: string // Category ID
  tags?: string[] // Optional tags
  createdAt: string // ISO 8601 timestamp
}

/**
 * Transaction with populated account details
 * Used in views where account names need to be displayed
 */
export interface TransactionWithAccounts extends Transaction {
  fromAccount: Account
  toAccount: Account
}

/**
 * DTO for creating a new transaction
 */
export interface CreateTransactionDto {
  fromAccountId: string
  toAccountId: string
  amount: number // In cents
  description: string
  date: string // YYYY-MM-DD
  category?: string // Category ID
  tags?: string[]
}

/**
 * DTO for updating an existing transaction
 */
export interface UpdateTransactionDto {
  description?: string
  date?: string
}

/**
 * Filter options for listing transactions
 */
export interface TransactionFilter {
  accountId?: string // Show transactions involving this account
  fromAccountId?: string // Show transactions from this account
  toAccountId?: string // Show transactions to this account
  startDate?: string // YYYY-MM-DD
  endDate?: string // YYYY-MM-DD
  searchTerm?: string // Search in description
  category?: string // Filter by category
  limit?: number
  offset?: number
}

/**
 * Transaction list result with pagination
 */
export interface TransactionListResult {
  transactions: Transaction[]
  total: number
  hasMore: boolean
}
