import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createAccount,
  updateAccount,
  deleteAccount,
  getAccount,
  listAccounts,
  getAccountWithBalance,
} from '../accountService'
import type {
  Account,
  AccountType,
  CreateAccountDto,
  UpdateAccountDto,
} from '@/types/account'

// Helper to generate UUID
const generateUUID = () => crypto.randomUUID()

// Mock storage service
vi.mock('../storageService', () => ({
  getAccounts: vi.fn(),
  getAccount: vi.fn(),
  saveAccount: vi.fn(),
  deleteAccount: vi.fn(),
  getTransactions: vi.fn(),
}))

import * as storageService from '../storageService'

describe('AccountService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createAccount', () => {
    it('should create an account with valid data', async () => {
      const createDto: CreateAccountDto = {
        name: 'Checking Account',
        type: 'asset' as AccountType,
        balance: 100000,
      }

      vi.mocked(storageService.getAccounts).mockResolvedValue({
        success: true,
        data: [],
      })

      const mockAccount: Account = {
        id: generateUUID(),
        name: createDto.name,
        type: createDto.type,
        balance: createDto.balance!,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      vi.mocked(storageService.saveAccount).mockResolvedValue({
        success: true,
        data: mockAccount,
      })

      const result = await createAccount(createDto)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe(createDto.name)
        expect(result.data.type).toBe(createDto.type)
        expect(result.data.balance).toBe(createDto.balance)
        expect(result.data.status).toBe('active')
      }
    })

    it('should create account with default balance of 0', async () => {
      const createDto: CreateAccountDto = {
        name: 'Savings Account',
        type: 'asset' as AccountType,
      }

      vi.mocked(storageService.getAccounts).mockResolvedValue({
        success: true,
        data: [],
      })

      const mockAccount: Account = {
        id: generateUUID(),
        name: createDto.name,
        type: createDto.type,
        balance: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      vi.mocked(storageService.saveAccount).mockResolvedValue({
        success: true,
        data: mockAccount,
      })

      const result = await createAccount(createDto)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.balance).toBe(0)
      }
    })

    it('should reject empty name', async () => {
      const createDto: CreateAccountDto = {
        name: '',
        type: 'asset' as AccountType,
      }

      const result = await createAccount(createDto)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.field).toBe('name')
        expect(result.error.code).toBe('REQUIRED_FIELD')
      }
    })

    it('should reject duplicate name within same type', async () => {
      const existingAccount: Account = {
        id: generateUUID(),
        name: 'Checking Account',
        type: 'asset',
        balance: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      vi.mocked(storageService.getAccounts).mockResolvedValue({
        success: true,
        data: [existingAccount],
      })

      const createDto: CreateAccountDto = {
        name: 'Checking Account',
        type: 'asset' as AccountType,
      }

      const result = await createAccount(createDto)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.field).toBe('name')
        expect(result.error.code).toBe('DUPLICATE_NAME')
      }
    })

    it('should allow same name across different types', async () => {
      const existingAccount: Account = {
        id: generateUUID(),
        name: 'Checking Account',
        type: 'asset',
        balance: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      vi.mocked(storageService.getAccounts).mockResolvedValue({
        success: true,
        data: [existingAccount],
      })

      const createDto: CreateAccountDto = {
        name: 'Checking Account',
        type: 'liability' as AccountType,
      }

      const mockAccount: Account = {
        id: generateUUID(),
        name: createDto.name,
        type: createDto.type,
        balance: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      vi.mocked(storageService.saveAccount).mockResolvedValue({
        success: true,
        data: mockAccount,
      })

      const result = await createAccount(createDto)

      expect(result.success).toBe(true)
    })
  })

  describe('updateAccount', () => {
    it('should update account name successfully', async () => {
      const accountId = generateUUID()
      const existingAccount: Account = {
        id: accountId,
        name: 'Old Name',
        type: 'asset',
        balance: 100000,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      vi.mocked(storageService.getAccount).mockResolvedValue({
        success: true,
        data: existingAccount,
      })

      vi.mocked(storageService.getAccounts).mockResolvedValue({
        success: true,
        data: [existingAccount],
      })

      const updateDto: UpdateAccountDto = {
        name: 'New Name',
      }

      const updatedAccount = {
        ...existingAccount,
        name: updateDto.name!,
        updatedAt: new Date().toISOString(),
      }

      vi.mocked(storageService.saveAccount).mockResolvedValue({
        success: true,
        data: updatedAccount,
      })

      const result = await updateAccount(accountId, updateDto)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe(updateDto.name)
        expect(result.data.balance).toBe(existingAccount.balance) // Balance should not change
      }
    })

    it('should update account status successfully', async () => {
      const accountId = generateUUID()
      const existingAccount: Account = {
        id: accountId,
        name: 'Test Account',
        type: 'asset',
        balance: 100000,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      vi.mocked(storageService.getAccount).mockResolvedValue({
        success: true,
        data: existingAccount,
      })

      const updateDto: UpdateAccountDto = {
        status: 'archived',
      }

      const updatedAccount = {
        ...existingAccount,
        status: updateDto.status!,
        updatedAt: new Date().toISOString(),
      }

      vi.mocked(storageService.saveAccount).mockResolvedValue({
        success: true,
        data: updatedAccount,
      })

      const result = await updateAccount(accountId, updateDto)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.status).toBe('archived')
      }
    })

    it('should update account balance successfully', async () => {
      const accountId = generateUUID()
      const existingAccount: Account = {
        id: accountId,
        name: 'Test Account',
        type: 'asset',
        balance: 100000,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      vi.mocked(storageService.getAccount).mockResolvedValue({
        success: true,
        data: existingAccount,
      })

      const updateDto: UpdateAccountDto = {
        balance: 250000,
      }

      const updatedAccount = {
        ...existingAccount,
        balance: updateDto.balance!,
        updatedAt: new Date().toISOString(),
      }

      vi.mocked(storageService.saveAccount).mockResolvedValue({
        success: true,
        data: updatedAccount,
      })

      const result = await updateAccount(accountId, updateDto)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.balance).toBe(updateDto.balance)
      }
    })

    it('should return NotFoundError if account does not exist', async () => {
      const accountId = generateUUID()

      vi.mocked(storageService.getAccount).mockResolvedValue({
        success: false,
        error: {
          type: 'NotFoundError',
          message: 'Account not found',
        },
      })

      const updateDto: UpdateAccountDto = {
        name: 'New Name',
      }

      const result = await updateAccount(accountId, updateDto)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND')
      }
    })

    it('should reject duplicate name within same type on update', async () => {
      const accountId = generateUUID()
      const existingAccount: Account = {
        id: accountId,
        name: 'Account 1',
        type: 'asset',
        balance: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const otherAccount: Account = {
        id: generateUUID(),
        name: 'Account 2',
        type: 'asset',
        balance: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      vi.mocked(storageService.getAccount).mockResolvedValue({
        success: true,
        data: existingAccount,
      })

      vi.mocked(storageService.getAccounts).mockResolvedValue({
        success: true,
        data: [existingAccount, otherAccount],
      })

      const updateDto: UpdateAccountDto = {
        name: 'Account 2', // Try to rename to existing name
      }

      const result = await updateAccount(accountId, updateDto)

      expect(result.success).toBe(false)
      if (!result.success && 'field' in result.error) {
        expect(result.error.field).toBe('name')
        expect(result.error.code).toBe('DUPLICATE_NAME')
      }
    })
  })

  describe('deleteAccount', () => {
    it('should delete archived account without transactions', async () => {
      const accountId = generateUUID()
      const existingAccount: Account = {
        id: accountId,
        name: 'Test Account',
        type: 'asset',
        balance: 0,
        status: 'archived',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      vi.mocked(storageService.getAccount).mockResolvedValue({
        success: true,
        data: existingAccount,
      })

      vi.mocked(storageService.getTransactions).mockResolvedValue({
        success: true,
        data: [],
      })

      vi.mocked(storageService.deleteAccount).mockResolvedValue({
        success: true,
        data: undefined,
      })

      const result = await deleteAccount(accountId)

      expect(result.success).toBe(true)
    })

    it('should reject deletion of active account', async () => {
      const accountId = generateUUID()
      const existingAccount: Account = {
        id: accountId,
        name: 'Test Account',
        type: 'asset',
        balance: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      vi.mocked(storageService.getAccount).mockResolvedValue({
        success: true,
        data: existingAccount,
      })

      const result = await deleteAccount(accountId)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe('ACCOUNT_ACTIVE')
      }
    })

    it('should reject deletion of account with transactions', async () => {
      const accountId = generateUUID()
      const existingAccount: Account = {
        id: accountId,
        name: 'Test Account',
        type: 'asset',
        balance: 100000,
        status: 'archived',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      vi.mocked(storageService.getAccount).mockResolvedValue({
        success: true,
        data: existingAccount,
      })

      vi.mocked(storageService.getTransactions).mockResolvedValue({
        success: true,
        data: [
          {
            id: generateUUID(),
            fromAccountId: accountId,
            toAccountId: generateUUID(),
            amount: 50000,
            description: 'Test transaction',
            date: '2026-02-17',
            createdAt: new Date().toISOString(),
          },
        ],
      })

      const result = await deleteAccount(accountId)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe('HAS_TRANSACTIONS')
      }
    })

    it('should return NotFoundError if account does not exist', async () => {
      const accountId = generateUUID()

      vi.mocked(storageService.getAccount).mockResolvedValue({
        success: false,
        error: {
          type: 'NotFoundError',
          message: 'Account not found',
        },
      })

      const result = await deleteAccount(accountId)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND')
      }
    })
  })

  describe('getAccount', () => {
    it('should return account if exists', async () => {
      const accountId = generateUUID()
      const existingAccount: Account = {
        id: accountId,
        name: 'Test Account',
        type: 'asset',
        balance: 100000,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      vi.mocked(storageService.getAccount).mockResolvedValue({
        success: true,
        data: existingAccount,
      })

      const result = await getAccount(accountId)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBe(accountId)
        expect(result.data.name).toBe(existingAccount.name)
      }
    })

    it('should return NotFoundError if account does not exist', async () => {
      const accountId = generateUUID()

      vi.mocked(storageService.getAccount).mockResolvedValue({
        success: false,
        error: {
          type: 'NotFoundError',
          message: 'Account not found',
        },
      })

      const result = await getAccount(accountId)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND')
      }
    })
  })

  describe('listAccounts', () => {
    it('should return all accounts when no filter provided', async () => {
      const accounts: Account[] = [
        {
          id: generateUUID(),
          name: 'Checking',
          type: 'asset',
          balance: 100000,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: generateUUID(),
          name: 'Savings',
          type: 'asset',
          balance: 200000,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      vi.mocked(storageService.getAccounts).mockResolvedValue({
        success: true,
        data: accounts,
      })

      const result = await listAccounts()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.length).toBe(2)
      }
    })

    it('should filter accounts by type', async () => {
      const accounts: Account[] = [
        {
          id: generateUUID(),
          name: 'Checking',
          type: 'asset',
          balance: 100000,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: generateUUID(),
          name: 'Groceries',
          type: 'expense',
          balance: 50000,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      vi.mocked(storageService.getAccounts).mockResolvedValue({
        success: true,
        data: accounts,
      })

      const result = await listAccounts({ type: 'asset' })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.length).toBe(1)
        expect(result.data[0].type).toBe('asset')
      }
    })

    it('should filter accounts by status', async () => {
      const accounts: Account[] = [
        {
          id: generateUUID(),
          name: 'Active Account',
          type: 'asset',
          balance: 100000,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: generateUUID(),
          name: 'Archived Account',
          type: 'asset',
          balance: 0,
          status: 'archived',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      vi.mocked(storageService.getAccounts).mockResolvedValue({
        success: true,
        data: accounts,
      })

      const result = await listAccounts({ status: 'active' })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.length).toBe(1)
        expect(result.data[0].status).toBe('active')
      }
    })

    it('should filter accounts by search term', async () => {
      const accounts: Account[] = [
        {
          id: generateUUID(),
          name: 'Checking Account',
          type: 'asset',
          balance: 100000,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: generateUUID(),
          name: 'Savings Account',
          type: 'asset',
          balance: 200000,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      vi.mocked(storageService.getAccounts).mockResolvedValue({
        success: true,
        data: accounts,
      })

      const result = await listAccounts({ searchTerm: 'checking' })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.length).toBe(1)
        expect(result.data[0].name).toContain('Checking')
      }
    })
  })

  describe('getAccountWithBalance', () => {
    it('should return account with transaction count', async () => {
      const accountId = generateUUID()
      const existingAccount: Account = {
        id: accountId,
        name: 'Test Account',
        type: 'asset',
        balance: 100000,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      vi.mocked(storageService.getAccount).mockResolvedValue({
        success: true,
        data: existingAccount,
      })

      vi.mocked(storageService.getTransactions).mockResolvedValue({
        success: true,
        data: [
          {
            id: generateUUID(),
            fromAccountId: accountId,
            toAccountId: generateUUID(),
            amount: 50000,
            description: 'Test transaction',
            date: '2026-02-17',
            createdAt: new Date().toISOString(),
          },
        ],
      })

      const result = await getAccountWithBalance(accountId)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBe(accountId)
        expect(result.data.transactionCount).toBe(1)
      }
    })
  })
})
