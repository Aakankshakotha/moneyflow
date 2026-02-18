import type {
  Result,
  ValidationError,
  NotFoundError,
  BusinessRuleError,
  StorageError,
} from '@/types/common'
import type {
  Transaction,
  CreateTransactionDto,
  TransactionFilter,
} from '@/types/transaction'
import { validateCreateTransaction } from './validationService'
import * as storageService from './storageService'
import * as accountService from './accountService'

/**
 * Record a new transaction
 * Creates transaction and updates both account balances
 */
export async function recordTransaction(
  data: CreateTransactionDto
): Promise<
  Result<Transaction, ValidationError | NotFoundError | BusinessRuleError>
> {
  // Validate input
  const validationResult = validateCreateTransaction(data)
  if (!validationResult.success) {
    return validationResult
  }

  // Get both accounts
  const fromAccountResult = await accountService.getAccount(data.fromAccountId)
  if (!fromAccountResult.success) {
    return {
      success: false,
      error: {
        field: 'fromAccountId',
        message: 'Source account not found',
        code: 'NOT_FOUND',
      },
    }
  }

  const toAccountResult = await accountService.getAccount(data.toAccountId)
  if (!toAccountResult.success) {
    return {
      success: false,
      error: {
        field: 'toAccountId',
        message: 'Destination account not found',
        code: 'NOT_FOUND',
      },
    }
  }

  const fromAccount = fromAccountResult.data
  const toAccount = toAccountResult.data

  // Check if from account has sufficient balance
  if (fromAccount.balance < data.amount) {
    return {
      success: false,
      error: {
        message: 'Insufficient balance in source account',
        code: 'INSUFFICIENT_BALANCE',
      },
    }
  }

  // Create transaction
  const transaction: Transaction = {
    id: crypto.randomUUID(),
    fromAccountId: data.fromAccountId,
    toAccountId: data.toAccountId,
    amount: data.amount,
    description: data.description,
    date: data.date,
    category: data.category,
    tags: data.tags,
    createdAt: new Date().toISOString(),
  }

  // Update account balances directly
  const updatedFromAccount = {
    ...fromAccount,
    balance: fromAccount.balance - data.amount,
    updatedAt: new Date().toISOString(),
  }

  const fromUpdateResult = await storageService.saveAccount(updatedFromAccount)

  if (!fromUpdateResult.success) {
    return {
      success: false,
      error: {
        message: 'Failed to update source account balance',
        code: 'UPDATE_FAILED',
      },
    }
  }

  const updatedToAccount = {
    ...toAccount,
    balance: toAccount.balance + data.amount,
    updatedAt: new Date().toISOString(),
  }

  const toUpdateResult = await storageService.saveAccount(updatedToAccount)

  if (!toUpdateResult.success) {
    // Rollback from account update
    await storageService.saveAccount(fromAccount)

    return {
      success: false,
      error: {
        message: 'Failed to update destination account balance',
        code: 'UPDATE_FAILED',
      },
    }
  }

  // Save transaction
  const saveResult = await storageService.saveTransaction(transaction)

  if (!saveResult.success) {
    // Rollback account updates
    await storageService.saveAccount(fromAccount)
    await storageService.saveAccount(toAccount)

    return {
      success: false,
      error: {
        message: 'Failed to save transaction',
        code: 'STORAGE_ERROR',
      },
    }
  }

  return {
    success: true,
    data: transaction,
  }
}

/**
 * List transactions with optional filtering
 */
export async function listTransactions(
  filter?: TransactionFilter
): Promise<Result<Transaction[], StorageError>> {
  const transactionsResult = await storageService.getTransactions()

  if (!transactionsResult.success) {
    return {
      success: false,
      error: {
        code: 'STORAGE_ERROR',
        message: 'Failed to load transactions',
        details: transactionsResult.error.message,
      },
    }
  }

  let transactions = transactionsResult.data

  // Apply filters
  if (filter) {
    if (filter.accountId) {
      transactions = transactions.filter(
        (txn) =>
          txn.fromAccountId === filter.accountId ||
          txn.toAccountId === filter.accountId
      )
    }

    if (filter.fromAccountId) {
      transactions = transactions.filter(
        (txn) => txn.fromAccountId === filter.fromAccountId
      )
    }

    if (filter.toAccountId) {
      transactions = transactions.filter(
        (txn) => txn.toAccountId === filter.toAccountId
      )
    }

    if (filter.startDate) {
      transactions = transactions.filter((txn) => txn.date >= filter.startDate!)
    }

    if (filter.endDate) {
      transactions = transactions.filter((txn) => txn.date <= filter.endDate!)
    }

    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase()
      transactions = transactions.filter((txn) =>
        txn.description.toLowerCase().includes(term)
      )
    }
  }

  // Sort by date descending (most recent first)
  const sorted = [...transactions].sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date)
    if (dateCompare !== 0) return dateCompare
    return b.createdAt.localeCompare(a.createdAt)
  })

  return {
    success: true,
    data: sorted,
  }
}

/**
 * Get a single transaction by ID
 */
export async function getTransaction(
  id: string
): Promise<Result<Transaction, NotFoundError | StorageError>> {
  const result = await storageService.getTransaction(id)

  if (!result.success) {
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: result.error.message,
      },
    }
  }

  return result
}

/**
 * Delete a transaction and reverse balance changes
 */
export async function deleteTransaction(
  id: string
): Promise<Result<void, NotFoundError | BusinessRuleError>> {
  // Get transaction
  const transactionResult = await storageService.getTransaction(id)

  if (!transactionResult.success) {
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Transaction not found',
      },
    }
  }

  const transaction = transactionResult.data

  // Get both accounts
  const fromAccountResult = await accountService.getAccount(
    transaction.fromAccountId
  )
  const toAccountResult = await accountService.getAccount(
    transaction.toAccountId
  )

  // Reverse balance changes if accounts still exist
  if (fromAccountResult.success) {
    const updatedFromAccount = {
      ...fromAccountResult.data,
      balance: fromAccountResult.data.balance + transaction.amount,
      updatedAt: new Date().toISOString(),
    }
    await storageService.saveAccount(updatedFromAccount)
  }

  if (toAccountResult.success) {
    const updatedToAccount = {
      ...toAccountResult.data,
      balance: toAccountResult.data.balance - transaction.amount,
      updatedAt: new Date().toISOString(),
    }
    await storageService.saveAccount(updatedToAccount)
  }

  // Delete transaction
  const deleteResult = await storageService.deleteTransaction(id)

  if (!deleteResult.success) {
    return {
      success: false,
      error: {
        message: 'Failed to delete transaction',
        code: 'DELETE_FAILED',
      },
    }
  }

  return {
    success: true,
    data: undefined,
  }
}
