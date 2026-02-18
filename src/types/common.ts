/**
 * Common types used across the application
 */

/**
 * Result pattern for error handling
 * Enables type-safe error handling without exceptions
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }

/**
 * Validation error with field-level details
 */
export interface ValidationError {
  field: string
  message: string
  code: string
}

/**
 * Not found error when entity doesn't exist
 */
export interface NotFoundError {
  message: string
  code: 'NOT_FOUND'
  entityType?: string
  entityId?: string
}

/**
 * Business rule violation error
 */
export interface BusinessRuleError {
  message: string
  code: string
  details?: Record<string, unknown>
}

/**
 * Storage operation error
 */
export interface StorageError {
  message: string
  code: 'STORAGE_ERROR' | 'QUOTA_EXCEEDED' | 'PARSE_ERROR' | 'UNAVAILABLE'
  details?: string
}

/**
 * Generic error type for unknown errors
 */
export interface GenericError {
  message: string
  code: string
}

/**
 * Export data structure for backup/restore
 */
export interface ExportData {
  version: string
  exportedAt: string
  accounts: unknown[]
  transactions: unknown[]
  recurring: unknown[]
  netWorthSnapshots: unknown[]
}
