import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as transactionService from '../transactionService'
import * as storageService from '../storageService'
import * as accountService from '../accountService'
import type { Account } from '@/types/account'
import type { Transaction, CreateTransactionDto } from '@/types/transaction'

// Mock storage and account services
vi.mock('../storageService')
vi.mock('../accountService')

describe('TransactionService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('recordTransaction', () => {
    it('should create transaction and update both account balances', async () => {
      const fromId = crypto.randomUUID()
      const toId = crypto.randomUUID()

      const fromAccount: Account = {
        id: fromId,
        name: 'Checking',
        type: 'asset',
        balance: 100000, // $1000
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const toAccount: Account = {
        id: toId,
        name: 'Savings',
        type: 'asset',
        balance: 50000, // $500
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      vi.mocked(accountService.getAccount)
        .mockResolvedValueOnce({ success: true, data: fromAccount })
        .mockResolvedValueOnce({ success: true, data: toAccount })

      vi.mocked(storageService.saveAccount)
        .mockResolvedValueOnce({
          success: true,
          data: { ...fromAccount, balance: 80000 },
        })
        .mockResolvedValueOnce({
          success: true,
          data: { ...toAccount, balance: 70000 },
        })

      vi.mocked(storageService.saveTransaction).mockResolvedValue({
        success: true,
        data: {} as Transaction,
      })

      const dto: CreateTransactionDto = {
        fromAccountId: fromId,
        toAccountId: toId,
        amount: 20000, // $200
        description: 'Transfer to savings',
        date: '2026-02-18',
      }

      const result = await transactionService.recordTransaction(dto)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.fromAccountId).toBe(fromId)
        expect(result.data.toAccountId).toBe(toId)
        expect(result.data.amount).toBe(20000)
        expect(result.data.description).toBe('Transfer to savings')
      }

      // Verify account balance updates
      expect(storageService.saveAccount).toHaveBeenCalledWith(
        expect.objectContaining({
          id: fromId,
          balance: 80000,
        })
      )
      expect(storageService.saveAccount).toHaveBeenCalledWith(
        expect.objectContaining({
          id: toId,
          balance: 70000,
        })
      )
    })

    it('should reject negative amounts', async () => {
      const dto: CreateTransactionDto = {
        fromAccountId: crypto.randomUUID(),
        toAccountId: crypto.randomUUID(),
        amount: -100,
        description: 'Test',
        date: '2026-02-18',
      }

      const result = await transactionService.recordTransaction(dto)

      expect(result.success).toBe(false)
      if (!result.success && 'field' in result.error) {
        expect(result.error.field).toBe('amount')
      }
    })

    it('should reject transaction if same from and to account', async () => {
      const sameId = crypto.randomUUID()
      const dto: CreateTransactionDto = {
        fromAccountId: sameId,
        toAccountId: sameId,
        amount: 10000,
        description: 'Test',
        date: '2026-02-18',
      }

      const result = await transactionService.recordTransaction(dto)

      expect(result.success).toBe(false)
      if (!result.success && 'field' in result.error) {
        expect(result.error.code).toBe('SAME_ACCOUNT')
      }
    })

    it('should reject if from account does not exist', async () => {
      vi.mocked(accountService.getAccount).mockResolvedValue({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Account not found' },
      })

      const dto: CreateTransactionDto = {
        fromAccountId: 'invalid-id',
        toAccountId: 'to-id',
        amount: 10000,
        description: 'Test',
        date: '2026-02-18',
      }

      const result = await transactionService.recordTransaction(dto)

      expect(result.success).toBe(false)
    })

    it('should reject if from account has insufficient balance', async () => {
      const fromId = crypto.randomUUID()
      const toId = crypto.randomUUID()

      const fromAccount: Account = {
        id: fromId,
        name: 'Checking',
        type: 'asset',
        balance: 5000, // Only $50
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const toAccount: Account = {
        id: toId,
        name: 'Savings',
        type: 'asset',
        balance: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      vi.mocked(accountService.getAccount)
        .mockResolvedValueOnce({ success: true, data: fromAccount })
        .mockResolvedValueOnce({ success: true, data: toAccount })

      const dto: CreateTransactionDto = {
        fromAccountId: fromId,
        toAccountId: toId,
        amount: 10000, // $100
        description: 'Test',
        date: '2026-02-18',
      }

      const result = await transactionService.recordTransaction(dto)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe('INSUFFICIENT_BALANCE')
      }
    })

    it('should allow income source account even when balance is zero', async () => {
      const fromId = crypto.randomUUID()
      const toId = crypto.randomUUID()

      const fromAccount: Account = {
        id: fromId,
        name: 'Salary',
        type: 'income',
        balance: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const toAccount: Account = {
        id: toId,
        name: 'Checking',
        type: 'asset',
        balance: 100000,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      vi.mocked(accountService.getAccount)
        .mockResolvedValueOnce({ success: true, data: fromAccount })
        .mockResolvedValueOnce({ success: true, data: toAccount })

      vi.mocked(storageService.saveAccount)
        .mockResolvedValueOnce({
          success: true,
          data: { ...fromAccount, balance: -500000 },
        })
        .mockResolvedValueOnce({
          success: true,
          data: { ...toAccount, balance: 600000 },
        })

      vi.mocked(storageService.saveTransaction).mockResolvedValue({
        success: true,
        data: {} as Transaction,
      })

      const dto: CreateTransactionDto = {
        fromAccountId: fromId,
        toAccountId: toId,
        amount: 500000,
        description: 'Monthly salary',
        date: '2026-02-19',
      }

      const result = await transactionService.recordTransaction(dto)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.description).toBe('Monthly salary')
      }
    })

    it('should reject when expense account is used as source', async () => {
      const fromId = crypto.randomUUID()
      const toId = crypto.randomUUID()

      const fromAccount: Account = {
        id: fromId,
        name: 'Rent',
        type: 'expense',
        balance: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const toAccount: Account = {
        id: toId,
        name: 'Checking',
        type: 'asset',
        balance: 100000,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      vi.mocked(accountService.getAccount)
        .mockResolvedValueOnce({ success: true, data: fromAccount })
        .mockResolvedValueOnce({ success: true, data: toAccount })

      const dto: CreateTransactionDto = {
        fromAccountId: fromId,
        toAccountId: toId,
        amount: 10000,
        description: 'Invalid direction',
        date: '2026-02-19',
      }

      const result = await transactionService.recordTransaction(dto)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_DIRECTION')
      }
    })

    it('should reject when income account is used as destination', async () => {
      const fromId = crypto.randomUUID()
      const toId = crypto.randomUUID()

      const fromAccount: Account = {
        id: fromId,
        name: 'Checking',
        type: 'asset',
        balance: 100000,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const toAccount: Account = {
        id: toId,
        name: 'Salary',
        type: 'income',
        balance: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      vi.mocked(accountService.getAccount)
        .mockResolvedValueOnce({ success: true, data: fromAccount })
        .mockResolvedValueOnce({ success: true, data: toAccount })

      const dto: CreateTransactionDto = {
        fromAccountId: fromId,
        toAccountId: toId,
        amount: 10000,
        description: 'Invalid direction',
        date: '2026-02-19',
      }

      const result = await transactionService.recordTransaction(dto)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_DIRECTION')
      }
    })
  })

  describe('listTransactions', () => {
    it('should return all transactions when no filter provided', async () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          fromAccountId: 'from-1',
          toAccountId: 'to-1',
          amount: 10000,
          description: 'Transaction 1',
          date: '2026-02-18',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          fromAccountId: 'from-2',
          toAccountId: 'to-2',
          amount: 20000,
          description: 'Transaction 2',
          date: '2026-02-17',
          createdAt: new Date().toISOString(),
        },
      ]

      vi.mocked(storageService.getTransactions).mockResolvedValue({
        success: true,
        data: transactions,
      })

      const result = await transactionService.listTransactions()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(2)
      }
    })

    it('should filter by account ID', async () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          fromAccountId: 'acc-1',
          toAccountId: 'acc-2',
          amount: 10000,
          description: 'Transaction 1',
          date: '2026-02-18',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          fromAccountId: 'acc-2',
          toAccountId: 'acc-3',
          amount: 20000,
          description: 'Transaction 2',
          date: '2026-02-17',
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          fromAccountId: 'acc-3',
          toAccountId: 'acc-4',
          amount: 30000,
          description: 'Transaction 3',
          date: '2026-02-16',
          createdAt: new Date().toISOString(),
        },
      ]

      vi.mocked(storageService.getTransactions).mockResolvedValue({
        success: true,
        data: transactions,
      })

      const result = await transactionService.listTransactions({
        accountId: 'acc-2',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(2)
        expect(result.data[0].id).toBe('1')
        expect(result.data[1].id).toBe('2')
      }
    })

    it('should filter by date range', async () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          fromAccountId: 'acc-1',
          toAccountId: 'acc-2',
          amount: 10000,
          description: 'Transaction 1',
          date: '2026-02-18',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          fromAccountId: 'acc-2',
          toAccountId: 'acc-3',
          amount: 20000,
          description: 'Transaction 2',
          date: '2026-02-10',
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          fromAccountId: 'acc-3',
          toAccountId: 'acc-4',
          amount: 30000,
          description: 'Transaction 3',
          date: '2026-01-15',
          createdAt: new Date().toISOString(),
        },
      ]

      vi.mocked(storageService.getTransactions).mockResolvedValue({
        success: true,
        data: transactions,
      })

      const result = await transactionService.listTransactions({
        startDate: '2026-02-01',
        endDate: '2026-02-28',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(2)
      }
    })

    it('should search by description', async () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          fromAccountId: 'acc-1',
          toAccountId: 'acc-2',
          amount: 10000,
          description: 'Grocery shopping',
          date: '2026-02-18',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          fromAccountId: 'acc-2',
          toAccountId: 'acc-3',
          amount: 20000,
          description: 'Rent payment',
          date: '2026-02-17',
          createdAt: new Date().toISOString(),
        },
      ]

      vi.mocked(storageService.getTransactions).mockResolvedValue({
        success: true,
        data: transactions,
      })

      const result = await transactionService.listTransactions({
        searchTerm: 'grocery',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(1)
        expect(result.data[0].description).toBe('Grocery shopping')
      }
    })
  })

  describe('deleteTransaction', () => {
    it('should delete transaction and reverse balance changes', async () => {
      const fromId = crypto.randomUUID()
      const toId = crypto.randomUUID()
      const txnId = crypto.randomUUID()

      const transaction: Transaction = {
        id: txnId,
        fromAccountId: fromId,
        toAccountId: toId,
        amount: 20000,
        description: 'Test',
        date: '2026-02-18',
        createdAt: new Date().toISOString(),
      }

      // After transaction: from has 80000, to has 70000
      // Before transaction: from had 100000, to had 50000
      const fromAccount: Account = {
        id: fromId,
        name: 'Checking',
        type: 'asset',
        balance: 80000, // Current balance (after transaction)
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const toAccount: Account = {
        id: toId,
        name: 'Savings',
        type: 'asset',
        balance: 70000, // Current balance (after transaction)
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      vi.mocked(storageService.getTransaction).mockResolvedValue({
        success: true,
        data: transaction,
      })

      vi.mocked(accountService.getAccount)
        .mockResolvedValueOnce({ success: true, data: fromAccount })
        .mockResolvedValueOnce({ success: true, data: toAccount })

      vi.mocked(storageService.saveAccount)
        .mockResolvedValueOnce({
          success: true,
          data: { ...fromAccount, balance: 100000 },
        })
        .mockResolvedValueOnce({
          success: true,
          data: { ...toAccount, balance: 50000 },
        })

      vi.mocked(storageService.deleteTransaction).mockResolvedValue({
        success: true,
        data: undefined,
      })

      const result = await transactionService.deleteTransaction(txnId)

      expect(result.success).toBe(true)

      // Verify reverse balance updates (add 20000 to from, subtract 20000 from to)
      expect(storageService.saveAccount).toHaveBeenCalledWith(
        expect.objectContaining({
          id: fromId,
          balance: 100000, // 80000 + 20000
        })
      )
      expect(storageService.saveAccount).toHaveBeenCalledWith(
        expect.objectContaining({
          id: toId,
          balance: 50000, // 70000 - 20000
        })
      )
    })

    it('should return error if transaction not found', async () => {
      vi.mocked(storageService.getTransaction).mockResolvedValue({
        success: false,
        error: {
          type: 'NotFoundError',
          message: 'Transaction not found',
        },
      })

      const result = await transactionService.deleteTransaction('invalid-id')

      expect(result.success).toBe(false)
    })
  })
})
