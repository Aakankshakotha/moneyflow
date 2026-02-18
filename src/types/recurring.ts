/**
 * Recurring transaction types
 */

/**
 * Frequency of recurring transactions
 */
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

/**
 * Recurring transaction status
 */
export type RecurringStatus = 'active' | 'paused'

/**
 * Core recurring transaction entity
 * Template for transactions that repeat on a schedule
 */
export interface RecurringTransaction {
  id: string // UUID v4
  fromAccountId: string // Source account UUID
  toAccountId: string // Destination account UUID
  amount: number // Transfer amount in cents
  description: string // Description template
  frequency: RecurrenceFrequency
  status: RecurringStatus
  lastProcessedDate?: string // Last date processed (YYYY-MM-DD)
  createdAt: string // ISO 8601 timestamp
  updatedAt: string // ISO 8601 timestamp
}

/**
 * DTO for creating a new recurring transaction
 */
export interface CreateRecurringDto {
  fromAccountId: string
  toAccountId: string
  amount: number // In cents
  description: string
  frequency: RecurrenceFrequency
}

/**
 * DTO for updating an existing recurring transaction
 */
export interface UpdateRecurringDto {
  amount?: number
  description?: string
  frequency?: RecurrenceFrequency
  status?: RecurringStatus
}

/**
 * Result of processing a recurring transaction
 */
export interface ProcessRecurringResult {
  transactionId: string
  processedDate: string // YYYY-MM-DD
  recurringTransactionId: string
}

/**
 * Recurring transaction with account details
 */
export interface RecurringTransactionWithAccounts extends RecurringTransaction {
  fromAccountName: string
  toAccountName: string
}

/**
 * Helper to determine if recurring transaction needs processing
 */
export interface RecurringProcessingStatus {
  recurringTransaction: RecurringTransaction
  needsProcessing: boolean
  nextProcessDate?: string // YYYY-MM-DD
  daysSinceLastProcess?: number
}
