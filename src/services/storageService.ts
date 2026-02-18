import type { Result } from '@/types/common'
import type { Account } from '@/types/account'
import type { Transaction } from '@/types/transaction'
import type { RecurringTransaction } from '@/types/recurring'
import type { NetWorthSnapshot } from '@/types/netWorth'
import {
  isValidUUID,
  isValidAmount,
  isValidDateString,
  isValidAccountType,
  isValidAccountStatus,
  isValidRecurrenceFrequency,
  isValidRecurringStatus,
} from '@/utils/validationUtils'

/**
 * Storage keys for localStorage
 */
const STORAGE_KEYS = {
  ACCOUNTS: 'moneyflow_accounts',
  TRANSACTIONS: 'moneyflow_transactions',
  RECURRING: 'moneyflow_recurring',
  NET_WORTH: 'moneyflow_networth',
  VERSION: 'moneyflow_version',
} as const

/**
 * Export data structure
 */
export interface ExportData {
  version: string
  exportedAt: string
  accounts: Account[]
  transactions: Transaction[]
  recurring: RecurringTransaction[]
  netWorthSnapshots: NetWorthSnapshot[]
}

/**
 * Storage container for each entity type
 */
interface StorageContainer<T> {
  version: string
  data: T[]
}

/**
 * StorageService - Provides type-safe interface to browser localStorage
 */
export class StorageService {
  private readonly version = '1.0.0'

  /**
   * Account Operations
   */

