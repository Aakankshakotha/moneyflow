import type {
  Result,
  ValidationError,
  NotFoundError,
  BusinessRuleError,
} from '@/types/common'
import type {
  Account,
  AccountWithBalance,
  CreateAccountDto,
  UpdateAccountDto,
  AccountFilter,
} from '@/types/account'
import type { Transaction } from '@/types/transaction'
import {
  validateCreateAccount,
  validateUpdateAccount,
} from './validationService'
import * as storageService from './storageService'

/**
 * Convert storageService NotFoundError to common NotFoundError
 */
function toNotFoundError(storageError: {
  type: string
  message: string
}): NotFoundError {
  return {
    code: 'NOT_FOUND',
    message: storageError.message,
  }
}

/**
 * Create a new account
 */
export async function createAccount(
  data: CreateAccountDto
): Promise<Result<Account, ValidationError>> {
  // Validate input
  const validationResult = validateCreateAccount(data)
  if (!validationResult.success) {
    return validationResult
  }

  // Check for duplicate name within the same type
  const accountsResult = await storageService.getAccounts()
  if (!accountsResult.success) {
    return {
      success: false,
      error: {
        field: 'unknown',
        message: 'Failed to check existing accounts',
        code: 'STORAGE_ERROR',
      },
    }
  }

  const existingAccounts = accountsResult.data
  const duplicate = existingAccounts.find(
    (acc: Account) =>
      acc.type === data.type &&
      acc.name.toLowerCase() === data.name.toLowerCase()
  )

  if (duplicate) {
    return {
      success: false,
      error: {
        field: 'name',
        message: 'Account name already exists for this type',
        code: 'DUPLICATE_NAME',
      },
    }
  }

  // Create account
  const now = new Date().toISOString()
  const account: Account = {
    id: crypto.randomUUID(),
    name: data.name.trim(),
    type: data.type,
    balance: data.balance ?? 0,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  }

  // Save to storage
  const saveResult = await storageService.saveAccount(account)
  if (!saveResult.success) {
    return {
      success: false,
      error: {
        field: 'unknown',
        message: 'Failed to save account',
        code: 'STORAGE_ERROR',
      },
    }
  }

  return { success: true, data: account }
}

/**
 * Update an existing account
 */
export async function updateAccount(
  id: string,
  data: UpdateAccountDto
): Promise<Result<Account, NotFoundError | ValidationError>> {
  // Validate input
  const validationResult = validateUpdateAccount(data)
  if (!validationResult.success) {
    return validationResult
  }

  // Get existing account
  const accountResult = await storageService.getAccount(id)
  if (!accountResult.success) {
    return {
      success: false,
      error: toNotFoundError(accountResult.error),
    }
  }

  const existingAccount = accountResult.data

  // Check for duplicate name if name is being changed
  if (data.name && data.name !== existingAccount.name) {
    const accountsResult = await storageService.getAccounts()
    if (!accountsResult.success) {
      return {
        success: false,
        error: {
          field: 'unknown',
          message: 'Failed to check existing accounts',
          code: 'STORAGE_ERROR',
        },
      }
    }

    const duplicate = accountsResult.data.find(
      (acc: Account) =>
        acc.id !== id &&
        acc.type === existingAccount.type &&
        acc.name.toLowerCase() === data.name!.toLowerCase()
    )

    if (duplicate) {
      return {
        success: false,
        error: {
          field: 'name',
          message: 'Account name already exists for this type',
          code: 'DUPLICATE_NAME',
        },
      }
    }
  }

  // Update account
  const updatedAccount: Account = {
    ...existingAccount,
    name: data.name ? data.name.trim() : existingAccount.name,
    status: data.status ?? existingAccount.status,
    updatedAt: new Date().toISOString(),
  }

  // Save to storage
  const saveResult = await storageService.saveAccount(updatedAccount)
  if (!saveResult.success) {
    return {
      success: false,
      error: {
        field: 'unknown',
        message: 'Failed to update account',
        code: 'STORAGE_ERROR',
      },
    }
  }

  return { success: true, data: updatedAccount }
}

/**
 * Delete an account
 */
export async function deleteAccount(
  id: string
): Promise<Result<void, NotFoundError | BusinessRuleError>> {
  // Get existing account
  const accountResult = await storageService.getAccount(id)
  if (!accountResult.success) {
    return {
      success: false,
      error: toNotFoundError(accountResult.error),
    }
  }

  const account = accountResult.data

  // Check if account is archived
  if (account.status !== 'archived') {
    return {
      success: false,
      error: {
        message: 'Account must be archived before deletion',
        code: 'ACCOUNT_ACTIVE',
      },
    }
  }

  // Check if account has transactions
  const transactionsResult = await storageService.getTransactions()
  if (!transactionsResult.success) {
    return {
      success: false,
      error: {
        message: 'Failed to check account transactions',
        code: 'STORAGE_ERROR',
      },
    }
  }

  const accountTransactions = transactionsResult.data.filter(
    (txn: Transaction) => txn.fromAccountId === id || txn.toAccountId === id
  )

  if (accountTransactions.length > 0) {
    return {
      success: false,
      error: {
        message: 'Cannot delete account with existing transactions',
        code: 'HAS_TRANSACTIONS',
        details: { transactionCount: accountTransactions.length },
      },
    }
  }

  // Delete account
  const deleteResult = await storageService.deleteAccount(id)
  if (!deleteResult.success) {
    return {
      success: false,
      error: {
        message: 'Failed to delete account',
        code: 'STORAGE_ERROR',
      },
    }
  }
  return deleteResult
}

/**
 * Get an account by ID
 */
export async function getAccount(
  id: string
): Promise<Result<Account, NotFoundError>> {
  const result = await storageService.getAccount(id)
  if (!result.success) {
    return {
      success: false,
      error: toNotFoundError(result.error),
    }
  }
  return result
}

/**
 * List accounts with optional filtering
 */
export async function listAccounts(
  filter?: AccountFilter
): Promise<Result<Account[], never>> {
  const accountsResult = await storageService.getAccounts()
  if (!accountsResult.success) {
    return { success: true, data: [] }
  }

  let accounts = accountsResult.data

  // Apply filters
  if (filter) {
    if (filter.type) {
      accounts = accounts.filter((acc: Account) => acc.type === filter.type)
    }

    if (filter.status) {
      accounts = accounts.filter((acc: Account) => acc.status === filter.status)
    }

    if (filter.searchTerm) {
      const searchLower = filter.searchTerm.toLowerCase()
      accounts = accounts.filter((acc: Account) =>
        acc.name.toLowerCase().includes(searchLower)
      )
    }
  }

  return { success: true, data: accounts }
}

/**
 * Get an account with balance and transaction count
 */
export async function getAccountWithBalance(
  id: string
): Promise<Result<AccountWithBalance, NotFoundError>> {
  // Get account
  const accountResult = await storageService.getAccount(id)
  if (!accountResult.success) {
    return {
      success: false,
      error: toNotFoundError(accountResult.error),
    }
  }

  const account = accountResult.data

  // Get transaction count
  const transactionsResult = await storageService.getTransactions()
  const transactionCount = transactionsResult.success
    ? transactionsResult.data.filter(
        (txn: Transaction) => txn.fromAccountId === id || txn.toAccountId === id
      ).length
    : 0

  const accountWithBalance: AccountWithBalance = {
    ...account,
    transactionCount,
  }

  return { success: true, data: accountWithBalance }
}
