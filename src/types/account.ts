/**
 * Account-related types
 */

/**
 * Account type determines how balance is calculated
 * - asset: What you own (positive balance is good)
 * - liability: What you owe (positive balance is bad)
 * - income: Money coming in
 * - expense: Money going out
 */
export type AccountType = 'asset' | 'liability' | 'income' | 'expense'

/**
 * Account status
 * - active: Can be used in new transactions
 * - archived: Cannot be used in new transactions
 */
export type AccountStatus = 'active' | 'archived'

/**
 * Core account entity
 */
export interface Account {
  id: string // UUID v4
  name: string // 1-100 characters, unique within type
  type: AccountType
  parentAccountId?: string // Optional parent account UUID for sub-accounts
  balance: number // Current balance in cents (integer)
  status: AccountStatus
  createdAt: string // ISO 8601 timestamp
  updatedAt: string // ISO 8601 timestamp
}

/**
 * Account with calculated balance from transactions
 * Used in views where balance needs to be displayed
 */
export interface AccountWithBalance extends Account {
  transactionCount: number
}

/**
 * DTO for creating a new account
 */
export interface CreateAccountDto {
  name: string
  type: AccountType
  parentAccountId?: string | null
  balance?: number // Optional, defaults to 0
}

/**
 * DTO for updating an existing account
 */
export interface UpdateAccountDto {
  name?: string
  status?: AccountStatus
  parentAccountId?: string | null
  balance?: number // Optional updated balance in cents
}

/**
 * Filter options for listing accounts
 */
export interface AccountFilter {
  type?: AccountType
  status?: AccountStatus
  searchTerm?: string
}
