/**
 * Currency utility functions
 * All monetary amounts are stored as integer cents to avoid floating-point errors
 */

/**
 * Converts dollar amount to cents
 * @param dollars - Amount in dollars (can have decimals)
 * @returns Amount in cents (integer)
 * @example dollarsToCents(10.50) // returns 1050
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100)
}

/**
 * Converts cents to dollar amount
 * @param cents - Amount in cents (integer)
 * @returns Amount in dollars (with decimals)
 * @example centsToDollars(1050) // returns 10.50
 */
export function centsToDollars(cents: number): number {
  return cents / 100
}

/**
 * Formats cents as currency string
 * @param cents - Amount in cents (integer)
 * @returns Formatted currency string (e.g., "$1,234.56")
 * @example formatCurrency(123456) // returns "$1,234.56"
 */
export function formatCurrency(cents: number): string {
  const dollars = centsToDollars(cents)

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars)
}

/**
 * Parses currency string to cents
 * Handles various formats: "$1,234.56", "1234.56", "$1234"
 * @param currencyString - Currency string to parse
 * @returns Amount in cents (integer) or null if invalid
 * @example parseCurrency("$1,234.56") // returns 123456
 */
export function parseCurrency(currencyString: string): number | null {
  // Remove currency symbols, commas, and spaces
  const cleaned = currencyString.replace(/[$,\s]/g, '')

  // Try to parse as number
  const parsed = parseFloat(cleaned)

  // Return null if not a valid number
  if (isNaN(parsed)) {
    return null
  }

  // Convert to cents
  return dollarsToCents(parsed)
}

/**
 * Validates that an amount in cents is valid
 * @param cents - Amount to validate
 * @returns True if valid, false otherwise
 */
export function isValidAmount(cents: number): boolean {
  // Must be a number
  if (typeof cents !== 'number') return false

  // Must be finite (not Infinity or NaN)
  if (!Number.isFinite(cents)) return false

  // Must be an integer (we store cents as integers)
  if (!Number.isInteger(cents)) return false

  // Must be non-negative for most use cases
  // (negative amounts are allowed for calculations but not for transaction amounts)
  return true
}
