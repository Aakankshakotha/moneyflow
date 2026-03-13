import { useState, useMemo } from 'react'
import type { Account } from '@/types/account'
import type { Transaction } from '@/types/transaction'

export type TrendRange = 'weekly' | 'monthly' | 'yearly'

interface RangeConfig {
  label: string
  periods: number
  startDate: Date
  getBucketIndex: (date: Date) => number
}

export interface UseTrendDataReturn {
  trendRange: TrendRange
  setTrendRange: React.Dispatch<React.SetStateAction<TrendRange>>
  rangeConfig: RangeConfig
  accountTrendMap: Map<string, number[]>
  buildSparklinePoints: (values: number[]) => string
}

export const useTrendData = (
  accounts: Account[],
  transactions: Transaction[]
): UseTrendDataReturn => {
  const [trendRange, setTrendRange] = useState<TrendRange>('monthly')

  const rangeConfig = useMemo((): RangeConfig => {
    const now = new Date()

    if (trendRange === 'weekly') {
      const startDate = new Date(now)
      startDate.setDate(now.getDate() - 6)
      return {
        label: 'Weekly',
        periods: 7,
        startDate,
        getBucketIndex: (date: Date): number => {
          const dayMs = 24 * 60 * 60 * 1000
          const diff = Math.floor(
            (date.getTime() - startDate.getTime()) / dayMs
          )
          return Math.max(0, Math.min(6, diff))
        },
      }
    }

    if (trendRange === 'yearly') {
      const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1)
      return {
        label: 'Yearly',
        periods: 12,
        startDate,
        getBucketIndex: (date: Date): number =>
          (date.getFullYear() - startDate.getFullYear()) * 12 +
          (date.getMonth() - startDate.getMonth()),
      }
    }

    const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    return {
      label: 'Monthly',
      periods: 6,
      startDate,
      getBucketIndex: (date: Date): number =>
        (date.getFullYear() - startDate.getFullYear()) * 12 +
        (date.getMonth() - startDate.getMonth()),
    }
  }, [trendRange])

  const accountTrendMap = useMemo(() => {
    // Step 1: compute per-bucket deltas for each account within the window
    const deltasMap = new Map<string, number[]>()
    accounts.forEach((account) => {
      deltasMap.set(account.id, Array(rangeConfig.periods).fill(0))
    })

    transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date)
      if (transactionDate < rangeConfig.startDate) return

      const bucketIndex = rangeConfig.getBucketIndex(transactionDate)
      if (bucketIndex < 0 || bucketIndex >= rangeConfig.periods) return

      const toDeltas = deltasMap.get(transaction.toAccountId)
      if (toDeltas) toDeltas[bucketIndex] += transaction.amount

      const fromDeltas = deltasMap.get(transaction.fromAccountId)
      if (fromDeltas) fromDeltas[bucketIndex] -= transaction.amount
    })

    // Step 2: cumulative starting from the account's balance at the window start
    // startingBalance = current balance − total change within the window
    const map = new Map<string, number[]>()
    accounts.forEach((account) => {
      const deltas = deltasMap.get(account.id) ?? []
      const totalWindowChange = deltas.reduce((sum, d) => sum + d, 0)
      const startingBalance = account.balance - totalWindowChange
      let running = startingBalance
      const cumulative = deltas.map((delta) => {
        running += delta
        return running
      })
      map.set(account.id, cumulative)
    })

    return map
  }, [accounts, transactions, rangeConfig])

  const buildSparklinePoints = (values: number[]): string => {
    if (values.length === 0) return ''
    const width = 86
    const height = 24
    const padding = 3 // vertical padding so line isn't clipped at edges
    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)
    const valueRange = maxValue - minValue

    // All values equal → center a flat line
    if (valueRange === 0) {
      const midY = (height / 2).toFixed(2)
      return values
        .map((_, index) => {
          const x = (index / Math.max(values.length - 1, 1)) * width
          return `${x.toFixed(2)},${midY}`
        })
        .join(' ')
    }

    return values
      .map((value, index) => {
        const x = (index / Math.max(values.length - 1, 1)) * width
        const normalized = (value - minValue) / valueRange
        const y = height - padding - normalized * (height - padding * 2)
        return `${x.toFixed(2)},${y.toFixed(2)}`
      })
      .join(' ')
  }

  return {
    trendRange,
    setTrendRange,
    rangeConfig,
    accountTrendMap,
    buildSparklinePoints,
  }
}
