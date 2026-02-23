import React, { useMemo, useState, useEffect } from 'react'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MuiSelect from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import type {
  Account,
  AccountStatus,
  CreateAccountDto,
  UpdateAccountDto,
} from '@/types/account'
import type { Transaction } from '@/types/transaction'
import { AccountForm } from '@/components/features'
import { Button } from '@/components/common'
import { formatCurrency } from '@/utils/currencyUtils'
import * as accountService from '@/services/accountService'
import * as transactionService from '@/services/transactionService'
import './Accounts.css'

/**
 * Accounts page - manage accounts (assets, liabilities, income, expenses)
 */
const Accounts: React.FC = () => {
  const [trendRange, setTrendRange] = useState<'weekly' | 'monthly' | 'yearly'>(
    'monthly'
  )
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null
  )
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load accounts on mount
  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async (): Promise<void> => {
    setLoading(true)
    setError(null)

    const [accountsResult, transactionsResult] = await Promise.all([
      accountService.listAccounts(),
      transactionService.listTransactions(),
    ])

    if (accountsResult.success) {
      setAccounts(accountsResult.data)

      setSelectedAccountId((prev) => {
        if (
          prev &&
          accountsResult.data.some((account) => account.id === prev)
        ) {
          return prev
        }

        return null
      })
    } else {
      setError('Failed to load accounts')
    }

    if (transactionsResult.success) {
      setTransactions(transactionsResult.data)
    }

    setLoading(false)
  }

  const handleCreateAccount = async (
    data: CreateAccountDto | UpdateAccountDto
  ): Promise<void> => {
    if (editingAccount) {
      // Update existing account
      const result = await accountService.updateAccount(
        editingAccount.id,
        data as UpdateAccountDto
      )

      if (result.success) {
        await loadAccounts()
        setEditingAccount(null)
        setIsFormOpen(false)
      } else {
        if ('field' in result.error) {
          alert(`Validation error: ${result.error.message}`)
        } else {
          alert(`Error: ${result.error.message}`)
        }
      }
    } else {
      // Create new account
      const result = await accountService.createAccount(
        data as CreateAccountDto
      )

      if (result.success) {
        await loadAccounts()
        setIsFormOpen(false)
      } else {
        if ('field' in result.error) {
          alert(`Validation error: ${result.error.message}`)
        } else {
          alert('Failed to create account')
        }
      }
    }
  }

  const handleEditAccount = (account: Account): void => {
    setEditingAccount(account)
    setIsFormOpen(true)
  }

  const handleDeleteAccount = async (account: Account): Promise<void> => {
    if (!confirm(`Are you sure you want to delete "${account.name}"?`)) {
      return
    }

    if (account.status === 'active') {
      const shouldArchive = confirm(
        'This account is active. It must be archived before deletion. Archive it now?'
      )

      if (!shouldArchive) {
        return
      }

      const archiveResult = await accountService.updateAccount(account.id, {
        status: 'archived',
      })

      if (!archiveResult.success) {
        alert(`Error: ${archiveResult.error.message}`)
        return
      }
    }

    const result = await accountService.deleteAccount(account.id)

    if (result.success) {
      await loadAccounts()
    } else {
      alert(`Error: ${result.error.message}`)
    }
  }

  const handleToggleAccountStatus = async (account: Account): Promise<void> => {
    const nextStatus: AccountStatus =
      account.status === 'active' ? 'archived' : 'active'

    const result = await accountService.updateAccount(account.id, {
      status: nextStatus,
    })

    if (result.success) {
      await loadAccounts()
      return
    }

    alert(`Error: ${result.error.message}`)
  }

  const handleCloseForm = (): void => {
    setIsFormOpen(false)
    setEditingAccount(null)
  }

  const selectedAccount =
    accounts.find((account) => account.id === selectedAccountId) || null

  const accountMap = new Map(accounts.map((account) => [account.id, account]))
  const activeAccounts = accounts.filter(
    (account) => account.status === 'active'
  )

  const totalAssets = activeAccounts
    .filter((account) => account.type === 'asset')
    .reduce((sum, account) => sum + account.balance, 0)

  const totalLiabilities = activeAccounts
    .filter((account) => account.type === 'liability')
    .reduce((sum, account) => sum + account.balance, 0)

  const netWorth = totalAssets - totalLiabilities

  const rangeConfig = useMemo(() => {
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
    const map = new Map<string, number[]>()

    accounts.forEach((account) => {
      map.set(account.id, Array(rangeConfig.periods).fill(0))
    })

    transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date)
      if (transactionDate < rangeConfig.startDate) {
        return
      }

      const bucketIndex = rangeConfig.getBucketIndex(transactionDate)
      if (bucketIndex < 0 || bucketIndex >= rangeConfig.periods) {
        return
      }

      const toSeries = map.get(transaction.toAccountId)
      if (toSeries) {
        toSeries[bucketIndex] += transaction.amount
      }

      const fromSeries = map.get(transaction.fromAccountId)
      if (fromSeries) {
        fromSeries[bucketIndex] -= transaction.amount
      }
    })

    map.forEach((series, accountId) => {
      let runningTotal = 0
      const cumulative = series.map((value) => {
        runningTotal += value
        return runningTotal
      })

      map.set(accountId, cumulative)
    })

    return map
  }, [accounts, transactions, rangeConfig])

  const buildSparklinePoints = (values: number[]): string => {
    if (values.length === 0) {
      return ''
    }

    const width = 86
    const height = 24
    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)
    const valueRange = Math.max(maxValue - minValue, 1)

    return values
      .map((value, index) => {
        const x = (index / Math.max(values.length - 1, 1)) * width
        const normalized = (value - minValue) / valueRange
        const y = height - normalized * height

        return `${x.toFixed(2)},${y.toFixed(2)}`
      })
      .join(' ')
  }

  const sections = [
    { type: 'asset' as const, label: 'Assets', dotClass: 'asset' },
    { type: 'liability' as const, label: 'Liabilities', dotClass: 'liability' },
    { type: 'income' as const, label: 'Income', dotClass: 'income' },
    { type: 'expense' as const, label: 'Expenses', dotClass: 'expense' },
  ]

  const monthlyTransactionsForSelected = selectedAccount
    ? transactions.filter((transaction) => {
        const currentMonth = rangeConfig.startDate
        const date = new Date(transaction.date)

        const isCurrentMonth = date >= currentMonth

        const belongsToSelected =
          transaction.fromAccountId === selectedAccount.id ||
          transaction.toAccountId === selectedAccount.id

        return isCurrentMonth && belongsToSelected
      })
    : []

  const monthlyInflow = monthlyTransactionsForSelected
    .filter(
      (transaction) =>
        selectedAccount && transaction.toAccountId === selectedAccount.id
    )
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  const monthlyOutflow = monthlyTransactionsForSelected
    .filter(
      (transaction) =>
        selectedAccount && transaction.fromAccountId === selectedAccount.id
    )
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  const recentSelectedTransactions = selectedAccount
    ? transactions
        .filter(
          (transaction) =>
            transaction.fromAccountId === selectedAccount.id ||
            transaction.toAccountId === selectedAccount.id
        )
        .slice(0, 5)
    : []

  if (loading) {
    return (
      <div className="accounts-page">
        <p>Loading accounts...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="accounts-page">
        <p className="accounts-page__error">{error}</p>
        <Button onClick={loadAccounts}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="accounts-page">
      <div className="accounts-page__header">
        <div>
          <h1 className="accounts-page__title">Accounts</h1>
          <p className="accounts-page__subtitle">
            Manage your financial buckets: Assets, Liabilities, Income, and
            Expenses.
          </p>
        </div>

        <div className="accounts-page__header-actions">
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="graph-range-label">Graph Range</InputLabel>
            <MuiSelect
              labelId="graph-range-label"
              label="Graph Range"
              value={trendRange}
              onChange={(e) =>
                setTrendRange(e.target.value as 'weekly' | 'monthly' | 'yearly')
              }
            >
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </MuiSelect>
          </FormControl>
          <Button onClick={() => setIsFormOpen(true)}>Add Account</Button>
        </div>
      </div>

      <div className="accounts-page__metrics">
        <div className="accounts-page__metric-card">
          <p className="accounts-page__metric-label">Net Worth</p>
          <p className="accounts-page__metric-value">
            {formatCurrency(netWorth)}
          </p>
        </div>
        <div className="accounts-page__metric-card">
          <p className="accounts-page__metric-label">Total Assets</p>
          <p className="accounts-page__metric-value">
            {formatCurrency(totalAssets)}
          </p>
        </div>
        <div className="accounts-page__metric-card">
          <p className="accounts-page__metric-label">Total Liabilities</p>
          <p className="accounts-page__metric-value">
            {formatCurrency(totalLiabilities)}
          </p>
        </div>
      </div>

      <div className="accounts-page__layout">
        <div className="accounts-page__left-pane">
          {sections.map((section) => {
            const sectionAccounts = activeAccounts.filter(
              (account) => account.type === section.type
            )
            const sectionTotal = sectionAccounts.reduce(
              (sum, account) => sum + Math.abs(account.balance),
              0
            )

            if (sectionAccounts.length === 0) {
              return null
            }

            const SectionIcon = {
              asset: AccountBalanceIcon,
              liability: CreditCardIcon,
              income: AttachMoneyIcon,
              expense: ReceiptLongIcon,
            }[section.type]

            return (
              <section key={section.type} className="accounts-page__section">
                <header className="accounts-page__section-header">
                  <h2 className="accounts-page__group-title">
                    <span
                      className={`accounts-page__group-dot accounts-page__group-dot--${section.dotClass}`}
                    />
                    {section.label}
                  </h2>
                  <span className="accounts-page__group-total">
                    {formatCurrency(sectionTotal)}
                  </span>
                </header>

                <div className="accounts-page__group">
                  <div className="accounts-page__rows">
                    {sectionAccounts.map((account) =>
                      (() => {
                        const trendValues =
                          accountTrendMap.get(account.id) || []
                        const sparklinePoints =
                          buildSparklinePoints(trendValues)
                        const trendStart = trendValues[0] || 0
                        const trendEnd =
                          trendValues[trendValues.length - 1] || trendStart
                        const isUpward = trendEnd >= trendStart

                        return (
                          <button
                            key={account.id}
                            type="button"
                            className={`accounts-page__row ${
                              selectedAccountId === account.id
                                ? 'accounts-page__row--active'
                                : ''
                            }`}
                            onClick={() =>
                              setSelectedAccountId((prev) =>
                                prev === account.id ? null : account.id
                              )
                            }
                          >
                            <div className="accounts-page__row-icon">
                              <SectionIcon fontSize="small" />
                            </div>
                            <div className="accounts-page__row-main">
                              <p className="accounts-page__row-name">
                                {account.name}
                              </p>
                              <p className="accounts-page__row-meta">
                                {account.parentAccountId
                                  ? `Sub-account of ${accountMap.get(account.parentAccountId)?.name || 'Unknown'}`
                                  : section.label.slice(0, -1)}
                              </p>
                            </div>
                            <div className="accounts-page__row-right">
                              <p className="accounts-page__row-amount">
                                {formatCurrency(Math.abs(account.balance))}
                              </p>
                              <svg
                                className="accounts-page__row-sparkline"
                                viewBox="0 0 86 24"
                                preserveAspectRatio="none"
                                aria-hidden="true"
                              >
                                <polyline
                                  points={sparklinePoints}
                                  fill="none"
                                  stroke={
                                    isUpward
                                      ? 'var(--success-color)'
                                      : 'var(--error-color)'
                                  }
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                          </button>
                        )
                      })()
                    )}
                  </div>
                </div>
              </section>
            )
          })}
        </div>

        <aside className="accounts-page__right-pane">
          {selectedAccount ? (
            <>
              <div className="accounts-page__detail-card">
                <div className="accounts-page__detail-header">
                  <p className="accounts-page__detail-type">
                    {selectedAccount.type.toUpperCase()}
                  </p>
                  <div className="accounts-page__detail-actions">
                    <button
                      type="button"
                      onClick={() => handleEditAccount(selectedAccount)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleAccountStatus(selectedAccount)}
                    >
                      {selectedAccount.status === 'active'
                        ? 'Archive'
                        : 'Unarchive'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAccount(selectedAccount)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <h3 className="accounts-page__detail-name">
                  {selectedAccount.name}
                </h3>
                <p className="accounts-page__detail-balance">
                  {formatCurrency(Math.abs(selectedAccount.balance))}
                </p>
                <p className="accounts-page__detail-status">
                  {selectedAccount.status === 'active'
                    ? 'Connected'
                    : 'Archived'}
                </p>
              </div>

              <div className="accounts-page__flow-card">
                <p className="accounts-page__flow-title">
                  {rangeConfig.label} Flow
                </p>
                <div className="accounts-page__flow-values">
                  <div>
                    <p className="accounts-page__flow-label">In</p>
                    <p className="accounts-page__flow-in">
                      +{formatCurrency(monthlyInflow)}
                    </p>
                  </div>
                  <div>
                    <p className="accounts-page__flow-label">Out</p>
                    <p className="accounts-page__flow-out">
                      -{formatCurrency(monthlyOutflow)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="accounts-page__history-card">
                <p className="accounts-page__history-title">History</p>
                <div className="accounts-page__history-list">
                  {recentSelectedTransactions.length > 0 ? (
                    recentSelectedTransactions.map((transaction) => {
                      const isInflow =
                        transaction.toAccountId === selectedAccount.id
                      const oppositeAccountId = isInflow
                        ? transaction.fromAccountId
                        : transaction.toAccountId

                      return (
                        <div
                          key={transaction.id}
                          className="accounts-page__history-item"
                        >
                          <div>
                            <p className="accounts-page__history-description">
                              {transaction.description}
                            </p>
                            <p className="accounts-page__history-meta">
                              {new Date(transaction.date).toLocaleDateString()}{' '}
                              •{' '}
                              {accountMap.get(oppositeAccountId)?.name ||
                                'Unknown'}
                            </p>
                          </div>
                          <p
                            className={`accounts-page__history-amount ${
                              isInflow
                                ? 'accounts-page__history-amount--in'
                                : 'accounts-page__history-amount--out'
                            }`}
                          >
                            {isInflow ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </p>
                        </div>
                      )
                    })
                  ) : (
                    <p className="accounts-page__history-empty">
                      No recent activity for this account.
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="accounts-page__empty-state">
              <p>
                No accounts available yet. Add your first account to get
                started.
              </p>
            </div>
          )}
        </aside>
      </div>

      <AccountForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleCreateAccount}
        accounts={accounts}
        account={editingAccount || undefined}
      />
    </div>
  )
}

export default Accounts
