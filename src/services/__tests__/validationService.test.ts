import { describe, it, expect } from 'vitest'
import {
  validateCreateAccount,
  validateUpdateAccount,
  validateCreateTransaction,
  validateUpdateTransaction,
  validateCreateRecurring,
  validateUpdateRecurring,
} from '../validationService'
import type { AccountType, AccountStatus } from '@/types/account'
import type { RecurrenceFrequency, RecurringStatus } from '@/types/recurring'

describe('ValidationService - Account Validation', () => {
  describe('validateCreateAccount', () => {
    it('should validate a valid account creation', () => {
      const result = validateCreateAccount({
        name: 'Checking Account',
        type: 'asset' as AccountType,
        balance: 100000,
      })
      expect(result.success).toBe(true)
    })

    it('should validate account with default balance', () => {
      const result = validateCreateAccount({
        name: 'Savings Account',
        type: 'asset' as AccountType,
      })
      expect(result.success).toBe(true)
    })

    it('should reject missing name', () => {
      const result = validateCreateAccount({
        name: '',
        type: 'asset' as AccountType,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.field).toBe('name')
        expect(result.error.code).toBe('REQUIRED_FIELD')
      }
    })

    it('should reject name that is too long', () => {
      const result = validateCreateAccount({
        name: 'a'.repeat(101),
        type: 'asset' as AccountType,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.field).toBe('name')
        expect(result.error.code).toBe('MAX_LENGTH')
      }
    })

    it('should reject invalid account type', () => {
      const result = validateCreateAccount({
        name: 'Test Account',
        type: 'invalid' as AccountType,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.field).toBe('type')
        expect(result.error.code).toBe('INVALID_TYPE')
      }
    })

    it('should reject non-integer balance', () => {
      const result = validateCreateAccount({
        name: 'Test Account',
        type: 'asset' as AccountType,
        balance: 100.5,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.field).toBe('balance')
        expect(result.error.code).toBe('INVALID_AMOUNT')
      }
    })

    it('should allow zero balance', () => {
      const result = validateCreateAccount({
        name: 'Test Account',
        type: 'asset' as AccountType,
        balance: 0,
      })
      expect(result.success).toBe(true)
    })

    it('should allow negative balance for liability accounts', () => {
      const result = validateCreateAccount({
        name: 'Credit Card',
        type: 'liability' as AccountType,
        balance: -50000,
      })
      expect(result.success).toBe(true)
    })
  })

  describe('validateUpdateAccount', () => {
    it('should validate a valid account update', () => {
      const result = validateUpdateAccount({
        name: 'Updated Account',
        status: 'archived' as AccountStatus,
      })
      expect(result.success).toBe(true)
    })

    it('should allow empty update (all fields optional)', () => {
      const result = validateUpdateAccount({})
      expect(result.success).toBe(true)
    })

    it('should reject name that is too long', () => {
      const result = validateUpdateAccount({
        name: 'a'.repeat(101),
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.field).toBe('name')
        expect(result.error.code).toBe('MAX_LENGTH')
      }
    })

    it('should reject invalid status', () => {
      const result = validateUpdateAccount({
        status: 'invalid' as AccountStatus,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.field).toBe('status')
        expect(result.error.code).toBe('INVALID_STATUS')
      }
    })

    it('should reject empty name if provided', () => {
      const result = validateUpdateAccount({
        name: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.field).toBe('name')
        expect(result.error.code).toBe('REQUIRED_FIELD')
      }
    })
  })
})

