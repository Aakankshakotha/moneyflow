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
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

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
      <Box sx={{ p: '2rem', maxWidth: '1440px', margin: '0 auto' }}>
        <Typography>Loading accounts...</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: '2rem', maxWidth: '1440px', margin: '0 auto' }}>
        <Typography sx={{ color: 'var(--error-color)', fontSize: '1.125rem', mb: '1rem' }}>{error}</Typography>
        <Button onClick={loadAccounts}>Retry</Button>
      </Box>
    )
  }

  return (
    <Box sx={{ p: '2rem', maxWidth: '1440px', margin: '0 auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', mb: '1.5rem' }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ m: 0, fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Accounts</Typography>
          <Typography sx={{ m: '0.35rem 0 0', color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Manage your financial buckets: Assets, Liabilities, Income, and
            Expenses.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
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
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem', mb: '1.25rem' }}>
        <Box sx={{ backgroundColor: 'var(--card-background)', border: '1px solid var(--border-color)', borderRadius: '12px', p: '1rem 1.15rem', boxShadow: 'var(--shadow-soft)' }}>
          <Typography sx={{ m: 0, color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Net Worth</Typography>
          <Typography sx={{ m: '0.35rem 0 0', color: 'var(--text-primary)', fontSize: '1.75rem', fontWeight: 700 }}>
            {formatCurrency(netWorth)}
          </Typography>
        </Box>
        <Box sx={{ backgroundColor: 'var(--card-background)', border: '1px solid var(--border-color)', borderRadius: '12px', p: '1rem 1.15rem', boxShadow: 'var(--shadow-soft)' }}>
          <Typography sx={{ m: 0, color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Assets</Typography>
          <Typography sx={{ m: '0.35rem 0 0', color: 'var(--text-primary)', fontSize: '1.75rem', fontWeight: 700 }}>
            {formatCurrency(totalAssets)}
          </Typography>
        </Box>
        <Box sx={{ backgroundColor: 'var(--card-background)', border: '1px solid var(--border-color)', borderRadius: '12px', p: '1rem 1.15rem', boxShadow: 'var(--shadow-soft)' }}>
          <Typography sx={{ m: 0, color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Liabilities</Typography>
          <Typography sx={{ m: '0.35rem 0 0', color: 'var(--text-primary)', fontSize: '1.75rem', fontWeight: 700 }}>
            {formatCurrency(totalLiabilities)}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.7fr) minmax(340px, 0.9fr)', gap: '1rem' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
              <Box component="section" key={section.type} sx={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <Box component="header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: '0 0.25rem' }}>
                  <Typography variant="h6" component="h2" sx={{ m: 0, display: 'flex', alignItems: 'center', gap: '0.55rem', color: 'var(--primary-color)', fontSize: '1.15rem', fontWeight: 700 }}>
                    <Box component="span" sx={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: section.dotClass === 'asset' ? '#10b981' : section.dotClass === 'liability' ? '#ef4444' : section.dotClass === 'income' ? '#3b82f6' : '#f59e0b', display: 'inline-block' }} />
                    {section.label}
                  </Typography>
                  <Typography component="span" sx={{ color: 'var(--primary-color)', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.03em' }}>
                    {formatCurrency(sectionTotal)}
                  </Typography>
                </Box>

                <Box sx={{ backgroundColor: 'var(--card-background)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
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
                          <Box
                            key={account.id}
                            component="button"
                            type="button"
                            sx={{
                              border: 'none',
                              borderBottom: '1px solid var(--border-color)',
                              backgroundColor: selectedAccountId === account.id ? 'rgba(249,115,22,0.15)' : 'transparent',
                              boxShadow: selectedAccountId === account.id ? 'inset 4px 0 0 var(--primary-color)' : 'none',
                              color: 'inherit',
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem',
                              p: '1rem 1.25rem',
                              textAlign: 'left',
                              cursor: 'pointer',
                              transition: 'background 0.15s ease',
                              '&:last-child': { borderBottom: 'none' },
                              '&:hover': { backgroundColor: 'rgba(249,115,22,0.1)' },
                            }}
                            onClick={() =>
                              setSelectedAccountId((prev) =>
                                prev === account.id ? null : account.id
                              )
                            }
                          >
                            <Box sx={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--background-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--text-secondary)' }}>
                              <SectionIcon fontSize="small" />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography sx={{ m: 0, color: 'var(--text-primary)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {account.name}
                              </Typography>
                              <Typography sx={{ m: '0.2rem 0 0', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                                {account.parentAccountId
                                  ? `Sub-account of ${accountMap.get(account.parentAccountId)?.name || 'Unknown'}`
                                  : section.label.slice(0, -1)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <Typography sx={{ m: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
                                {formatCurrency(Math.abs(account.balance))}
                              </Typography>
                              <svg
                                style={{ width: '86px', height: '24px', opacity: 0.95 }}
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
                            </Box>
                          </Box>
                        )
                      })()
                    )}
                  </Box>
                </Box>
              </Box>
            )
          })}
        </Box>

        <Box component="aside" sx={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', minWidth: 0 }}>
          {selectedAccount ? (
            <>
              <Box sx={{ backgroundColor: 'var(--card-background)', border: '1px solid var(--border-color)', borderRadius: '12px', p: '1rem', minWidth: 0, wordBreak: 'break-word' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <Typography sx={{ m: 0, color: 'var(--text-secondary)', fontSize: '0.75rem', letterSpacing: '0.04em' }}>
                    {selectedAccount.type.toUpperCase()}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <button
                      type="button"
                      style={{ background: 'var(--button-background)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.3rem 0.55rem', fontSize: '0.72rem', cursor: 'pointer' }}
                      onClick={() => handleEditAccount(selectedAccount)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      style={{ background: 'var(--button-background)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.3rem 0.55rem', fontSize: '0.72rem', cursor: 'pointer' }}
                      onClick={() => handleToggleAccountStatus(selectedAccount)}
                    >
                      {selectedAccount.status === 'active'
                        ? 'Archive'
                        : 'Unarchive'}
                    </button>
                    <button
                      type="button"
                      style={{ background: 'var(--button-background)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.3rem 0.55rem', fontSize: '0.72rem', cursor: 'pointer' }}
                      onClick={() => handleDeleteAccount(selectedAccount)}
                    >
                      Delete
                    </button>
                  </Box>
                </Box>

                <Typography variant="h6" component="h3" sx={{ m: '0.7rem 0 0', fontSize: '1.4rem', color: 'var(--text-primary)' }}>
                  {selectedAccount.name}
                </Typography>
                <Typography sx={{ m: '0.45rem 0 0', fontSize: '1.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {formatCurrency(Math.abs(selectedAccount.balance))}
                </Typography>
                <Typography sx={{ m: '0.45rem 0 0', color: 'var(--success-color)', fontSize: '0.82rem', fontWeight: 600 }}>
                  {selectedAccount.status === 'active'
                    ? 'Connected'
                    : 'Archived'}
                </Typography>
              </Box>

              <Box sx={{ backgroundColor: 'var(--card-background)', border: '1px solid var(--border-color)', borderRadius: '12px', p: '1rem', minWidth: 0 }}>
                <Typography sx={{ m: '0 0 0.75rem', color: 'var(--text-secondary)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {rangeConfig.label} Flow
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  <Box>
                    <Typography sx={{ m: 0, color: 'var(--text-secondary)', fontSize: '0.75rem' }}>In</Typography>
                    <Typography sx={{ m: '0.25rem 0 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--success-color)' }}>
                      +{formatCurrency(monthlyInflow)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ m: 0, color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Out</Typography>
                    <Typography sx={{ m: '0.25rem 0 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--error-color)' }}>
                      -{formatCurrency(monthlyOutflow)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ backgroundColor: 'var(--card-background)', border: '1px solid var(--border-color)', borderRadius: '12px', p: '1rem', minWidth: 0 }}>
                <Typography sx={{ m: '0 0 0.75rem', color: 'var(--text-secondary)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>History</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                  {recentSelectedTransactions.length > 0 ? (
                    recentSelectedTransactions.map((transaction) => {
                      const isInflow =
                        transaction.toAccountId === selectedAccount.id
                      const oppositeAccountId = isInflow
                        ? transaction.fromAccountId
                        : transaction.toAccountId

                      return (
                        <Box
                          key={transaction.id}
                          sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.8rem' }}
                        >
                          <Box>
                            <Typography sx={{ m: 0, color: 'var(--text-primary)', fontSize: '0.87rem', fontWeight: 600 }}>
                              {transaction.description}
                            </Typography>
                            <Typography sx={{ m: '0.2rem 0 0', color: 'var(--text-secondary)', fontSize: '0.74rem' }}>
                              {new Date(transaction.date).toLocaleDateString()}{' '}
                              •{' '}
                              {accountMap.get(oppositeAccountId)?.name ||
                                'Unknown'}
                            </Typography>
                          </Box>
                          <Typography
                            sx={{ m: 0, fontSize: '0.88rem', fontWeight: 700, color: isInflow ? 'var(--success-color)' : 'var(--error-color)', whiteSpace: 'nowrap' }}
                          >
                            {isInflow ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </Typography>
                        </Box>
                      )
                    })
                  ) : (
                    <Typography sx={{ m: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      No recent activity for this account.
                    </Typography>
                  )}
                </Box>
              </Box>
            </>
          ) : (
            <Box sx={{ backgroundColor: 'var(--card-background)', border: '1px solid var(--border-color)', borderRadius: '12px', p: '1rem' }}>
              <Typography>
                No accounts available yet. Add your first account to get
                started.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      <AccountForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleCreateAccount}
        accounts={accounts}
        account={editingAccount || undefined}
      />
    </Box>
  )
}

export default Accounts
