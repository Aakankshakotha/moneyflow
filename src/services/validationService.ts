import type { Result, ValidationError } from '@/types/common'
import type {
  AccountType,
  AccountStatus,
  CreateAccountDto,
  UpdateAccountDto,
} from '@/types/account'
import type {
  CreateTransactionDto,
  UpdateTransactionDto,
} from '@/types/transaction'
import type {
  RecurrenceFrequency,
  RecurringStatus,
  CreateRecurringDto,
  UpdateRecurringDto,
} from '@/types/recurring'
import {
  isValidUUID,
  isValidAmount,
  isValidDateString,
} from '@/utils/validationUtils'
import { parseISO, isBefore, isAfter } from 'date-fns'

/**
 * Valid account types
 */
const VALID_ACCOUNT_TYPES: AccountType[] = [
  'asset',
  'liability',
  'income',
  'expense',
]

/**
 * Valid account statuses
 */
const VALID_ACCOUNT_STATUSES: AccountStatus[] = ['active', 'archived']

/**
 * Valid recurrence frequencies
 */
const VALID_FREQUENCIES: RecurrenceFrequency[] = [
  'daily',
  'weekly',
  'monthly',
  'yearly',
]

/**
 * Valid recurring statuses
 */
const VALID_RECURRING_STATUSES: RecurringStatus[] = ['active', 'paused']

/**
 * Maximum field lengths
 */
const MAX_NAME_LENGTH = 100
const MAX_DESCRIPTION_LENGTH = 500

/**
 * Create a validation error
 */
function createValidationError(
  field: string,
  message: string,
  code: string
): ValidationError {
  return { field, message, code }
}

/**
 * Validate account creation data
 */
export function validateCreateAccount(
  data: CreateAccountDto
): Result<CreateAccountDto, ValidationError> {
  // Validate name
  if (!data.name || data.name.trim() === '') {
    return {
      success: false,
      error: createValidationError(
        'name',
        'Name is required',
        'REQUIRED_FIELD'
      ),
    }
  }

  if (data.name.length > MAX_NAME_LENGTH) {
    return {
      success: false,
      error: createValidationError(
        'name',
        `Name must be ${MAX_NAME_LENGTH} characters or less`,
        'MAX_LENGTH'
      ),
    }
  }

  // Validate type
  if (!VALID_ACCOUNT_TYPES.includes(data.type)) {
    return {
      success: false,
      error: createValidationError(
        'type',
        `Type must be one of: ${VALID_ACCOUNT_TYPES.join(', ')}`,
        'INVALID_TYPE'
      ),
    }
  }

  // Validate parentAccountId if provided
  if (data.parentAccountId !== undefined && data.parentAccountId !== null) {
    if (!isValidUUID(data.parentAccountId)) {
      return {
        success: false,
        error: createValidationError(
          'parentAccountId',
          'Parent account ID must be a valid UUID',
          'INVALID_UUID'
        ),
      }
    }
  }

  // Validate balance if provided
  if (data.balance !== undefined) {
    if (
      !isValidAmount(data.balance, { allowNegative: true, allowZero: true })
    ) {
      return {
        success: false,
        error: createValidationError(
          'balance',
          'Balance must be a valid integer amount in cents',
          'INVALID_AMOUNT'
        ),
      }
    }
  }

  // Validate parentAccountId if provided
  if (data.parentAccountId !== undefined && data.parentAccountId !== null) {
    if (!isValidUUID(data.parentAccountId)) {
      return {
        success: false,
        error: createValidationError(
          'parentAccountId',
          'Parent account ID must be a valid UUID',
          'INVALID_UUID'
        ),
      }
    }
  }

  return { success: true, data }
}

/**
 * Validate account update data
 */
export function validateUpdateAccount(
  data: UpdateAccountDto
): Result<UpdateAccountDto, ValidationError> {
  // Validate name if provided
  if (data.name !== undefined) {
    if (data.name.trim() === '') {
      return {
        success: false,
        error: createValidationError(
          'name',
          'Name cannot be empty',
          'REQUIRED_FIELD'
        ),
      }
    }

    if (data.name.length > MAX_NAME_LENGTH) {
      return {
        success: false,
        error: createValidationError(
          'name',
          `Name must be ${MAX_NAME_LENGTH} characters or less`,
          'MAX_LENGTH'
        ),
      }
    }
  }

  // Validate status if provided
  if (
    data.status !== undefined &&
    !VALID_ACCOUNT_STATUSES.includes(data.status)
  ) {
    return {
      success: false,
      error: createValidationError(
        'status',
        `Status must be one of: ${VALID_ACCOUNT_STATUSES.join(', ')}`,
        'INVALID_STATUS'
      ),
    }
  }

  // Validate balance if provided
  if (data.balance !== undefined) {
    if (
      !isValidAmount(data.balance, { allowNegative: true, allowZero: true })
    ) {
      return {
        success: false,
        error: createValidationError(
          'balance',
          'Balance must be a valid integer amount in cents',
          'INVALID_AMOUNT'
        ),
      }
    }
  }

  return { success: true, data }
}

