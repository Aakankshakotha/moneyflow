import { describe, it, expect } from 'vitest'
import {
  dollarsToCents,
  centsToDollars,
  formatCurrency,
} from '../currencyUtils'

describe('currencyUtils', () => {
  describe('dollarsToCents', () => {
    it('converts whole dollars to cents', () => {
      expect(dollarsToCents(10)).toBe(1000)
      expect(dollarsToCents(1)).toBe(100)
      expect(dollarsToCents(0)).toBe(0)
    })

    it('converts dollars with cents to integer cents', () => {
      expect(dollarsToCents(10.5)).toBe(1050)
      expect(dollarsToCents(1.23)).toBe(123)
      expect(dollarsToCents(0.01)).toBe(1)
    })

    it('rounds half-cents correctly', () => {
      expect(dollarsToCents(10.555)).toBe(1056) // Round up
      expect(dollarsToCents(10.554)).toBe(1055) // Round down
      expect(dollarsToCents(10.545)).toBe(1055) // Banker's rounding
    })

    it('handles negative amounts', () => {
      expect(dollarsToCents(-10.5)).toBe(-1050)
      expect(dollarsToCents(-0.01)).toBe(-1)
    })

    it('handles very small amounts', () => {
      expect(dollarsToCents(0.001)).toBe(0)
      expect(dollarsToCents(0.005)).toBe(1)
    })

    it('handles large amounts', () => {
      expect(dollarsToCents(1000000.99)).toBe(100000099)
      expect(dollarsToCents(9999999.99)).toBe(999999999)
    })
  })

  describe('centsToDollars', () => {
    it('converts whole cents to dollars', () => {
      expect(centsToDollars(1000)).toBe(10)
      expect(centsToDollars(100)).toBe(1)
      expect(centsToDollars(0)).toBe(0)
    })

    it('converts cents to dollars with decimals', () => {
      expect(centsToDollars(1050)).toBe(10.5)
      expect(centsToDollars(123)).toBe(1.23)
      expect(centsToDollars(1)).toBe(0.01)
    })

    it('handles negative amounts', () => {
      expect(centsToDollars(-1050)).toBe(-10.5)
      expect(centsToDollars(-1)).toBe(-0.01)
    })

    it('handles large amounts', () => {
      expect(centsToDollars(100000099)).toBe(1000000.99)
    })
  })

  describe('formatCurrency', () => {
    it('formats positive amounts correctly', () => {
      expect(formatCurrency(1000)).toBe('$10.00')
      expect(formatCurrency(1050)).toBe('$10.50')
      expect(formatCurrency(123)).toBe('$1.23')
      expect(formatCurrency(1)).toBe('$0.01')
      expect(formatCurrency(0)).toBe('$0.00')
    })

    it('formats negative amounts correctly', () => {
      expect(formatCurrency(-1000)).toBe('-$10.00')
      expect(formatCurrency(-1050)).toBe('-$10.50')
      expect(formatCurrency(-1)).toBe('-$0.01')
    })

    it('formats large amounts with commas', () => {
      expect(formatCurrency(100000)).toBe('$1,000.00')
      expect(formatCurrency(100000099)).toBe('$1,000,000.99')
      expect(formatCurrency(123456789)).toBe('$1,234,567.89')
    })

    it('always shows two decimal places', () => {
      expect(formatCurrency(100)).toBe('$1.00')
      expect(formatCurrency(1050)).toBe('$10.50')
      expect(formatCurrency(10500)).toBe('$105.00')
    })
  })

  describe('round-trip conversion', () => {
    it('maintains precision when converting back and forth', () => {
      const amounts = [0, 1.23, 10.5, 100, 1000, 1000000.99]

      amounts.forEach((dollars) => {
        const cents = dollarsToCents(dollars)
        const backToDollars = centsToDollars(cents)
        expect(backToDollars).toBe(dollars)
      })
    })

    it('handles amounts that would have floating point errors', () => {
      // These are known to cause floating point issues
      const problemAmounts = [0.1, 0.2, 0.3, 19.99, 99.99]

      problemAmounts.forEach((dollars) => {
        const cents = dollarsToCents(dollars)
        const backToDollars = centsToDollars(cents)
        // Should be equal within floating point tolerance
        expect(Math.abs(backToDollars - dollars)).toBeLessThan(0.001)
      })
    })
  })
})