  async getAccounts(): Promise<
    Result<Account[], { type: 'StorageError'; message: string }>
  > {
    try {
      const container = this.getContainer<Account>(STORAGE_KEYS.ACCOUNTS)
      return { success: true, data: container.data }
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'StorageError',
          message:
            error instanceof Error
              ? error.message
              : 'Failed to retrieve accounts',
        },
      }
    }
  }

  async getAccount(
    id: string
  ): Promise<Result<Account, { type: 'NotFoundError'; message: string }>> {
    const accountsResult = await this.getAccounts()
    if (!accountsResult.success) {
      return {
        success: false,
        error: {
          type: 'NotFoundError',
          message: 'Account not found',
        },
      }
    }

    const account = accountsResult.data.find((a) => a.id === id)
    if (!account) {
      return {
        success: false,
        error: {
          type: 'NotFoundError',
          message: 'Account not found',
        },
      }
    }

    return { success: true, data: account }
  }

  async saveAccount(
    account: Account
  ): Promise<
    Result<
      Account,
      { type: 'ValidationError' | 'StorageError'; message: string }
    >
  > {
    // Validate account
    const validationError = this.validateAccount(account)
    if (validationError) {
      return {
        success: false,
        error: {
          type: 'ValidationError',
          message: validationError,
        },
      }
    }

    try {
      const accountsResult = await this.getAccounts()
      const accounts = accountsResult.success ? accountsResult.data : []

      // Update or add account
      const existingIndex = accounts.findIndex((a) => a.id === account.id)
      if (existingIndex >= 0) {
        accounts[existingIndex] = account
      } else {
        accounts.push(account)
      }

      this.setContainer(STORAGE_KEYS.ACCOUNTS, accounts)

      return { success: true, data: account }
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'StorageError',
          message:
            error instanceof Error ? error.message : 'Failed to save account',
        },
      }
    }
  }

  async deleteAccount(
    id: string
  ): Promise<
    Result<void, { type: 'NotFoundError' | 'StorageError'; message: string }>
  > {
    try {
      const accountsResult = await this.getAccounts()
      if (!accountsResult.success) {
        return {
          success: false,
          error: {
            type: 'StorageError',
            message: 'Failed to retrieve accounts',
          },
        }
      }

      const accounts = accountsResult.data
      const existingIndex = accounts.findIndex((a) => a.id === id)

      if (existingIndex === -1) {
        return {
          success: false,
          error: {
            type: 'NotFoundError',
            message: 'Account not found',
          },
        }
      }

      accounts.splice(existingIndex, 1)
      this.setContainer(STORAGE_KEYS.ACCOUNTS, accounts)

      return { success: true, data: undefined }
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'StorageError',
          message:
            error instanceof Error ? error.message : 'Failed to delete account',
        },
      }
    }
  }

  /**
   * Transaction Operations
   */

  async getTransactions(): Promise<
    Result<Transaction[], { type: 'StorageError'; message: string }>
  > {
    try {
      const container = this.getContainer<Transaction>(
        STORAGE_KEYS.TRANSACTIONS
      )
      return { success: true, data: container.data }
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'StorageError',
          message:
            error instanceof Error
              ? error.message
              : 'Failed to retrieve transactions',
        },
      }
    }
  }

  async getTransaction(
    id: string
  ): Promise<Result<Transaction, { type: 'NotFoundError'; message: string }>> {
    const transactionsResult = await this.getTransactions()
    if (!transactionsResult.success) {
      return {
        success: false,
        error: {
          type: 'NotFoundError',
          message: 'Transaction not found',
        },
      }
    }

    const transaction = transactionsResult.data.find((t) => t.id === id)
    if (!transaction) {
      return {
        success: false,
        error: {
          type: 'NotFoundError',
          message: 'Transaction not found',
        },
      }
    }

    return { success: true, data: transaction }
  }

  async saveTransaction(
    transaction: Transaction
  ): Promise<
    Result<
      Transaction,
      { type: 'ValidationError' | 'StorageError'; message: string }
    >
  > {
    // Validate transaction
    const validationError = this.validateTransaction(transaction)
    if (validationError) {
      return {
        success: false,
        error: {
          type: 'ValidationError',
          message: validationError,
        },
      }
    }

    try {
      const transactionsResult = await this.getTransactions()
      const transactions = transactionsResult.success
        ? transactionsResult.data
        : []

      // Update or add transaction
      const existingIndex = transactions.findIndex(
        (t) => t.id === transaction.id
      )
      if (existingIndex >= 0) {
        transactions[existingIndex] = transaction
      } else {
        transactions.push(transaction)
      }

      this.setContainer(STORAGE_KEYS.TRANSACTIONS, transactions)

      return { success: true, data: transaction }
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'StorageError',
          message:
            error instanceof Error
              ? error.message
              : 'Failed to save transaction',
        },
      }
    }
  }

  async deleteTransaction(
    id: string
  ): Promise<
    Result<void, { type: 'NotFoundError' | 'StorageError'; message: string }>
  > {
    try {
      const transactionsResult = await this.getTransactions()
      if (!transactionsResult.success) {
        return {
          success: false,
          error: {
            type: 'StorageError',
            message: 'Failed to retrieve transactions',
          },
        }
      }

      const transactions = transactionsResult.data
      const existingIndex = transactions.findIndex((t) => t.id === id)

      if (existingIndex === -1) {
        return {
          success: false,
          error: {
            type: 'NotFoundError',
            message: 'Transaction not found',
          },
        }
      }

      transactions.splice(existingIndex, 1)
      this.setContainer(STORAGE_KEYS.TRANSACTIONS, transactions)

      return { success: true, data: undefined }
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'StorageError',
          message:
            error instanceof Error
              ? error.message
              : 'Failed to delete transaction',
        },
      }
    }
  }

  /**
   * Recurring Transaction Operations
   */

  async getRecurringTransactions(): Promise<
    Result<RecurringTransaction[], { type: 'StorageError'; message: string }>
  > {
    try {
      const container = this.getContainer<RecurringTransaction>(
        STORAGE_KEYS.RECURRING
      )
      return { success: true, data: container.data }
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'StorageError',
          message:
            error instanceof Error
              ? error.message
              : 'Failed to retrieve recurring transactions',
        },
      }
    }
  }

  async getRecurringTransaction(
    id: string
  ): Promise<
    Result<RecurringTransaction, { type: 'NotFoundError'; message: string }>
  > {
    const recurringResult = await this.getRecurringTransactions()
    if (!recurringResult.success) {
      return {
        success: false,
        error: {
          type: 'NotFoundError',
          message: 'Recurring transaction not found',
        },
      }
    }

    const recurring = recurringResult.data.find((r) => r.id === id)
    if (!recurring) {
      return {
        success: false,
        error: {
          type: 'NotFoundError',
          message: 'Recurring transaction not found',
        },
      }
    }

    return { success: true, data: recurring }
  }

  async saveRecurringTransaction(
    recurring: RecurringTransaction
  ): Promise<
    Result<
      RecurringTransaction,
      { type: 'ValidationError' | 'StorageError'; message: string }
    >
  > {
    // Validate recurring transaction
    const validationError = this.validateRecurringTransaction(recurring)
    if (validationError) {
      return {
        success: false,
        error: {
          type: 'ValidationError',
          message: validationError,
        },
      }
    }

    try {
      const recurringResult = await this.getRecurringTransactions()
      const recurrings = recurringResult.success ? recurringResult.data : []

      // Update or add recurring transaction
      const existingIndex = recurrings.findIndex((r) => r.id === recurring.id)
      if (existingIndex >= 0) {
        recurrings[existingIndex] = recurring
      } else {
        recurrings.push(recurring)
      }

      this.setContainer(STORAGE_KEYS.RECURRING, recurrings)

      return { success: true, data: recurring }
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'StorageError',
          message:
            error instanceof Error
              ? error.message
              : 'Failed to save recurring transaction',
        },
      }
    }
  }

  async deleteRecurringTransaction(
    id: string
  ): Promise<
    Result<void, { type: 'NotFoundError' | 'StorageError'; message: string }>
  > {
    try {
      const recurringResult = await this.getRecurringTransactions()
      if (!recurringResult.success) {
        return {
          success: false,
          error: {
            type: 'StorageError',
            message: 'Failed to retrieve recurring transactions',
          },
        }
      }

      const recurrings = recurringResult.data
      const existingIndex = recurrings.findIndex((r) => r.id === id)

      if (existingIndex === -1) {
        return {
          success: false,
          error: {
            type: 'NotFoundError',
            message: 'Recurring transaction not found',
          },
        }
      }

      recurrings.splice(existingIndex, 1)
      this.setContainer(STORAGE_KEYS.RECURRING, recurrings)

      return { success: true, data: undefined }
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'StorageError',
          message:
            error instanceof Error
              ? error.message
              : 'Failed to delete recurring transaction',
        },
      }
    }
  }

  /**
   * Net Worth Snapshot Operations
   */

  async getNetWorthSnapshots(): Promise<
    Result<NetWorthSnapshot[], { type: 'StorageError'; message: string }>
  > {
    try {
      const container = this.getContainer<NetWorthSnapshot>(
        STORAGE_KEYS.NET_WORTH
      )
      // Sort by date descending
      const sorted = [...container.data].sort((a, b) =>
        b.date.localeCompare(a.date)
      )
      return { success: true, data: sorted }
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'StorageError',
          message:
            error instanceof Error
              ? error.message
              : 'Failed to retrieve snapshots',
        },
      }
    }
  }

  async saveNetWorthSnapshot(
    snapshot: NetWorthSnapshot
  ): Promise<
    Result<
      NetWorthSnapshot,
      { type: 'ValidationError' | 'StorageError'; message: string }
    >
  > {
    // Validate snapshot
    const validationError = this.validateNetWorthSnapshot(snapshot)
    if (validationError) {
      return {
        success: false,
        error: {
          type: 'ValidationError',
          message: validationError,
        },
      }
    }

    try {
      const snapshotsResult = await this.getNetWorthSnapshots()
      const snapshots = snapshotsResult.success ? snapshotsResult.data : []

      // Update or add snapshot (keyed by id)
      const existingIndex = snapshots.findIndex((s) => s.id === snapshot.id)
      if (existingIndex >= 0) {
        snapshots[existingIndex] = snapshot
      } else {
        snapshots.push(snapshot)
      }

      this.setContainer(STORAGE_KEYS.NET_WORTH, snapshots)

      return { success: true, data: snapshot }
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'StorageError',
          message:
            error instanceof Error ? error.message : 'Failed to save snapshot',
        },
      }
    }
  }

  /**
   * Bulk Operations
   */

  async exportData(): Promise<
    Result<ExportData, { type: 'StorageError'; message: string }>
  > {
    try {
      const accountsResult = await this.getAccounts()
      const transactionsResult = await this.getTransactions()
      const recurringResult = await this.getRecurringTransactions()
      const snapshotsResult = await this.getNetWorthSnapshots()

      const exportData: ExportData = {
        version: this.version,
        exportedAt: new Date().toISOString(),
        accounts: accountsResult.success ? accountsResult.data : [],
        transactions: transactionsResult.success ? transactionsResult.data : [],
        recurring: recurringResult.success ? recurringResult.data : [],
        netWorthSnapshots: snapshotsResult.success ? snapshotsResult.data : [],
      }

      return { success: true, data: exportData }
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'StorageError',
          message:
            error instanceof Error ? error.message : 'Failed to export data',
        },
      }
    }
  }

  async importData(
    data: ExportData
  ): Promise<
    Result<void, { type: 'ValidationError' | 'StorageError'; message: string }>
  > {
    try {
      // Validate import data structure
      if (
        !data.version ||
        !data.accounts ||
        !data.transactions ||
        !data.recurring ||
        !data.netWorthSnapshots
      ) {
        return {
          success: false,
          error: {
            type: 'ValidationError',
            message: 'Invalid import data structure',
          },
        }
      }

      // Validate each account
      for (const account of data.accounts) {
        const error = this.validateAccount(account)
        if (error) {
          return {
            success: false,
            error: {
              type: 'ValidationError',
              message: `Invalid account data: ${error}`,
            },
          }
        }
      }

      // Validate each transaction
      for (const transaction of data.transactions) {
        const error = this.validateTransaction(transaction)
        if (error) {
          return {
            success: false,
            error: {
              type: 'ValidationError',
              message: `Invalid transaction data: ${error}`,
            },
          }
        }
      }

      // Validate each recurring transaction
      for (const recurring of data.recurring) {
        const error = this.validateRecurringTransaction(recurring)
        if (error) {
          return {
            success: false,
            error: {
              type: 'ValidationError',
              message: `Invalid recurring transaction data: ${error}`,
            },
          }
        }
      }

      // Validate each snapshot
      for (const snapshot of data.netWorthSnapshots) {
        const error = this.validateNetWorthSnapshot(snapshot)
        if (error) {
          return {
            success: false,
            error: {
              type: 'ValidationError',
              message: `Invalid snapshot data: ${error}`,
            },
          }
        }
      }

      // Clear existing data and import new data
      await this.clearAllData()

      this.setContainer(STORAGE_KEYS.ACCOUNTS, data.accounts)
      this.setContainer(STORAGE_KEYS.TRANSACTIONS, data.transactions)
      this.setContainer(STORAGE_KEYS.RECURRING, data.recurring)
      this.setContainer(STORAGE_KEYS.NET_WORTH, data.netWorthSnapshots)

      return { success: true, data: undefined }
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'StorageError',
          message:
            error instanceof Error ? error.message : 'Failed to import data',
        },
      }
    }
  }

  async clearAllData(): Promise<
    Result<void, { type: 'StorageError'; message: string }>
  > {
    try {
      localStorage.removeItem(STORAGE_KEYS.ACCOUNTS)
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS)
      localStorage.removeItem(STORAGE_KEYS.RECURRING)
      localStorage.removeItem(STORAGE_KEYS.NET_WORTH)

      return { success: true, data: undefined }
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'StorageError',
          message:
            error instanceof Error ? error.message : 'Failed to clear data',
        },
      }
    }
  }

  /**
   * Private Helper Methods
   */

  private getContainer<T>(key: string): StorageContainer<T> {
    try {
      const item = localStorage.getItem(key)
      if (!item) {
        return {
          version: this.version,
          data: [],
        }
      }

      const parsed = JSON.parse(item)
      return {
        version: parsed.version || this.version,
        data: parsed.data || [],
      }
    } catch (error) {
      throw new Error(
        `Failed to parse storage data: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  private setContainer<T>(key: string, data: T[]): void {
    try {
      const container: StorageContainer<T> = {
        version: this.version,
        data,
      }
      localStorage.setItem(key, JSON.stringify(container))
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('QuotaExceededError')
      ) {
        throw new Error('Storage quota exceeded. Please free up space.')
      }
      throw new Error(
        `Failed to save to storage: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  private validateAccount(account: Account): string | null {
    if (!isValidUUID(account.id)) {
      return 'Invalid account ID'
    }
    if (
      !account.name ||
      account.name.length === 0 ||
      account.name.length > 100
    ) {
      return 'Account name must be 1-100 characters'
    }
    if (!isValidAccountType(account.type)) {
      return 'Invalid account type'
    }
    if (!isValidAmount(account.balance, { allowNegative: true })) {
      return 'Invalid account balance'
    }
    if (!isValidAccountStatus(account.status)) {
      return 'Invalid account status'
    }
    if (!isValidDateString(account.createdAt)) {
      return 'Invalid createdAt date'
    }
    if (!isValidDateString(account.updatedAt)) {
      return 'Invalid updatedAt date'
    }
    return null
  }

  private validateTransaction(transaction: Transaction): string | null {
    if (!isValidUUID(transaction.id)) {
      return 'Invalid transaction ID'
    }
    if (!isValidUUID(transaction.fromAccountId)) {
      return 'Invalid fromAccountId'
    }
    if (!isValidUUID(transaction.toAccountId)) {
      return 'Invalid toAccountId'
    }
    if (!isValidAmount(transaction.amount, { allowZero: false })) {
      return 'Invalid transaction amount'
    }
    if (!transaction.description || transaction.description.length === 0) {
      return 'Transaction description is required'
    }
    if (!isValidDateString(transaction.date)) {
      return 'Invalid transaction date'
    }
    if (!isValidDateString(transaction.createdAt)) {
      return 'Invalid createdAt date'
    }
    return null
  }

  private validateRecurringTransaction(
    recurring: RecurringTransaction
  ): string | null {
    if (!isValidUUID(recurring.id)) {
      return 'Invalid recurring transaction ID'
    }
    if (!isValidUUID(recurring.fromAccountId)) {
      return 'Invalid fromAccountId'
    }
    if (!isValidUUID(recurring.toAccountId)) {
      return 'Invalid toAccountId'
    }
    if (!isValidAmount(recurring.amount, { allowZero: false })) {
      return 'Invalid amount'
    }
    if (!recurring.description || recurring.description.length === 0) {
      return 'Description is required'
    }
    if (!isValidRecurrenceFrequency(recurring.frequency)) {
      return 'Invalid recurrence frequency'
    }
    if (!isValidRecurringStatus(recurring.status)) {
      return 'Invalid recurring status'
    }
    if (
      recurring.lastProcessedDate &&
      !isValidDateString(recurring.lastProcessedDate)
    ) {
      return 'Invalid lastProcessedDate'
    }
    if (!isValidDateString(recurring.createdAt)) {
      return 'Invalid createdAt date'
    }
    if (!isValidDateString(recurring.updatedAt)) {
      return 'Invalid updatedAt date'
    }
    return null
  }

  private validateNetWorthSnapshot(snapshot: NetWorthSnapshot): string | null {
    if (!isValidUUID(snapshot.id)) {
      return 'Invalid snapshot ID'
    }
    if (!isValidDateString(snapshot.date)) {
      return 'Invalid snapshot date'
    }
    if (!isValidAmount(snapshot.totalAssets, { allowNegative: true })) {
      return 'Invalid totalAssets'
    }
    if (!isValidAmount(snapshot.totalLiabilities, { allowNegative: true })) {
      return 'Invalid totalLiabilities'
    }
    if (!isValidAmount(snapshot.netWorth, { allowNegative: true })) {
      return 'Invalid netWorth'
    }
    if (!isValidDateString(snapshot.createdAt)) {
      return 'Invalid createdAt date'
    }
    return null
  }
}

// Export singleton instance
const storageService = new StorageService()

export const getAccounts = () => storageService.getAccounts()
export const getAccount = (id: string) => storageService.getAccount(id)
export const saveAccount = (account: Account) =>
  storageService.saveAccount(account)
export const deleteAccount = (id: string) => storageService.deleteAccount(id)
export const getTransactions = () => storageService.getTransactions()
export const getTransaction = (id: string) => storageService.getTransaction(id)
export const saveTransaction = (transaction: Transaction) =>
  storageService.saveTransaction(transaction)
export const deleteTransaction = (id: string) =>
  storageService.deleteTransaction(id)
export const getRecurringTransactions = () =>
  storageService.getRecurringTransactions()
export const getRecurringTransaction = (id: string) =>
  storageService.getRecurringTransaction(id)
export const saveRecurringTransaction = (recurring: RecurringTransaction) =>
  storageService.saveRecurringTransaction(recurring)
export const deleteRecurringTransaction = (id: string) =>
  storageService.deleteRecurringTransaction(id)
export const getNetWorthSnapshots = () => storageService.getNetWorthSnapshots()
export const saveNetWorthSnapshot = (snapshot: NetWorthSnapshot) =>
  storageService.saveNetWorthSnapshot(snapshot)
export const exportData = () => storageService.exportData()
export const importData = (data: ExportData) => storageService.importData(data)
export const clearAllData = () => storageService.clearAllData()