/**
 * Validate transaction creation data
 */
export function validateCreateTransaction(
  data: CreateTransactionDto
): Result<CreateTransactionDto, ValidationError> {
  // Validate fromAccountId
  if (!isValidUUID(data.fromAccountId)) {
    return {
      success: false,
      error: createValidationError(
        'fromAccountId',
        'From account ID must be a valid UUID',
        'INVALID_UUID'
      ),
    }
  }

  // Validate toAccountId
  if (!isValidUUID(data.toAccountId)) {
    return {
      success: false,
      error: createValidationError(
        'toAccountId',
        'To account ID must be a valid UUID',
        'INVALID_UUID'
      ),
    }
  }

  // Ensure accounts are different
  if (data.fromAccountId === data.toAccountId) {
    return {
      success: false,
      error: createValidationError(
        'toAccountId',
        'From and To accounts must be different',
        'SAME_ACCOUNT'
      ),
    }
  }

  // Validate amount (must be positive, non-zero)
  if (!isValidAmount(data.amount, { allowNegative: false, allowZero: false })) {
    return {
      success: false,
      error: createValidationError(
        'amount',
        'Amount must be a positive integer in cents',
        'INVALID_AMOUNT'
      ),
    }
  }

  // Validate description
  if (!data.description || data.description.trim() === '') {
    return {
      success: false,
      error: createValidationError(
        'description',
        'Description is required',
        'REQUIRED_FIELD'
      ),
    }
  }

  if (data.description.length > MAX_DESCRIPTION_LENGTH) {
    return {
      success: false,
      error: createValidationError(
        'description',
        `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`,
        'MAX_LENGTH'
      ),
    }
  }

  // Validate date
  if (!isValidDateString(data.date)) {
    return {
      success: false,
      error: createValidationError(
        'date',
        'Date must be in YYYY-MM-DD format',
        'INVALID_DATE'
      ),
    }
  }

  // Ensure date is not in the future
  const transactionDate = parseISO(data.date)
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Reset to start of day for comparison

  if (isAfter(transactionDate, today)) {
    return {
      success: false,
      error: createValidationError(
        'date',
        'Transaction date cannot be in the future',
        'FUTURE_DATE'
      ),
    }
  }

  return { success: true, data }
}

/**
 * Validate transaction update data
 */
