import * as storageService from './storageService'
import * as transactionService from './transactionService'
import type {
  RecurringTransaction,
  CreateRecurringDto,
  UpdateRecurringDto,
  ProcessRecurringResult,
  RecurringProcessingStatus,
  RecurringStatus,
} from '../types/recurring'
import type {
  Result,
  ValidationError,
  NotFoundError,
  BusinessRuleError,
} from '../types/common'

/**
 * Validates a recurring transaction DTO
 */
function validateRecurringDto(
  dto: CreateRecurringDto | UpdateRecurringDto
): ValidationError[] {
  const errors: ValidationError[] = []

  if ('amount' in dto && dto.amount !== undefined) {
    if (dto.amount <= 0) {
      errors.push({
        field: 'amount',
        message: 'Amount must be greater than zero',
        code: 'INVALID_AMOUNT',
      })
    }
  }

  if ('description' in dto && dto.description !== undefined) {
    if (dto.description.trim().length === 0) {
      errors.push({
        field: 'description',
        message: 'Description cannot be empty',
        code: 'INVALID_DESCRIPTION',
      })
    }
  }

  return errors
}

/**
 * Validates a date string in YYYY-MM-DD format
 */
function isValidDateString(dateStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateStr)) return false

  const date = new Date(dateStr)
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * Calculate the next process date based on frequency
 */
function calculateNextProcessDate(
  lastProcessedDate: string | undefined,
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
): string | undefined {
  if (!lastProcessedDate) return undefined

  const date = new Date(lastProcessedDate)

  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1)
      break
    case 'weekly':
      date.setDate(date.getDate() + 7)
      break
    case 'monthly':
      date.setMonth(date.getMonth() + 1)
      break
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1)
      break
  }

  return date.toISOString().split('T')[0]
}

/**
 * Check if a recurring transaction should be processed
 */