describe('ValidationService - Transaction Validation', () => {
  describe('validateCreateTransaction', () => {
    it('should validate a valid transaction creation', () => {
      const result = validateCreateTransaction({
        fromAccountId: '12345678-1234-1234-1234-123456789012',
        toAccountId: '87654321-4321-4321-4321-210987654321',
        amount: 50000,
        description: 'Grocery shopping',
        date: '2026-02-17',
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid fromAccountId', () => {
      const result = validateCreateTransaction({
        fromAccountId: 'not-a-uuid',
        toAccountId: '87654321-4321-4321-4321-210987654321',
        amount: 50000,
        description: 'Test',
        date: '2026-02-17',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.field).toBe('fromAccountId')
        expect(result.error.code).toBe('INVALID_UUID')
      }
    })

    it('should reject invalid toAccountId', () => {
      const result = validateCreateTransaction({
        fromAccountId: '12345678-1234-1234-1234-123456789012',
        toAccountId: 'not-a-uuid',
        amount: 50000,
        description: 'Test',
        date: '2026-02-17',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.field).toBe('toAccountId')
        expect(result.error.code).toBe('INVALID_UUID')
      }
    })

    it('should reject same fromAccountId and toAccountId', () => {
      const result = validateCreateTransaction({
        fromAccountId: '12345678-1234-1234-1234-123456789012',
        toAccountId: '12345678-1234-1234-1234-123456789012',
        amount: 50000,
        description: 'Test',
        date: '2026-02-17',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.field).toBe('toAccountId')
        expect(result.error.code).toBe('SAME_ACCOUNT')
      }
    })

    it('should reject zero amount', () => {
      const result = validateCreateTransaction({
        fromAccountId: '12345678-1234-1234-1234-123456789012',
        toAccountId: '87654321-4321-4321-4321-210987654321',
        amount: 0,
        description: 'Test',
        date: '2026-02-17',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.field).toBe('amount')
        expect(result.error.code).toBe('INVALID_AMOUNT')
      }
    })

    it('should reject negative amount', () => {
      const result = validateCreateTransaction({
        fromAccountId: '12345678-1234-1234-1234-123456789012',
        toAccountId: '87654321-4321-4321-4321-210987654321',
        amount: -50000,
        description: 'Test',
        date: '2026-02-17',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.field).toBe('amount')
        expect(result.error.code).toBe('INVALID_AMOUNT')
      }
    })

    it('should reject non-integer amount', () => {
      const result = validateCreateTransaction({
        fromAccountId: '12345678-1234-1234-1234-123456789012',
        toAccountId: '87654321-4321-4321-4321-210987654321',
        amount: 50000.5,
        description: 'Test',
        date: '2026-02-17',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.field).toBe('amount')
        expect(result.error.code).toBe('INVALID_AMOUNT')
      }
    })

    it('should reject empty description', () => {
      const result = validateCreateTransaction({
        fromAccountId: '12345678-1234-1234-1234-123456789012',
        toAccountId: '87654321-4321-4321-4321-210987654321',
        amount: 50000,
        description: '',
        date: '2026-02-17',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.field).toBe('description')
        expect(result.error.code).toBe('REQUIRED_FIELD')
      }
    })

    it('should reject description that is too long', () => {
      const result = validateCreateTransaction({
        fromAccountId: '12345678-1234-1234-1234-123456789012',
        toAccountId: '87654321-4321-4321-4321-210987654321',
        amount: 50000,
        description: 'a'.repeat(501),
        date: '2026-02-17',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.field).toBe('description')
        expect(result.error.code).toBe('MAX_LENGTH')
      }
    })

    it('should reject invalid date format', () => {
      const result = validateCreateTransaction({
        fromAccountId: '12345678-1234-1234-1234-123456789012',
        toAccountId: '87654321-4321-4321-4321-210987654321',
        amount: 50000,
        description: 'Test',
        date: '2026/02/17',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.field).toBe('date')
        expect(result.error.code).toBe('INVALID_DATE')
      }
    })

    it('should reject future date', () => {
      const result = validateCreateTransaction({
        fromAccountId: '12345678-1234-1234-1234-123456789012',
        toAccountId: '87654321-4321-4321-4321-210987654321',
        amount: 50000,
        description: 'Test',
        date: '2099-12-31',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.field).toBe('date')
        expect(result.error.code).toBe('FUTURE_DATE')
      }
    })
  })

  describe('validateUpdateTransaction', () => {
    it('should validate a valid transaction update', () => {
      const result = validateUpdateTransaction({
        description: 'Updated description',
        date: '2026-02-16',
      })
      expect(result.success).toBe(true)
    })

    it('should allow empty update', () => {
      const result = validateUpdateTransaction({})
      expect(result.success).toBe(true)
    })

    it('should reject empty description if provided', () => {
      const result = validateUpdateTransaction({
        description: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.field).toBe('description')
        expect(result.error.code).toBe('REQUIRED_FIELD')
      }
    })

    it('should reject future date', () => {
      const result = validateUpdateTransaction({
        date: '2099-12-31',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.field).toBe('date')
        expect(result.error.code).toBe('FUTURE_DATE')
      }
    })
  })
})

describe('ValidationService - Recurring Transaction Validation', () => {
  describe('validateCreateRecurring', () => {
    it('should validate a valid recurring transaction', () => {
      const result = validateCreateRecurring({
        fromAccountId: '12345678-1234-1234-1234-123456789012',
        toAccountId: '87654321-4321-4321-4321-210987654321',
        amount: 50000,
        description: 'Monthly rent',
        frequency: 'monthly' as RecurrenceFrequency,
        startDate: '2026-02-17',
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid frequency', () => {
      const result = validateCreateRecurring({
        fromAccountId: '12345678-1234-1234-1234-123456789012',
        toAccountId: '87654321-4321-4321-4321-210987654321',
        amount: 50000,
        description: 'Test',
        frequency: 'invalid' as RecurrenceFrequency,
        startDate: '2026-02-17',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.field).toBe('frequency')
        expect(result.error.code).toBe('INVALID_FREQUENCY')
      }
    })

    it('should reject invalid startDate', () => {
      const result = validateCreateRecurring({
        fromAccountId: '12345678-1234-1234-1234-123456789012',
        toAccountId: '87654321-4321-4321-4321-210987654321',
        amount: 50000,
        description: 'Test',
        frequency: 'monthly' as RecurrenceFrequency,
        startDate: 'invalid-date',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.field).toBe('startDate')
        expect(result.error.code).toBe('INVALID_DATE')
      }
    })

    it('should validate endDate if provided', () => {
      const result = validateCreateRecurring({
        fromAccountId: '12345678-1234-1234-1234-123456789012',
        toAccountId: '87654321-4321-4321-4321-210987654321',
        amount: 50000,
        description: 'Test',
        frequency: 'monthly' as RecurrenceFrequency,
        startDate: '2026-02-17',
        endDate: '2026-12-31',
      })
      expect(result.success).toBe(true)
    })

    it('should reject endDate before startDate', () => {
      const result = validateCreateRecurring({
        fromAccountId: '12345678-1234-1234-1234-123456789012',
        toAccountId: '87654321-4321-4321-4321-210987654321',
        amount: 50000,
        description: 'Test',
        frequency: 'monthly' as RecurrenceFrequency,
        startDate: '2026-02-17',
        endDate: '2026-02-01',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.field).toBe('endDate')
        expect(result.error.code).toBe('END_BEFORE_START')
      }
    })
  })

  describe('validateUpdateRecurring', () => {
    it('should validate a valid recurring update', () => {
      const result = validateUpdateRecurring({
        description: 'Updated recurring',
        status: 'paused' as RecurringStatus,
      })
      expect(result.success).toBe(true)
    })

    it('should allow empty update', () => {
      const result = validateUpdateRecurring({})
      expect(result.success).toBe(true)
    })

    it('should reject invalid status', () => {
      const result = validateUpdateRecurring({
        status: 'invalid' as RecurringStatus,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.field).toBe('status')
        expect(result.error.code).toBe('INVALID_STATUS')
      }
    })
  })
})
