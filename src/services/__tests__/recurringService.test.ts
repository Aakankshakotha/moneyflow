import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createRecurring,
  listRecurring,
  getRecurring,
  updateRecurring,
  deleteRecurring,
  processRecurring,
  shouldProcessRecurring,
} from '../recurringService'
import * as storageService from '../storageService'
import * as transactionService from '../transactionService'
import type {
  RecurringTransaction,
  CreateRecurringDto,
  UpdateRecurringDto,
} from '../../types/recurring'

// Mock the storage service
vi.mock('../storageService', () => ({
  getRecurringTransactions: vi.fn(),
  saveRecurringTransaction: vi.fn(),
  deleteRecurringTransaction: vi.fn(),
}))

// Mock transaction service
vi.mock('../transactionService', () => ({
  recordTransaction: vi.fn(),
}))

// Mock UUID generation
vi.mock('crypto', () => ({
  default: {
    randomUUID: () => '123e4567-e89b-12d3-a456-426614174000',
  },
  randomUUID: () => '123e4567-e89b-12d3-a456-426614174000',
}))

describe('recurringService', () => {
  const mockRecurring: RecurringTransaction = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    fromAccountId: 'acc-from-123',
    toAccountId: 'acc-to-456',
    amount: 150000, // $1500.00
    description: 'Monthly rent payment',
    frequency: 'monthly',
    status: 'active',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Default: return empty array
    vi.mocked(storageService.getRecurringTransactions).mockResolvedValue({
      success: true,
      data: [],
    })
    vi.mocked(storageService.saveRecurringTransaction).mockImplementation(
      async (recurring) => ({
        success: true,
        data: recurring,
      })
    )
    vi.mocked(storageService.deleteRecurringTransaction).mockResolvedValue({
      success: true,
      data: void 0,
    })
  })

  describe('createRecurring', () => {
    it('should create a new recurring transaction successfully', async () => {
      const dto: CreateRecurringDto = {
        fromAccountId: 'acc-from-123',
        toAccountId: 'acc-to-456',
        amount: 150000,
        description: 'Monthly rent payment',
        frequency: 'monthly',
      }

      const result = await createRecurring(dto)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.fromAccountId).toBe(dto.fromAccountId)
        expect(result.data.toAccountId).toBe(dto.toAccountId)
        expect(result.data.amount).toBe(dto.amount)
        expect(result.data.description).toBe(dto.description)
        expect(result.data.frequency).toBe(dto.frequency)
        expect(result.data.status).toBe('active')
        expect(result.data.id).toBeDefined()
        expect(result.data.createdAt).toBeDefined()
        expect(result.data.updatedAt).toBeDefined()
        expect(storageService.saveRecurringTransaction).toHaveBeenCalledWith(
          result.data
        )
      }
    })

    it('should fail when fromAccountId equals toAccountId', async () => {
      const dto: CreateRecurringDto = {
        fromAccountId: 'same-account',
        toAccountId: 'same-account',
        amount: 10000,
        description: 'Invalid transfer',
        frequency: 'monthly',
      }

      const result = await createRecurring(dto)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe('SAME_ACCOUNT')
        expect(result.error.message).toContain('same account')
      }
    })

    it('should fail when amount is zero', async () => {
      const dto: CreateRecurringDto = {
        fromAccountId: 'acc-from',
        toAccountId: 'acc-to',
        amount: 0,
        description: 'Zero amount',
        frequency: 'monthly',
      }

      const result = await createRecurring(dto)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toMatch(/INVALID_/)
      }
    })

    it('should fail when amount is negative', async () => {
      const dto: CreateRecurringDto = {
        fromAccountId: 'acc-from',
        toAccountId: 'acc-to',
        amount: -5000,
        description: 'Negative amount',
        frequency: 'weekly',
      }

      const result = await createRecurring(dto)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toMatch(/INVALID_/)
      }
    })
  })

  describe('listRecurring', () => {
    it('should return all recurring transactions', async () => {
      const mockRecurrings = [mockRecurring]
      vi.mocked(storageService.getRecurringTransactions).mockResolvedValue({
        success: true,
        data: mockRecurrings,
      })

      const result = await listRecurring()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(mockRecurrings)
      }
    })

    it('should return empty array when no recurring transactions exist', async () => {
      vi.mocked(storageService.getRecurringTransactions).mockResolvedValue({
        success: true,
        data: [],
      })

      const result = await listRecurring()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual([])
      }
    })

    it('should filter by status when provided', async () => {
      const activeRecurring = { ...mockRecurring, status: 'active' as const }
      const pausedRecurring = {
        ...mockRecurring,
        id: 'rec-2',
        status: 'paused' as const,
      }
      vi.mocked(storageService.getRecurringTransactions).mockResolvedValue({
        success: true,
        data: [activeRecurring, pausedRecurring],
      })

      const result = await listRecurring({ status: 'active' })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(1)
        expect(result.data[0].status).toBe('active')
      }
    })
  })

  describe('getRecurring', () => {
    it('should return a recurring transaction by ID', async () => {
      vi.mocked(storageService.getRecurringTransactions).mockResolvedValue({
        success: true,
        data: [mockRecurring],
      })

      const result = await getRecurring(mockRecurring.id)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(mockRecurring)
      }
    })

    it('should fail when recurring transaction not found', async () => {
      vi.mocked(storageService.getRecurringTransactions).mockResolvedValue({
        success: true,
        data: [],
      })

      const result = await getRecurring('non-existent-id')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND')
      }
    })
  })

  describe('updateRecurring', () => {
    it('should update recurring transaction amount', async () => {
      vi.mocked(storageService.getRecurringTransactions).mockResolvedValue({
        success: true,
        data: [mockRecurring],
      })

      const updates: UpdateRecurringDto = { amount: 200000 }
      const result = await updateRecurring(mockRecurring.id, updates)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.amount).toBe(200000)
        expect(result.data.updatedAt).not.toBe(mockRecurring.updatedAt)
      }
    })

    it('should update recurring transaction status', async () => {
      vi.mocked(storageService.getRecurringTransactions).mockResolvedValue({
        success: true,
        data: [mockRecurring],
      })

      const updates: UpdateRecurringDto = { status: 'paused' }
      const result = await updateRecurring(mockRecurring.id, updates)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.status).toBe('paused')
      }
    })

    it('should fail when recurring transaction not found', async () => {
      vi.mocked(storageService.getRecurringTransactions).mockResolvedValue({
        success: true,
        data: [],
      })

      const result = await updateRecurring('non-existent-id', {
        amount: 10000,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND')
      }
    })

    it('should fail when updating amount to zero', async () => {
      vi.mocked(storageService.getRecurringTransactions).mockResolvedValue({
        success: true,
        data: [mockRecurring],
      })

      const result = await updateRecurring(mockRecurring.id, {
        amount: 0,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toMatch(/INVALID_/)
      }
    })
  })

  describe('deleteRecurring', () => {
    it('should delete a recurring transaction successfully', async () => {
      vi.mocked(storageService.getRecurringTransactions).mockResolvedValue({
        success: true,
        data: [mockRecurring],
      })

      const result = await deleteRecurring(mockRecurring.id)

      expect(result.success).toBe(true)
      expect(storageService.deleteRecurringTransaction).toHaveBeenCalledWith(
        mockRecurring.id
      )
    })

    it('should fail when recurring transaction not found', async () => {
      vi.mocked(storageService.getRecurringTransactions).mockResolvedValue({
        success: true,
        data: [],
      })

      const result = await deleteRecurring('non-existent-id')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND')
      }
    })
  })

  describe('processRecurring', () => {
    it('should process a recurring transaction and create a transaction', async () => {
      const recurring = { ...mockRecurring, lastProcessedDate: undefined }
      vi.mocked(storageService.getRecurringTransactions).mockResolvedValue({
        success: true,
        data: [recurring],
      })
      vi.mocked(storageService.saveRecurringTransaction).mockImplementation(
        async (rec) => ({
          success: true,
          data: rec,
        })
      )
      vi.mocked(transactionService.recordTransaction).mockResolvedValue({
        success: true,
        data: {
          id: 'txn-123',
          fromAccountId: recurring.fromAccountId,
          toAccountId: recurring.toAccountId,
          amount: recurring.amount,
          description: `${recurring.description} (Recurring)`,
          date: '2024-02-01',
          createdAt: new Date().toISOString(),
        },
      })

      const result = await processRecurring(recurring.id, '2024-02-01')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.recurringTransactionId).toBe(recurring.id)
        expect(result.data.processedDate).toBe('2024-02-01')
        expect(result.data.transactionId).toBeDefined()
      }
    })

    it('should fail when recurring transaction not found', async () => {
      vi.mocked(storageService.getRecurringTransactions).mockResolvedValue({
        success: true,
        data: [],
      })

      const result = await processRecurring('non-existent-id', '2024-02-01')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND')
      }
    })

    it('should fail when recurring transaction is paused', async () => {
      const pausedRecurring = { ...mockRecurring, status: 'paused' as const }
      vi.mocked(storageService.getRecurringTransactions).mockResolvedValue({
        success: true,
        data: [pausedRecurring],
      })

      const result = await processRecurring(pausedRecurring.id, '2024-02-01')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe('RECURRING_PAUSED')
        expect(result.error.message).toContain('paused')
      }
    })

    it('should fail with invalid date format', async () => {
      vi.mocked(storageService.getRecurringTransactions).mockResolvedValue({
        success: true,
        data: [mockRecurring],
      })

      const result = await processRecurring(mockRecurring.id, 'invalid-date')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toMatch(/INVALID_/)
      }
    })
  })

  describe('shouldProcessRecurring', () => {
    it('should indicate processing needed for daily frequency', async () => {
      const dailyRecurring = {
        ...mockRecurring,
        frequency: 'daily' as const,
        lastProcessedDate: '2024-01-01',
      }
      vi.mocked(storageService.getRecurringTransactions).mockResolvedValue({
        success: true,
        data: [dailyRecurring],
      })

      const result = await shouldProcessRecurring(
        dailyRecurring.id,
        '2024-01-02'
      )

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.needsProcessing).toBe(true)
      }
    })

    it('should indicate processing needed for weekly frequency', async () => {
      const weeklyRecurring = {
        ...mockRecurring,
        frequency: 'weekly' as const,
        lastProcessedDate: '2024-01-01',
      }
      vi.mocked(storageService.getRecurringTransactions).mockResolvedValue({
        success: true,
        data: [weeklyRecurring],
      })

      const result = await shouldProcessRecurring(
        weeklyRecurring.id,
        '2024-01-08'
      )

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.needsProcessing).toBe(true)
      }
    })

    it('should indicate processing needed for monthly frequency', async () => {
      const monthlyRecurring = {
        ...mockRecurring,
        frequency: 'monthly' as const,
        lastProcessedDate: '2024-01-01',
      }
      vi.mocked(storageService.getRecurringTransactions).mockResolvedValue({
        success: true,
        data: [monthlyRecurring],
      })

      const result = await shouldProcessRecurring(
        monthlyRecurring.id,
        '2024-02-01'
      )

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.needsProcessing).toBe(true)
      }
    })

    it('should indicate processing not needed when already processed recently', async () => {
      const recentRecurring = {
        ...mockRecurring,
        frequency: 'monthly' as const,
        lastProcessedDate: '2024-01-15',
      }
      vi.mocked(storageService.getRecurringTransactions).mockResolvedValue({
        success: true,
        data: [recentRecurring],
      })

      const result = await shouldProcessRecurring(
        recentRecurring.id,
        '2024-01-20'
      )

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.needsProcessing).toBe(false)
      }
    })
  })
})
