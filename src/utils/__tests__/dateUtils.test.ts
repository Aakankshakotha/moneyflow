import { describe, it, expect } from 'vitest'
import {
  formatDate,
  getDateRange,
  getEndOfMonth,
  getEndOfYear,
  getStartOfMonth,
  getStartOfYear,
  isValidDate,
  parseDate,
} from '../dateUtils'

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('formats ISO date to default format (YYYY-MM-DD)', () => {
      const date = new Date('2024-03-15T10:30:00.000Z')
      expect(formatDate(date)).toBe('2024-03-15')
    })

    it('formats date with custom format', () => {
      const date = new Date('2024-03-15T10:30:00.000Z')
      expect(formatDate(date, 'MMM dd, yyyy')).toBe('Mar 15, 2024')
    })

    it('formats date with time', () => {
      const date = new Date('2024-03-15T10:30:00.000Z')
      expect(formatDate(date, 'yyyy-MM-dd HH:mm')).toMatch(
        /2024-03-15 \d{2}:\d{2}/
      )
    })

    it('handles different date formats', () => {
      const date = new Date('2024-12-31T12:00:00')
      expect(formatDate(date, 'MM/dd/yyyy')).toBe('12/31/2024')
      expect(formatDate(date, 'dd/MM/yyyy')).toBe('31/12/2024')
    })

    it('throws error for invalid date', () => {
      const invalidDate = new Date('invalid')
      expect(() => formatDate(invalidDate)).toThrow('Invalid date')
    })
  })

  describe('parseDate', () => {
    it('parses ISO date string', () => {
      const result = parseDate('2024-03-15')
      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(2) // 0-indexed
      expect(result.getDate()).toBe(15)
    })

    it('parses ISO datetime string', () => {
      const result = parseDate('2024-03-15T10:30:00.000Z')
      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2024)
    })

    it('parses slash-separated date string', () => {
      const result = parseDate('03/15/2024', 'MM/dd/yyyy')
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(2)
      expect(result.getDate()).toBe(15)
    })

    it('throws error for invalid date string', () => {
      expect(() => parseDate('not-a-date')).toThrow('Invalid date string')
    })

    it('throws error for empty string', () => {
      expect(() => parseDate('')).toThrow('Invalid date string')
    })
  })

  describe('isValidDate', () => {
    it('returns true for valid Date object', () => {
      const validDate = new Date('2024-03-15')
      expect(isValidDate(validDate)).toBe(true)
    })

    it('returns false for invalid Date object', () => {
      const invalidDate = new Date('invalid')
      expect(isValidDate(invalidDate)).toBe(false)
    })

    it('returns false for null', () => {
      expect(isValidDate(null)).toBe(false)
    })

    it('returns false for undefined', () => {
      expect(isValidDate(undefined)).toBe(false)
    })

    it('returns false for non-Date objects', () => {
      expect(isValidDate('2024-03-15')).toBe(false)
      expect(isValidDate(1234567890)).toBe(false)
      expect(isValidDate({})).toBe(false)
    })
  })

  describe('getDateRange', () => {
    it('generates daily date range', () => {
      const start = new Date('2024-03-01')
      const end = new Date('2024-03-05')
      const range = getDateRange(start, end, 'day')

      expect(range).toHaveLength(5)
      expect(formatDate(range[0])).toBe('2024-03-01')
      expect(formatDate(range[4])).toBe('2024-03-05')
    })

    it('generates weekly date range', () => {
      const start = new Date('2024-03-01')
      const end = new Date('2024-03-22')
      const range = getDateRange(start, end, 'week')

      expect(range).toHaveLength(4)
      expect(formatDate(range[0])).toBe('2024-03-01')
      expect(formatDate(range[1])).toBe('2024-03-08')
      expect(formatDate(range[2])).toBe('2024-03-15')
      expect(formatDate(range[3])).toBe('2024-03-22')
    })

    it('generates monthly date range', () => {
      const start = new Date('2024-01-15')
      const end = new Date('2024-04-15')
      const range = getDateRange(start, end, 'month')

      expect(range).toHaveLength(4)
      expect(formatDate(range[0])).toBe('2024-01-15')
      expect(formatDate(range[1])).toBe('2024-02-15')
      expect(formatDate(range[2])).toBe('2024-03-15')
      expect(formatDate(range[3])).toBe('2024-04-15')
    })

    it('generates yearly date range', () => {
      const start = new Date('2021-03-15')
      const end = new Date('2024-03-15')
      const range = getDateRange(start, end, 'year')

      expect(range).toHaveLength(4)
      expect(formatDate(range[0])).toBe('2021-03-15')
      expect(formatDate(range[3])).toBe('2024-03-15')
    })

    it('returns single date when start equals end', () => {
      const date = new Date('2024-03-15')
      const range = getDateRange(date, date, 'day')

      expect(range).toHaveLength(1)
      expect(formatDate(range[0])).toBe('2024-03-15')
    })

    it('throws error when start date is after end date', () => {
      const start = new Date('2024-03-15')
      const end = new Date('2024-03-10')

      expect(() => getDateRange(start, end, 'day')).toThrow(
        'Start date must be before or equal to end date'
      )
    })

    it('throws error for invalid dates', () => {
      const validDate = new Date('2024-03-15')
      const invalidDate = new Date('invalid')

      expect(() => getDateRange(invalidDate, validDate, 'day')).toThrow(
        'Invalid date'
      )
      expect(() => getDateRange(validDate, invalidDate, 'day')).toThrow(
        'Invalid date'
      )
    })
  })

  describe('getStartOfMonth', () => {
    it('returns first day of month', () => {
      const date = new Date('2024-03-15T10:30:00.000Z')
      const result = getStartOfMonth(date)

      expect(result.getDate()).toBe(1)
      expect(result.getMonth()).toBe(2) // March (0-indexed)
      expect(result.getFullYear()).toBe(2024)
      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
      expect(result.getSeconds()).toBe(0)
      expect(result.getMilliseconds()).toBe(0)
    })

    it('works for different months', () => {
      const date = new Date('2024-12-31T12:00:00')
      const result = getStartOfMonth(date)

      expect(result.getDate()).toBe(1)
      expect(result.getMonth()).toBe(11) // December
    })
  })

  describe('getEndOfMonth', () => {
    it('returns last day of month', () => {
      const date = new Date('2024-03-15T10:30:00.000Z')
      const result = getEndOfMonth(date)

      expect(result.getDate()).toBe(31)
      expect(result.getMonth()).toBe(2) // March
      expect(result.getFullYear()).toBe(2024)
      expect(result.getHours()).toBe(23)
      expect(result.getMinutes()).toBe(59)
      expect(result.getSeconds()).toBe(59)
      expect(result.getMilliseconds()).toBe(999)
    })

    it('handles February in non-leap year', () => {
      const date = new Date('2023-02-15')
      const result = getEndOfMonth(date)

      expect(result.getDate()).toBe(28)
    })

    it('handles February in leap year', () => {
      const date = new Date('2024-02-15')
      const result = getEndOfMonth(date)

      expect(result.getDate()).toBe(29)
    })

    it('handles months with 30 days', () => {
      const date = new Date('2024-04-15')
      const result = getEndOfMonth(date)

      expect(result.getDate()).toBe(30)
    })
  })

  describe('getStartOfYear', () => {
    it('returns first day of year', () => {
      const date = new Date('2024-06-15T10:30:00.000Z')
      const result = getStartOfYear(date)

      expect(result.getDate()).toBe(1)
      expect(result.getMonth()).toBe(0) // January
      expect(result.getFullYear()).toBe(2024)
      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
      expect(result.getSeconds()).toBe(0)
      expect(result.getMilliseconds()).toBe(0)
    })

    it('works for last day of year', () => {
      const date = new Date('2024-12-31T12:00:00')
      const result = getStartOfYear(date)

      expect(formatDate(result)).toBe('2024-01-01')
    })
  })

  describe('getEndOfYear', () => {
    it('returns last day of year', () => {
      const date = new Date('2024-06-15T10:30:00.000Z')
      const result = getEndOfYear(date)

      expect(result.getDate()).toBe(31)
      expect(result.getMonth()).toBe(11) // December
      expect(result.getFullYear()).toBe(2024)
      expect(result.getHours()).toBe(23)
      expect(result.getMinutes()).toBe(59)
      expect(result.getSeconds()).toBe(59)
      expect(result.getMilliseconds()).toBe(999)
    })

    it('works for first day of year', () => {
      const date = new Date('2024-01-01T00:00:00.000Z')
      const result = getEndOfYear(date)

      expect(formatDate(result)).toBe('2024-12-31')
    })
  })
})
