import {
  format,
  parseISO,
  parse,
  isValid,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isAfter,
  isBefore,
  isEqual,
} from 'date-fns'

/**
 * Formats a Date object to a string using the specified format
 * @param date - The date to format
 * @param formatStr - The format string (default: 'yyyy-MM-dd')
 * @returns Formatted date string
 * @throws Error if date is invalid
 */
export function formatDate(
  date: Date,
  formatStr: string = 'yyyy-MM-dd'
): string {
  if (!isValidDate(date)) {
    throw new Error('Invalid date')
  }
  return format(date, formatStr)
}

/**
 * Parses a date string to a Date object
 * @param dateString - The date string to parse
 * @param formatStr - The format string (default: ISO format)
 * @returns Parsed Date object
 * @throws Error if date string is invalid
 */
export function parseDate(dateString: string, formatStr?: string): Date {
  if (!dateString || dateString.trim() === '') {
    throw new Error('Invalid date string')
  }

  let date: Date
  if (formatStr) {
    date = parse(dateString, formatStr, new Date())
  } else {
    date = parseISO(dateString)
  }

  if (!isValid(date)) {
    throw new Error('Invalid date string')
  }

  return date
}

/**
 * Checks if a value is a valid Date object
 * @param date - The value to check
 * @returns True if valid Date, false otherwise
 */
export function isValidDate(date: unknown): date is Date {
  return date instanceof Date && isValid(date)
}

/**
 * Type for date range frequency
 */
type DateRangeFrequency = 'day' | 'week' | 'month' | 'year'

/**
 * Generates an array of dates from start to end at the specified frequency
 * @param start - Start date
 * @param end - End date
 * @param frequency - Frequency of dates ('day' | 'week' | 'month' | 'year')
 * @returns Array of dates
 * @throws Error if dates are invalid or start is after end
 */
export function getDateRange(
  start: Date,
  end: Date,
  frequency: DateRangeFrequency
): Date[] {
  if (!isValidDate(start) || !isValidDate(end)) {
    throw new Error('Invalid date')
  }

  if (isAfter(start, end)) {
    throw new Error('Start date must be before or equal to end date')
  }

  const dates: Date[] = []
  let currentDate = new Date(start)

  // Add function based on frequency
  const addFn = {
    day: addDays,
    week: addWeeks,
    month: addMonths,
    year: addYears,
  }[frequency]

  let iteration = 0
  while (isBefore(currentDate, end) || isEqual(currentDate, end)) {
    dates.push(new Date(currentDate))
    currentDate = addFn(currentDate, 1)
    iteration++

    // Safety check to prevent infinite loops
    if (iteration > 10000) {
      throw new Error('Date range too large')
    }
  }

  return dates
}

/**
 * Gets the start of the month for a given date (first day at 00:00:00.000)
 * @param date - The date to get start of month for
 * @returns Date representing start of month
 */
export function getStartOfMonth(date: Date): Date {
  return startOfMonth(date)
}

/**
 * Gets the end of the month for a given date (last day at 23:59:59.999)
 * @param date - The date to get end of month for
 * @returns Date representing end of month
 */
export function getEndOfMonth(date: Date): Date {
  return endOfMonth(date)
}

/**
 * Gets the start of the year for a given date (Jan 1 at 00:00:00.000)
 * @param date - The date to get start of year for
 * @returns Date representing start of year
 */
export function getStartOfYear(date: Date): Date {
  return startOfYear(date)
}

/**
 * Gets the end of the year for a given date (Dec 31 at 23:59:59.999)
 * @param date - The date to get end of year for
 * @returns Date representing end of year
 */
export function getEndOfYear(date: Date): Date {
  return endOfYear(date)
}