export function validateUpdateTransaction(
  data: UpdateTransactionDto
): Result<UpdateTransactionDto, ValidationError> {
  // Validate description if provided
  if (data.description !== undefined) {
    if (data.description.trim() === '') {
      return {
        success: false,
        error: createValidationError(
          'description',
          'Description cannot be empty',
          'REQUIRED_FIELD'
        ),
      }
    }

    if (data.description.length > MAX_DESCRIPTION_LENGTH) {
      return {
        success: false,
        error: createValidationError(
          'description',
          `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`,
          'MAX_LENGTH'
        ),
      }
    }
  }

  // Validate date if provided
  if (data.date !== undefined) {
    if (!isValidDateString(data.date)) {
      return {
        success: false,
        error: createValidationError(
          'date',
          'Date must be in YYYY-MM-DD format',
          'INVALID_DATE'
        ),
      }
    }

    // Ensure date is not in the future
    const transactionDate = parseISO(data.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (isAfter(transactionDate, today)) {
      return {
        success: false,
        error: createValidationError(
          'date',
          'Transaction date cannot be in the future',
          'FUTURE_DATE'
        ),
      }
    }
  }

  return { success: true, data }
}

/**
 * Extended CreateRecurringDto with optional dates for validation
 */
interface CreateRecurringDtoWithDates extends CreateRecurringDto {
  startDate?: string
  endDate?: string
}

/**
 * Validate recurring transaction creation data
 */
export function validateCreateRecurring(
  data: CreateRecurringDtoWithDates
): Result<CreateRecurringDtoWithDates, ValidationError> {
  // Validate account IDs (same as transaction)
  if (!isValidUUID(data.fromAccountId)) {
    return {
      success: false,
      error: createValidationError(
        'fromAccountId',
        'From account ID must be a valid UUID',
        'INVALID_UUID'
      ),
    }
  }

  if (!isValidUUID(data.toAccountId)) {
    return {
      success: false,
      error: createValidationError(
        'toAccountId',
        'To account ID must be a valid UUID',
        'INVALID_UUID'
      ),
    }
  }

  if (data.fromAccountId === data.toAccountId) {
    return {
      success: false,
      error: createValidationError(
        'toAccountId',
        'From and To accounts must be different',
        'SAME_ACCOUNT'
      ),
    }
  }

  // Validate amount
  if (!isValidAmount(data.amount, { allowNegative: false, allowZero: false })) {
    return {
      success: false,
      error: createValidationError(
        'amount',
        'Amount must be a positive integer in cents',
        'INVALID_AMOUNT'
      ),
    }
  }

  // Validate description
  if (!data.description || data.description.trim() === '') {
    return {
      success: false,
      error: createValidationError(
        'description',
        'Description is required',
        'REQUIRED_FIELD'
      ),
    }
  }

  if (data.description.length > MAX_DESCRIPTION_LENGTH) {
    return {
      success: false,
      error: createValidationError(
        'description',
        `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`,
        'MAX_LENGTH'
      ),
    }
  }

  // Validate frequency
  if (!VALID_FREQUENCIES.includes(data.frequency)) {
    return {
      success: false,
      error: createValidationError(
        'frequency',
        `Frequency must be one of: ${VALID_FREQUENCIES.join(', ')}`,
        'INVALID_FREQUENCY'
      ),
    }
  }

  // Validate startDate if provided
  if (data.startDate && !isValidDateString(data.startDate)) {
    return {
      success: false,
      error: createValidationError(
        'startDate',
        'Start date must be in YYYY-MM-DD format',
        'INVALID_DATE'
      ),
    }
  }

  // Validate endDate if provided
  if (data.endDate) {
    if (!isValidDateString(data.endDate)) {
      return {
        success: false,
        error: createValidationError(
          'endDate',
          'End date must be in YYYY-MM-DD format',
          'INVALID_DATE'
        ),
      }
    }

    // Ensure endDate is after startDate
    if (data.startDate) {
      const start = parseISO(data.startDate)
      const end = parseISO(data.endDate)

      if (isBefore(end, start)) {
        return {
          success: false,
          error: createValidationError(
            'endDate',
            'End date must be after start date',
            'END_BEFORE_START'
          ),
        }
      }
    }
  }

  return { success: true, data }
}

/**
 * Validate recurring transaction update data
 */
export function validateUpdateRecurring(
  data: UpdateRecurringDto
): Result<UpdateRecurringDto, ValidationError> {
  // Validate amount if provided
  if (data.amount !== undefined) {
    if (
      !isValidAmount(data.amount, { allowNegative: false, allowZero: false })
    ) {
      return {
        success: false,
        error: createValidationError(
          'amount',
          'Amount must be a positive integer in cents',
          'INVALID_AMOUNT'
        ),
      }
    }
  }

  // Validate description if provided
  if (data.description !== undefined) {
    if (data.description.trim() === '') {
      return {
        success: false,
        error: createValidationError(
          'description',
          'Description cannot be empty',
          'REQUIRED_FIELD'
        ),
      }
    }

    if (data.description.length > MAX_DESCRIPTION_LENGTH) {
      return {
        success: false,
        error: createValidationError(
          'description',
          `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`,
          'MAX_LENGTH'
        ),
      }
    }
  }

  // Validate frequency if provided
  if (
    data.frequency !== undefined &&
    !VALID_FREQUENCIES.includes(data.frequency)
  ) {
    return {
      success: false,
      error: createValidationError(
        'frequency',
        `Frequency must be one of: ${VALID_FREQUENCIES.join(', ')}`,
        'INVALID_FREQUENCY'
      ),
    }
  }

  // Validate status if provided
  if (
    data.status !== undefined &&
    !VALID_RECURRING_STATUSES.includes(data.status)
  ) {
    return {
      success: false,
      error: createValidationError(
        'status',
        `Status must be one of: ${VALID_RECURRING_STATUSES.join(', ')}`,
        'INVALID_STATUS'
      ),
    }
  }

  return { success: true, data }
}
