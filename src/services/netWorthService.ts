import type { Result, StorageError } from '@/types/common'
import type {
  NetWorthCalculation,
  NetWorthSnapshot,
  NetWorthDateRange,
} from '@/types/netWorth'
import * as storageService from './storageService'
import { formatDate } from '@/utils/dateUtils'

/**
 * Calculate current net worth from all active accounts
 */
export async function calculateNetWorth(): Promise<
  Result<NetWorthCalculation, StorageError>
> {
  const accountsResult = await storageService.getAccounts()

  if (!accountsResult.success) {
    return {
      success: false,
      error: {
        code: 'STORAGE_ERROR',
        message: 'Failed to load accounts',
        details: accountsResult.error.message,
      },
    }
  }

  const activeAccounts = accountsResult.data.filter(
    (account) => account.status === 'active'
  )

  const totalAssets = activeAccounts
    .filter((account) => account.type === 'asset')
    .reduce((sum, account) => sum + account.balance, 0)

  const totalLiabilities = activeAccounts
    .filter((account) => account.type === 'liability')
    .reduce((sum, account) => sum + account.balance, 0)

  const assetCount = activeAccounts.filter(
    (account) => account.type === 'asset'
  ).length

  const liabilityCount = activeAccounts.filter(
    (account) => account.type === 'liability'
  ).length

  return {
    success: true,
    data: {
      totalAssets,
      totalLiabilities,
      netWorth: totalAssets - totalLiabilities,
      assetCount,
      liabilityCount,
      calculatedAt: new Date().toISOString(),
    },
  }
}

/**
 * Create a new net worth snapshot
 * Calculates current net worth and saves it as a snapshot
 */
export async function createSnapshot(): Promise<
  Result<NetWorthSnapshot, StorageError>
> {
  const calculationResult = await calculateNetWorth()

  if (!calculationResult.success) {
    return calculationResult
  }

  const snapshot: NetWorthSnapshot = {
    id: crypto.randomUUID(),
    date: formatDate(new Date(), 'yyyy-MM-dd'),
    totalAssets: calculationResult.data.totalAssets,
    totalLiabilities: calculationResult.data.totalLiabilities,
    netWorth: calculationResult.data.netWorth,
    createdAt: new Date().toISOString(),
  }

  const saveResult = await storageService.saveNetWorthSnapshot(snapshot)

  if (!saveResult.success) {
    return {
      success: false,
      error: {
        code: 'STORAGE_ERROR',
        message: 'Failed to save snapshot',
        details: saveResult.error.message,
      },
    }
  }

  return {
    success: true,
    data: snapshot,
  }
}

/**
 * Get net worth history snapshots
 * Optionally filter by date range
 */
export async function getNetWorthHistory(
  dateRange?: NetWorthDateRange
): Promise<Result<NetWorthSnapshot[], StorageError>> {
  const snapshotsResult = await storageService.getNetWorthSnapshots()

  if (!snapshotsResult.success) {
    return {
      success: false,
      error: {
        code: 'STORAGE_ERROR',
        message: 'Failed to load snapshots',
        details: snapshotsResult.error.message,
      },
    }
  }

  let snapshots = snapshotsResult.data

  // Filter by date range if provided
  if (dateRange) {
    snapshots = snapshots.filter((snapshot) => {
      return (
        snapshot.date >= dateRange.startDate &&
        snapshot.date <= dateRange.endDate
      )
    })
  }

  // Sort by date ascending
  const sorted = [...snapshots].sort((a, b) => a.date.localeCompare(b.date))

  return {
    success: true,
    data: sorted,
  }
}
