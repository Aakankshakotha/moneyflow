import type { InvestmentSnapshot } from '@/types/investment'
import * as storageService from './storageService'

/**
 * Record the current value of an investment account as a snapshot.
 * One snapshot per account per calendar day — later calls overwrite the earlier
 * one so you always have the "end of day" value.
 */
export async function recordSnapshot(
  accountId: string,
  value: number,
  costBasis: number
): Promise<void> {
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  const snapshot: InvestmentSnapshot = {
    id: crypto.randomUUID(),
    accountId,
    date: today,
    value,
    costBasis,
    createdAt: new Date().toISOString(),
  }
  await storageService.saveInvestmentSnapshot(snapshot)
}

/**
 * Load all snapshots for one account, sorted oldest → newest.
 */
export async function getSnapshotsForAccount(
  accountId: string
): Promise<InvestmentSnapshot[]> {
  const result = await storageService.getInvestmentSnapshots(accountId)
  return result.success ? result.data : []
}

/**
 * Load snapshots for multiple accounts at once.
 * Returns a map of accountId → sorted snapshot array.
 */
export async function getSnapshotsForAccounts(
  accountIds: string[]
): Promise<Map<string, InvestmentSnapshot[]>> {
  const result = await storageService.getInvestmentSnapshots()
  if (!result.success) return new Map()

  const map = new Map<string, InvestmentSnapshot[]>()
  for (const id of accountIds) {
    map.set(
      id,
      result.data
        .filter((s) => s.accountId === id)
        .sort((a, b) => a.date.localeCompare(b.date))
    )
  }
  return map
}
