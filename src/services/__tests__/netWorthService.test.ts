import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as netWorthService from '../netWorthService'
import * as storageService from '../storageService'
import type { Account } from '@/types/account'
import type { NetWorthSnapshot } from '@/types/netWorth'

// Mock storage service
vi.mock('../storageService')

describe('NetWorthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('calculateNetWorth', () => {
    it('should calculate net worth from active accounts only', async () => {
      const accounts: Account[] = [
        {
          id: '1',
          name: 'Checking',
          type: 'asset',
          balance: 100000, // $1000
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Savings',
          type: 'asset',
          balance: 500000, // $5000
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Credit Card',
          type: 'liability',
          balance: 20000, // $200
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '4',
          name: 'Old Account',
          type: 'asset',
          balance: 100000,
          status: 'archived',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      vi.mocked(storageService.getAccounts).mockResolvedValue({
        success: true,
        data: accounts,
      })

      const result = await netWorthService.calculateNetWorth()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.totalAssets).toBe(600000) // $6000
        expect(result.data.totalLiabilities).toBe(20000) // $200
        expect(result.data.netWorth).toBe(580000) // $5800
        expect(result.data.assetCount).toBe(2)
        expect(result.data.liabilityCount).toBe(1)
        expect(result.data.calculatedAt).toBeDefined()
      }
    })

    it('should handle no accounts', async () => {
      vi.mocked(storageService.getAccounts).mockResolvedValue({
        success: true,
        data: [],
      })

      const result = await netWorthService.calculateNetWorth()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.totalAssets).toBe(0)
        expect(result.data.totalLiabilities).toBe(0)
        expect(result.data.netWorth).toBe(0)
        expect(result.data.assetCount).toBe(0)
        expect(result.data.liabilityCount).toBe(0)
      }
    })

    it('should handle storage error', async () => {
      vi.mocked(storageService.getAccounts).mockResolvedValue({
        success: false,
        error: {
          type: 'StorageError',
          message: 'Failed to load accounts',
        },
      })

      const result = await netWorthService.calculateNetWorth()

      expect(result.success).toBe(false)
    })

    it('should ignore income and expense accounts', async () => {
      const accounts: Account[] = [
        {
          id: '1',
          name: 'Checking',
          type: 'asset',
          balance: 100000,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Salary',
          type: 'income',
          balance: 500000,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Groceries',
          type: 'expense',
          balance: 20000,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      vi.mocked(storageService.getAccounts).mockResolvedValue({
        success: true,
        data: accounts,
      })

      const result = await netWorthService.calculateNetWorth()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.totalAssets).toBe(100000)
        expect(result.data.totalLiabilities).toBe(0)
        expect(result.data.netWorth).toBe(100000)
        expect(result.data.assetCount).toBe(1)
        expect(result.data.liabilityCount).toBe(0)
      }
    })
  })

  describe('createSnapshot', () => {
    it('should create and save a net worth snapshot', async () => {
      const accounts: Account[] = [
        {
          id: '1',
          name: 'Checking',
          type: 'asset',
          balance: 100000,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      vi.mocked(storageService.getAccounts).mockResolvedValue({
        success: true,
        data: accounts,
      })

      vi.mocked(storageService.saveNetWorthSnapshot).mockResolvedValue({
        success: true,
        data: {} as NetWorthSnapshot,
      })

      vi.mocked(storageService.getNetWorthSnapshots).mockResolvedValue({
        success: true,
        data: [],
      })

      const result = await netWorthService.createSnapshot()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.totalAssets).toBe(100000)
        expect(result.data.totalLiabilities).toBe(0)
        expect(result.data.netWorth).toBe(100000)
        expect(result.data.id).toBeDefined()
        expect(result.data.date).toBeDefined()
        expect(result.data.createdAt).toBeDefined()
      }

      expect(storageService.saveNetWorthSnapshot).toHaveBeenCalled()
    })

    it('should handle storage error when saving snapshot', async () => {
      const accounts: Account[] = [
        {
          id: '1',
          name: 'Checking',
          type: 'asset',
          balance: 100000,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      vi.mocked(storageService.getAccounts).mockResolvedValue({
        success: true,
        data: accounts,
      })

      vi.mocked(storageService.getNetWorthSnapshots).mockResolvedValue({
        success: true,
        data: [],
      })

      vi.mocked(storageService.saveNetWorthSnapshot).mockResolvedValue({
        success: false,
        error: {
          type: 'StorageError',
          message: 'Failed to save snapshot',
        },
      })

      const result = await netWorthService.createSnapshot()

      expect(result.success).toBe(false)
    })
  })

  describe('getNetWorthHistory', () => {
    it('should return snapshots within date range', async () => {
      const snapshots: NetWorthSnapshot[] = [
        {
          id: '1',
          date: '2026-01-01',
          totalAssets: 100000,
          totalLiabilities: 20000,
          netWorth: 80000,
          createdAt: '2026-01-01T00:00:00Z',
        },
        {
          id: '2',
          date: '2026-01-15',
          totalAssets: 120000,
          totalLiabilities: 18000,
          netWorth: 102000,
          createdAt: '2026-01-15T00:00:00Z',
        },
        {
          id: '3',
          date: '2026-02-01',
          totalAssets: 150000,
          totalLiabilities: 15000,
          netWorth: 135000,
          createdAt: '2026-02-01T00:00:00Z',
        },
      ]

      vi.mocked(storageService.getNetWorthSnapshots).mockResolvedValue({
        success: true,
        data: snapshots,
      })

      const result = await netWorthService.getNetWorthHistory({
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(2)
        expect(result.data[0].date).toBe('2026-01-01')
        expect(result.data[1].date).toBe('2026-01-15')
      }
    })

    it('should return all snapshots when no date range provided', async () => {
      const snapshots: NetWorthSnapshot[] = [
        {
          id: '1',
          date: '2026-01-01',
          totalAssets: 100000,
          totalLiabilities: 20000,
          netWorth: 80000,
          createdAt: '2026-01-01T00:00:00Z',
        },
        {
          id: '2',
          date: '2026-02-01',
          totalAssets: 150000,
          totalLiabilities: 15000,
          netWorth: 135000,
          createdAt: '2026-02-01T00:00:00Z',
        },
      ]

      vi.mocked(storageService.getNetWorthSnapshots).mockResolvedValue({
        success: true,
        data: snapshots,
      })

      const result = await netWorthService.getNetWorthHistory()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(2)
      }
    })

    it('should sort snapshots by date ascending', async () => {
      const snapshots: NetWorthSnapshot[] = [
        {
          id: '3',
          date: '2026-02-01',
          totalAssets: 150000,
          totalLiabilities: 15000,
          netWorth: 135000,
          createdAt: '2026-02-01T00:00:00Z',
        },
        {
          id: '1',
          date: '2026-01-01',
          totalAssets: 100000,
          totalLiabilities: 20000,
          netWorth: 80000,
          createdAt: '2026-01-01T00:00:00Z',
        },
        {
          id: '2',
          date: '2026-01-15',
          totalAssets: 120000,
          totalLiabilities: 18000,
          netWorth: 102000,
          createdAt: '2026-01-15T00:00:00Z',
        },
      ]

      vi.mocked(storageService.getNetWorthSnapshots).mockResolvedValue({
        success: true,
        data: snapshots,
      })

      const result = await netWorthService.getNetWorthHistory()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data[0].date).toBe('2026-01-01')
        expect(result.data[1].date).toBe('2026-01-15')
        expect(result.data[2].date).toBe('2026-02-01')
      }
    })

    it('should handle storage error', async () => {
      vi.mocked(storageService.getNetWorthSnapshots).mockResolvedValue({
        success: false,
        error: {
          type: 'StorageError',
          message: 'Failed to load snapshots',
        },
      })

      const result = await netWorthService.getNetWorthHistory()

      expect(result.success).toBe(false)
    })
  })
})
