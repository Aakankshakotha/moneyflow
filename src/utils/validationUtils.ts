import type { AccountType, AccountStatus } from '@/types/account'
import type { RecurrenceFrequency, RecurringStatus } from '@/types/recurring'
import { parseISO, isValid } from 'date-fns'

/**
 * UUID v4 regex pattern
 */
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Email regex pattern (basic validation)
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Validates if a string is a valid UUID
 * @param value - Value to validate
 * @returns True if valid UUID, false otherwise
 */
export function isValidUUID(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false
  }
  return UUID_REGEX.test(value)
}

/**
 * Options for amount validation
 */
interface AmountValidationOptions {
  allowNegative?: boolean
  allowZero?: boolean
  min?: number
  max?: number
}

/**
 * Validates if a value is a valid amount (integer in cents)
 * @param value - Value to validate
 * @param options - Validation options
 * @returns True if valid amount, false otherwise
 */
export function isValidAmount(
  value: unknown,
  options: AmountValidationOptions = {}
): value is number {
  const { allowNegative = false, allowZero = true, min, max } = options

  // Check if it's a number
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return false
  }

  // Check if it's an integer
  if (!Number.isInteger(value)) {
    return false
  }

  // Check negative
  if (!allowNegative && value < 0) {
    return false
  }

  // Check zero
  if (!allowZero && value === 0) {
    return false
  }

  // Check min/max
  if (min !== undefined && value < min) {
    return false
  }

  if (max !== undefined && value > max) {
    return false
  }

  return true
}

/**
 * Validates if a string is a valid date in ISO format
 * @param value - Value to validate
 * @returns True if valid date string, false otherwise
 */
export function isValidDateString(value: unknown): value is string {
  if (typeof value !== 'string' || value.trim() === '') {
    return false
  }

  try {
    const date = parseISO(value)
    if (!isValid(date)) {
      return false
    }

    // Additional validation: for YYYY-MM-DD format, ensure the date wasn't adjusted
    // (e.g., 2024-02-30 shouldn't become 2024-03-02)
    const isoDateRegex = /^(\d{4})-(\d{2})-(\d{2})$/
    const match = value.match(isoDateRegex)
    if (match) {
      const [, year, month, day] = match
      // Check if the parsed date has the same components
      if (
        date.getFullYear() !== parseInt(year, 10) ||
        date.getMonth() + 1 !== parseInt(month, 10) ||
        date.getDate() !== parseInt(day, 10)
      ) {
        return false
      }
    }

    return true
  } catch {
    return false
  }
}

/**
 * Validates if a value is a valid AccountType
 * @param value - Value to validate
 * @returns True if valid AccountType, false otherwise
 */
export function isValidAccountType(value: unknown): value is AccountType {
  const validTypes: AccountType[] = ['asset', 'liability', 'income', 'expense']
  return typeof value === 'string' && validTypes.includes(value as AccountType)
}

/**
 * Validates if a value is a valid AccountStatus
 * @param value - Value to validate
 * @returns True if valid AccountStatus, false otherwise
 */
export function isValidAccountStatus(value: unknown): value is AccountStatus {
  const validStatuses: AccountStatus[] = ['active', 'archived']
  return (
    typeof value === 'string' && validStatuses.includes(value as AccountStatus)
  )
}

/**
 * Validates if a value is a valid RecurrenceFrequency
 * @param value - Value to validate
 * @returns True if valid RecurrenceFrequency, false otherwise
 */
export function isValidRecurrenceFrequency(
  value: unknown
): value is RecurrenceFrequency {
  const validFrequencies: RecurrenceFrequency[] = [
    'daily',
    'weekly',
    'monthly',
    'yearly',
  ]
  return (
    typeof value === 'string' &&
    validFrequencies.includes(value as RecurrenceFrequency)
  )
}

/**
 * Validates if a value is a valid RecurringStatus
 * @param value - Value to validate
 * @returns True if valid RecurringStatus, false otherwise
 */
export function isValidRecurringStatus(
  value: unknown
): value is RecurringStatus {
  const validStatuses: RecurringStatus[] = ['active', 'paused']
  return (
    typeof value === 'string' &&
    validStatuses.includes(value as RecurringStatus)
  )
}

/**
 * Validates if a value is a non-empty string
 * @param value - Value to validate
 * @param _fieldName - Optional field name for error messages (reserved for future use)
 * @returns True if valid, false otherwise
 */
export function validateRequired(value: unknown, _fieldName?: string): boolean {
  if (value === null || value === undefined) {
    return false
  }

  if (typeof value === 'string' && value.trim() === '') {
    return false
  }

  return true
}

/**
 * Validates if a string meets minimum length requirement
 * @param value - Value to validate
 * @param minLength - Minimum length required
 * @param _fieldName - Optional field name for error messages (reserved for future use)
 * @returns True if valid, false otherwise
 */
export function validateMinLength(
  value: unknown,
  minLength: number,
  _fieldName?: string
): boolean {
  if (typeof value !== 'string') {
    return false
  }

  return value.length >= minLength
}

/**
 * Validates if a string does not exceed maximum length
 * @param value - Value to validate
 * @param maxLength - Maximum length allowed
 * @param _fieldName - Optional field name for error messages (reserved for future use)
 * @returns True if valid, false otherwise
 */
export function validateMaxLength(
  value: unknown,
  maxLength: number,
  _fieldName?: string
): boolean {
  if (typeof value !== 'string') {
    return false
  }

  return value.length <= maxLength
}

/**
 * Validates if a number is within a specified range
 * @param value - Value to validate
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @param _fieldName - Optional field name for error messages (reserved for future use)
 * @returns True if valid, false otherwise
 */
export function validateRange(
  value: unknown,
  min: number,
  max: number,
  _fieldName?: string
): boolean {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return false
  }

  return value >= min && value <= max
}

/**
 * Validates if a string is a valid email address
 * @param value - Value to validate
 * @returns True if valid email, false otherwise
 */
export function validateEmail(value: unknown): boolean {
  if (typeof value !== 'string' || value.trim() === '') {
    return false
  }

  return EMAIL_REGEX.test(value)
}
