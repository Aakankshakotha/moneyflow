import { describe, it, expect } from 'vitest'
import {
  isValidUUID,
  isValidAmount,
  isValidDateString,
  isValidAccountType,
  isValidAccountStatus,
  isValidRecurrenceFrequency,
  isValidRecurringStatus,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateRange,
  validateEmail,
} from '../validationUtils'

describe('validationUtils', () => {
  describe('isValidUUID', () => {
    it('returns true for valid v4 UUID', () => {
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
      expect(isValidUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true)
      expect(isValidUUID('a3bb189e-8bf9-3888-9912-ace4e6543002')).toBe(true)
    })

    it('returns false for invalid UUID format', () => {
      expect(isValidUUID('not-a-uuid')).toBe(false)
      expect(isValidUUID('550e8400-e29b-41d4-a716')).toBe(false)
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000-extra')).toBe(
        false
      )
      expect(isValidUUID('')).toBe(false)
      expect(isValidUUID('ZZZZZZZZ-ZZZZ-ZZZZ-ZZZZ-ZZZZZZZZZZZZ')).toBe(false)
    })

    it('returns false for null or undefined', () => {
      expect(isValidUUID(null as unknown as string)).toBe(false)
      expect(isValidUUID(undefined as unknown as string)).toBe(false)
    })
  })

  describe('isValidAmount', () => {
    it('returns true for valid positive integers', () => {
      expect(isValidAmount(0)).toBe(true)
      expect(isValidAmount(1)).toBe(true)
      expect(isValidAmount(100)).toBe(true)
      expect(isValidAmount(1000000)).toBe(true)
    })

    it('returns true for negative integers when allowed', () => {
      expect(isValidAmount(-100, { allowNegative: true })).toBe(true)
      expect(isValidAmount(-1, { allowNegative: true })).toBe(true)
    })

    it('returns false for negative integers when not allowed', () => {
      expect(isValidAmount(-100)).toBe(false)
      expect(isValidAmount(-1)).toBe(false)
    })

    it('returns true for zero when allowed', () => {
      expect(isValidAmount(0, { allowZero: true })).toBe(true)
      expect(isValidAmount(0)).toBe(true) // default allows zero
    })

    it('returns false for zero when not allowed', () => {
      expect(isValidAmount(0, { allowZero: false })).toBe(false)
    })

    it('returns false for decimals', () => {
      expect(isValidAmount(1.5)).toBe(false)
      expect(isValidAmount(10.99)).toBe(false)
    })

    it('returns false for non-numbers', () => {
      expect(isValidAmount(NaN)).toBe(false)
      expect(isValidAmount(Infinity)).toBe(false)
      expect(isValidAmount(-Infinity)).toBe(false)
      expect(isValidAmount('100' as unknown as number)).toBe(false)
      expect(isValidAmount(null as unknown as number)).toBe(false)
      expect(isValidAmount(undefined as unknown as number)).toBe(false)
    })

    it('respects min and max values', () => {
      expect(isValidAmount(50, { min: 0, max: 100 })).toBe(true)
      expect(isValidAmount(0, { min: 0, max: 100 })).toBe(true)
      expect(isValidAmount(100, { min: 0, max: 100 })).toBe(true)
      expect(isValidAmount(-1, { min: 0, max: 100 })).toBe(false)
      expect(isValidAmount(101, { min: 0, max: 100 })).toBe(false)
    })
  })

  describe('isValidDateString', () => {
    it('returns true for valid ISO date strings', () => {
      expect(isValidDateString('2024-03-15')).toBe(true)
      expect(isValidDateString('2024-01-01')).toBe(true)
      expect(isValidDateString('2024-12-31')).toBe(true)
    })

    it('returns true for valid ISO datetime strings', () => {
      expect(isValidDateString('2024-03-15T10:30:00')).toBe(true)
      expect(isValidDateString('2024-03-15T10:30:00.000Z')).toBe(true)
    })

    it('returns false for invalid date strings', () => {
      expect(isValidDateString('not-a-date')).toBe(false)
      expect(isValidDateString('2024-13-01')).toBe(false) // invalid month
      expect(isValidDateString('2024-02-30')).toBe(false) // invalid day
      expect(isValidDateString('')).toBe(false)
    })

    it('returns false for null or undefined', () => {
      expect(isValidDateString(null as unknown as string)).toBe(false)
      expect(isValidDateString(undefined as unknown as string)).toBe(false)
    })
  })

  describe('isValidAccountType', () => {
    it('returns true for valid account types', () => {
      expect(isValidAccountType('asset')).toBe(true)
      expect(isValidAccountType('liability')).toBe(true)
      expect(isValidAccountType('income')).toBe(true)
      expect(isValidAccountType('expense')).toBe(true)
    })

    it('returns false for invalid account types', () => {
      expect(isValidAccountType('invalid')).toBe(false)
      expect(isValidAccountType('ASSET')).toBe(false)
      expect(isValidAccountType('checking')).toBe(false)
      expect(isValidAccountType('')).toBe(false)
    })
  })

  describe('isValidAccountStatus', () => {
    it('returns true for valid account statuses', () => {
      expect(isValidAccountStatus('active')).toBe(true)
      expect(isValidAccountStatus('archived')).toBe(true)
    })

    it('returns false for invalid account statuses', () => {
      expect(isValidAccountStatus('invalid')).toBe(false)
      expect(isValidAccountStatus('ACTIVE')).toBe(false)
      expect(isValidAccountStatus('closed')).toBe(false)
      expect(isValidAccountStatus('')).toBe(false)
    })
  })

  describe('isValidRecurrenceFrequency', () => {
    it('returns true for valid recurrence frequencies', () => {
      expect(isValidRecurrenceFrequency('daily')).toBe(true)
      expect(isValidRecurrenceFrequency('weekly')).toBe(true)
      expect(isValidRecurrenceFrequency('monthly')).toBe(true)
      expect(isValidRecurrenceFrequency('yearly')).toBe(true)
    })

    it('returns false for invalid recurrence frequencies', () => {
      expect(isValidRecurrenceFrequency('invalid')).toBe(false)
      expect(isValidRecurrenceFrequency('DAILY')).toBe(false)
      expect(isValidRecurrenceFrequency('')).toBe(false)
    })
  })

  describe('isValidRecurringStatus', () => {
    it('returns true for valid recurring statuses', () => {
      expect(isValidRecurringStatus('active')).toBe(true)
      expect(isValidRecurringStatus('paused')).toBe(true)
    })

    it('returns false for invalid recurring statuses', () => {
      expect(isValidRecurringStatus('invalid')).toBe(false)
      expect(isValidRecurringStatus('ACTIVE')).toBe(false)
      expect(isValidRecurringStatus('inactive')).toBe(false)
      expect(isValidRecurringStatus('')).toBe(false)
    })
  })

  describe('validateRequired', () => {
    it('returns true for non-empty strings', () => {
      expect(validateRequired('hello')).toBe(true)
      expect(validateRequired('a')).toBe(true)
    })

    it('returns false for empty strings', () => {
      expect(validateRequired('')).toBe(false)
      expect(validateRequired('   ')).toBe(false)
    })

    it('returns false for null or undefined', () => {
      expect(validateRequired(null)).toBe(false)
      expect(validateRequired(undefined)).toBe(false)
    })

    it('works with custom field name in error message', () => {
      const result = validateRequired('', 'username')
      expect(result).toBe(false)
    })
  })

  describe('validateMinLength', () => {
    it('returns true when string meets minimum length', () => {
      expect(validateMinLength('hello', 3)).toBe(true)
      expect(validateMinLength('hello', 5)).toBe(true)
      expect(validateMinLength('hello world', 5)).toBe(true)
    })

    it('returns false when string is shorter than minimum', () => {
      expect(validateMinLength('hi', 3)).toBe(false)
      expect(validateMinLength('a', 2)).toBe(false)
    })

    it('returns false for null or undefined', () => {
      expect(validateMinLength(null as unknown as string, 3)).toBe(false)
      expect(validateMinLength(undefined as unknown as string, 3)).toBe(false)
    })
  })

  describe('validateMaxLength', () => {
    it('returns true when string is within maximum length', () => {
      expect(validateMaxLength('hello', 10)).toBe(true)
      expect(validateMaxLength('hello', 5)).toBe(true)
      expect(validateMaxLength('hi', 5)).toBe(true)
    })

    it('returns false when string exceeds maximum', () => {
      expect(validateMaxLength('hello world', 5)).toBe(false)
      expect(validateMaxLength('toolong', 6)).toBe(false)
    })

    it('returns false for null or undefined', () => {
      expect(validateMaxLength(null as unknown as string, 10)).toBe(false)
      expect(validateMaxLength(undefined as unknown as string, 10)).toBe(false)
    })
  })

  describe('validateRange', () => {
    it('returns true when number is within range', () => {
      expect(validateRange(5, 0, 10)).toBe(true)
      expect(validateRange(0, 0, 10)).toBe(true)
      expect(validateRange(10, 0, 10)).toBe(true)
      expect(validateRange(-5, -10, 0)).toBe(true)
    })

    it('returns false when number is outside range', () => {
      expect(validateRange(11, 0, 10)).toBe(false)
      expect(validateRange(-1, 0, 10)).toBe(false)
      expect(validateRange(100, 0, 10)).toBe(false)
    })

    it('returns false for non-numbers', () => {
      expect(validateRange(NaN, 0, 10)).toBe(false)
      expect(validateRange(Infinity, 0, 10)).toBe(false)
      expect(validateRange(null as unknown as number, 0, 10)).toBe(false)
    })
  })

  describe('validateEmail', () => {
    it('returns true for valid email addresses', () => {
      expect(validateEmail('user@example.com')).toBe(true)
      expect(validateEmail('test.user@example.co.uk')).toBe(true)
      expect(validateEmail('user+tag@example.com')).toBe(true)
      expect(validateEmail('a@b.c')).toBe(true)
    })

    it('returns false for invalid email addresses', () => {
      expect(validateEmail('invalid')).toBe(false)
      expect(validateEmail('invalid@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('user@')).toBe(false)
      expect(validateEmail('')).toBe(false)
      expect(validateEmail('user @example.com')).toBe(false)
    })

    it('returns false for null or undefined', () => {
      expect(validateEmail(null as unknown as string)).toBe(false)
      expect(validateEmail(undefined as unknown as string)).toBe(false)
    })
  })
})