function shouldProcess(
  recurring: RecurringTransaction,
  currentDate: string
): boolean {
  if (!recurring.lastProcessedDate) return true

  const lastDate = new Date(recurring.lastProcessedDate)
  const current = new Date(currentDate)
  const daysDiff = Math.floor(
    (current.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  switch (recurring.frequency) {
    case 'daily':
      return daysDiff >= 1
    case 'weekly':
      return daysDiff >= 7
    case 'monthly':
      return daysDiff >= 28 // Conservative estimate
    case 'yearly':
      return daysDiff >= 365
  }
}

/**
 * Create a new recurring transaction
 */
export async function createRecurring(
  dto: CreateRecurringDto
): Promise<Result<RecurringTransaction, ValidationError | BusinessRuleError>> {
  // Validate DTO
  const validationErrors = validateRecurringDto(dto)
  if (validationErrors.length > 0) {
    return { success: false, error: validationErrors[0] }
  }

  // Business rule: cannot transfer to the same account
  if (dto.fromAccountId === dto.toAccountId) {
    return {
      success: false,
      error: {
        message: 'Cannot create recurring transaction to the same account',
        code: 'SAME_ACCOUNT',
      },
    }
  }

  // Create new recurring transaction
  const now = new Date().toISOString()
  const recurring: RecurringTransaction = {
    id: crypto.randomUUID(),
    fromAccountId: dto.fromAccountId,
    toAccountId: dto.toAccountId,
    amount: dto.amount,
    description: dto.description,
    frequency: dto.frequency,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  }

  // Save to storage
  await storageService.saveRecurringTransaction(recurring)

  return { success: true, data: recurring }
}

/**
 * List all recurring transactions with optional filters
 */
export async function listRecurring(filters?: {
  status?: RecurringStatus
}): Promise<Result<RecurringTransaction[], never>> {
  const result = await storageService.getRecurringTransactions()
  if (!result.success) {
    return { success: true, data: [] }
  }

  let recurring = result.data

  // Apply status filter
  if (filters?.status) {
    recurring = recurring.filter(
      (r: RecurringTransaction) => r.status === filters.status
    )
  }

  return { success: true, data: recurring }
}

/**
 * Get a recurring transaction by ID
 */
export async function getRecurring(
  id: string
): Promise<Result<RecurringTransaction, NotFoundError>> {
  const result = await storageService.getRecurringTransactions()
  if (!result.success) {
    return {
      success: false,
      error: {
        message: 'Failed to load recurring transactions',
        code: 'NOT_FOUND',
      },
    }
  }

  const found = result.data.find((r: RecurringTransaction) => r.id === id)

  if (!found) {
    return {
      success: false,
      error: {
        message: `Recurring transaction with ID ${id} not found`,
        code: 'NOT_FOUND',
      },
    }
  }

  return { success: true, data: found }
}

/**
 * Update a recurring transaction
 */
export async function updateRecurring(
  id: string,
  updates: UpdateRecurringDto
): Promise<Result<RecurringTransaction, ValidationError | NotFoundError>> {
  // Validate updates
  const validationErrors = validateRecurringDto(updates)
  if (validationErrors.length > 0) {
    return { success: false, error: validationErrors[0] }
  }

  // Get existing recurring transaction
  const getResult = await getRecurring(id)
  if (!getResult.success) {
    return getResult
  }

  // Update recurring transaction
  const updated: RecurringTransaction = {
    ...getResult.data,
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  await storageService.saveRecurringTransaction(updated)

  return { success: true, data: updated }
}

/**
 * Delete a recurring transaction
 */
export async function deleteRecurring(
  id: string
): Promise<Result<void, NotFoundError>> {
  // Check if recurring transaction exists
  const getResult = await getRecurring(id)
  if (!getResult.success) {
    return getResult
  }

  const deleteResult = await storageService.deleteRecurringTransaction(id)
  if (!deleteResult.success) {
    return {
      success: false,
      error: {
        message: 'Failed to delete recurring transaction',
        code: 'NOT_FOUND',
      },
    }
  }

  return { success: true, data: undefined }
}

/**
 * Process a recurring transaction (create an actual transaction)
 */
export async function processRecurring(
  id: string,
  processDate: string
): Promise<
  Result<
    ProcessRecurringResult,
    ValidationError | NotFoundError | BusinessRuleError
  >
> {
  // Validate process date
  if (!isValidDateString(processDate)) {
    return {
      success: false,
      error: {
        field: 'processDate',
        message: 'Process date must be in YYYY-MM-DD format',
        code: 'INVALID_DATE',
      },
    }
  }

  // Get recurring transaction
  const recurringResult = await getRecurring(id)
  if (!recurringResult.success) {
    return recurringResult
  }

  const recurring = recurringResult.data

  // Check if recurring transaction is active
  if (recurring.status !== 'active') {
    return {
      success: false,
      error: {
        message: 'Cannot process paused recurring transaction',
        code: 'RECURRING_PAUSED',
      },
    }
  }

  // Create the transaction
  const transactionResult = await transactionService.recordTransaction({
    fromAccountId: recurring.fromAccountId,
    toAccountId: recurring.toAccountId,
    amount: recurring.amount,
    description: `${recurring.description} (Recurring)`,
    date: processDate,
  })

  if (!transactionResult.success) {
    return transactionResult
  }

  // Update last processed date with proper type
  const updateData: UpdateRecurringDto & { lastProcessedDate?: string } = {
    lastProcessedDate: processDate,
  }
  const updateResult = await updateRecurring(id, updateData)

  if (!updateResult.success) {
    return updateResult
  }

  return {
    success: true,
    data: {
      transactionId: transactionResult.data.id,
      processedDate: processDate,
      recurringTransactionId: id,
    },
  }
}

/**
 * Check if a recurring transaction should be processed
 */
export async function shouldProcessRecurring(
  id: string,
  currentDate: string
): Promise<Result<RecurringProcessingStatus, ValidationError | NotFoundError>> {
  // Validate current date
  if (!isValidDateString(currentDate)) {
    return {
      success: false,
      error: {
        field: 'currentDate',
        message: 'Current date must be in YYYY-MM-DD format',
        code: 'INVALID_DATE',
      },
    }
  }

  // Get recurring transaction
  const recurringResult = await getRecurring(id)
  if (!recurringResult.success) {
    return recurringResult
  }

  const recurring = recurringResult.data

  // Check if processing is needed
  const needsProcessing =
    recurring.status === 'active' && shouldProcess(recurring, currentDate)

  const nextProcessDate = calculateNextProcessDate(
    recurring.lastProcessedDate,
    recurring.frequency
  )

  let daysSinceLastProcess: number | undefined
  if (recurring.lastProcessedDate) {
    const lastDate = new Date(recurring.lastProcessedDate)
    const current = new Date(currentDate)
    daysSinceLastProcess = Math.floor(
      (current.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    )
  }

  return {
    success: true,
    data: {
      recurringTransaction: recurring,
      needsProcessing,
      nextProcessDate,
      daysSinceLastProcess,
    },
  }
}
