import React, { useState, useEffect } from 'react'
import { Modal, Button, Input, Select } from '@/components/common'
import { formatCurrency } from '@/utils/currencyUtils'
import {
  TRANSACTION_CATEGORIES,
  CATEGORY_GROUPS,
  suggestCategories,
} from '@/constants/categories'
import type { CreateTransactionDto } from '@/types/transaction'
import type { Account } from '@/types/account'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

interface TransactionFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateTransactionDto) => Promise<void>
  accounts: Account[]
  defaultFromAccountId?: string
  defaultToAccountId?: string
}

/**
 * TransactionForm - form for recording transactions between accounts
 */
const TransactionForm: React.FC<TransactionFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  accounts,
  defaultFromAccountId,
  defaultToAccountId,
}) => {
  const [entryMode, setEntryMode] = useState<'expense' | 'income' | 'transfer'>(
    'expense'
  )
  const [primaryAccountId, setPrimaryAccountId] = useState('') // The first account user selects
  const [secondaryAccountId, setSecondaryAccountId] = useState('') // The second account
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestedCategories, setSuggestedCategories] = useState<string[]>([])

  // Set defaults when dialog opens
  useEffect(() => {
    if (isOpen) {
      setEntryMode('expense')
      setPrimaryAccountId(defaultFromAccountId || '')
      setSecondaryAccountId(defaultToAccountId || '')
      setAmount('')
      setDescription('')
      setDate(new Date().toISOString().split('T')[0])
      setCategory('')
      setError(null)
      setSuggestedCategories([])
    }
  }, [isOpen, defaultFromAccountId, defaultToAccountId])

  // Suggest categories based on description
  useEffect(() => {
    if (description.trim().length > 2) {
      const suggestions = suggestCategories(description)
      setSuggestedCategories(suggestions.map((cat) => cat.id))
    } else {
      setSuggestedCategories([])
    }
  }, [description])

  // Get available accounts (active only)
  const activeAccounts = accounts.filter((acc) => acc.status === 'active')

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      // Parse amount (convert dollars to cents)
      const amountInCents = Math.round(parseFloat(amount) * 100)

      if (isNaN(amountInCents) || amountInCents <= 0) {
        setError('Please enter a valid amount greater than 0')
        setSubmitting(false)
        return
      }

      if (!primaryAccountId || !secondaryAccountId) {
        setError('Please select both accounts')
        setSubmitting(false)
        return
      }

      // Map primary/secondary to from/to based on entry mode
      let fromAccountId: string
      let toAccountId: string

      if (entryMode === 'expense') {
        // For expense: secondary (asset) pays to primary (expense)
        fromAccountId = secondaryAccountId
        toAccountId = primaryAccountId
      } else {
        // For income and transfer: primary sends to secondary
        fromAccountId = primaryAccountId
        toAccountId = secondaryAccountId
      }

      const dto: CreateTransactionDto = {
        fromAccountId,
        toAccountId,
        amount: amountInCents,
        description: description.trim(),
        date,
        category: category || undefined,
      }

      await onSubmit(dto)
      handleClose()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to record transaction'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = (): void => {
    if (!submitting) {
      setPrimaryAccountId('')
      setSecondaryAccountId('')
      setAmount('')
      setDescription('')
      setDate(new Date().toISOString().split('T')[0])
      setCategory('')
      setError(null)
      setSuggestedCategories([])
      onClose()
    }
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value
    // Allow numbers and one decimal point
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value)
    }
  }

  // Get label and available accounts for secondary field based on entry mode
  const getSecondaryFieldConfig = (): {
    label: string
    accounts: Account[]
    helperText: string
  } => {
    if (entryMode === 'income') {
      return {
        label: 'Deposit To (Asset Account)',
        accounts: activeAccounts.filter((acc) => acc.type === 'asset'),
        helperText: 'Select where to deposit the income',
      }
    } else if (entryMode === 'expense') {
      return {
        label: 'Pay From (Asset Account)',
        accounts: activeAccounts.filter((acc) => acc.type === 'asset'),
        helperText: 'Select which account to pay from',
      }
    } else {
      return {
        label: 'To Account',
        accounts: activeAccounts.filter(
          (acc) => acc.id !== primaryAccountId && acc.type !== 'income'
        ),
        helperText: 'Select destination account',
      }
    }
  }

  const secondaryConfig = getSecondaryFieldConfig()

  // Get balance info for display
  const displayAccount =
    entryMode === 'expense'
      ? activeAccounts.find((acc) => acc.id === secondaryAccountId)
      : activeAccounts.find((acc) => acc.id === primaryAccountId)

  // Get available accounts for primary selector based on mode
  const getPrimaryAccounts = (): Account[] => {
    if (entryMode === 'income') {
      return activeAccounts.filter((acc) => acc.type === 'income')
    } else if (entryMode === 'expense') {
      return activeAccounts.filter((acc) => acc.type === 'expense')
    } else {
      return activeAccounts.filter((acc) => acc.type !== 'expense')
    }
  }

  const primaryAccounts = getPrimaryAccounts()

  // Reset selections when mode changes
  useEffect(() => {
    setPrimaryAccountId('')
    setSecondaryAccountId('')
  }, [entryMode])

  // Group categories by group
  const groupedCategories = Object.entries(CATEGORY_GROUPS).map(
    ([groupKey, groupInfo]) => ({
      group: groupKey,
      label: `${groupInfo.icon} ${groupInfo.label}`,
      categories: TRANSACTION_CATEGORIES.filter(
        (cat) => cat.group === groupKey
      ),
    })
  )

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Transaction">
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* Tab Navigation */}
        <Box sx={{ display: 'flex', mx: '-1.5rem', mt: '-1.5rem', borderBottom: '2px solid var(--border-color)' }}>
          {(['expense', 'income', 'transfer'] as const).map((mode) => (
            <Box
              key={mode}
              component="button"
              type="button"
              onClick={() => setEntryMode(mode)}
              sx={{
                flex: 1,
                p: '1rem',
                background: 'transparent',
                border: 'none',
                borderBottom: entryMode === mode ? '3px solid var(--primary-color)' : '3px solid transparent',
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: entryMode === mode ? 'var(--primary-color)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'capitalize',
                '&:hover': { backgroundColor: 'var(--hover-background)', color: 'var(--text-primary)' },
              }}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', py: '1.5rem' }}>
          {/* Flow Preview */}
          {primaryAccountId &&
            secondaryAccountId &&
            amount &&
            parseFloat(amount) > 0 && (
              <Box sx={{ backgroundColor: 'var(--card-background)', border: '1px solid var(--border-color)', borderRadius: '8px', p: '1rem', my: '0.5rem' }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', mb: '0.75rem' }}>
                  Flow Preview
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <Box sx={{ flex: 1, p: '0.75rem', backgroundColor: 'var(--background-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', mb: '0.25rem' }}>
                      {entryMode === 'expense'
                        ? 'From Asset'
                        : entryMode === 'income'
                          ? 'From Income'
                          : 'From'}
                    </Typography>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', mb: '0.25rem' }}>
                      {entryMode === 'expense'
                        ? secondaryConfig.accounts.find(
                            (a) => a.id === secondaryAccountId
                          )?.name || 'Asset'
                        : primaryAccounts.find((a) => a.id === primaryAccountId)
                            ?.name || 'Account'}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {formatCurrency(
                        entryMode === 'expense'
                          ? secondaryConfig.accounts.find(
                              (a) => a.id === secondaryAccountId
                            )?.balance || 0
                          : primaryAccounts.find(
                              (a) => a.id === primaryAccountId
                            )?.balance || 0
                      )}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-secondary)', flexShrink: 0 }}>
                    <Typography sx={{ fontSize: '1.5rem', color: entryMode === 'income' ? '#10b981' : entryMode === 'expense' ? '#ef4444' : '#3b82f6' }}>→</Typography>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-color)', mt: '0.25rem' }}>
                      {formatCurrency(Math.round(parseFloat(amount) * 100))}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, p: '0.75rem', backgroundColor: 'var(--background-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', mb: '0.25rem' }}>
                      {entryMode === 'expense'
                        ? 'To Expense'
                        : entryMode === 'income'
                          ? 'To Asset'
                          : 'To'}
                    </Typography>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', mb: '0.25rem' }}>
                      {entryMode === 'expense'
                        ? primaryAccounts.find((a) => a.id === primaryAccountId)
                            ?.name || 'Expense'
                        : secondaryConfig.accounts.find(
                            (a) => a.id === secondaryAccountId
                          )?.name || 'Account'}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {formatCurrency(
                        entryMode === 'expense'
                          ? primaryAccounts.find(
                              (a) => a.id === primaryAccountId
                            )?.balance || 0
                          : secondaryConfig.accounts.find(
                              (a) => a.id === secondaryAccountId
                            )?.balance || 0
                      )}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

          <Select
            label={
              entryMode === 'income'
                ? 'Income Account'
                : entryMode === 'expense'
                  ? 'Expense Account'
                  : 'From Account'
            }
            value={primaryAccountId}
            onChange={(e) => {
              setPrimaryAccountId(e.target.value)
              setSecondaryAccountId('') // Reset secondary when primary changes
            }}
            options={primaryAccounts.map((acc) => ({
              value: acc.id,
              label: `${acc.name} (${formatCurrency(acc.balance)})`,
            }))}
            required
            placeholder="Select account"
          />

          {displayAccount &&
            displayAccount.type !== 'income' &&
            displayAccount.type !== 'expense' && (
              <Typography sx={{ mt: '-1rem', mb: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', pl: '0.25rem' }}>
                Available: {formatCurrency(displayAccount.balance)}
              </Typography>
            )}

          {primaryAccountId && (
            <Select
              label={secondaryConfig.label}
              value={secondaryAccountId}
              onChange={(e) => setSecondaryAccountId(e.target.value)}
              options={secondaryConfig.accounts.map((acc) => ({
                value: acc.id,
                label: `${acc.name} (${formatCurrency(acc.balance)})`,
              }))}
              required
              placeholder={secondaryConfig.helperText}
            />
          )}

          <Input
            label="Amount"
            type="text"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0.00"
            required
            helperText="Enter amount in dollars (e.g., 25.50)"
          />

          <Input
            label="Description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this transaction for?"
            required
          />

          {suggestedCategories.length > 0 && (
            <Box sx={{ mt: '-0.5rem', p: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
              <Typography component="label" sx={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', mb: '0.5rem' }}>
                Suggested:
              </Typography>
              <Box sx={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {suggestedCategories.slice(0, 3).map((catId) => {
                  const cat = TRANSACTION_CATEGORIES.find((c) => c.id === catId)
                  if (!cat) return null
                  return (
                    <Box
                      key={catId}
                      component="button"
                      type="button"
                      onClick={() => setCategory(catId)}
                      sx={{
                        p: '0.375rem 0.75rem',
                        border: 'none',
                        borderRadius: '0.25rem',
                        fontSize: '0.8125rem',
                        fontWeight: category === catId ? 600 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        backgroundColor: category === catId ? cat.color : `${cat.color}20`,
                        color: category === catId ? '#fff' : cat.color,
                        '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
                      }}
                    >
                      {cat.name}
                    </Box>
                  )
                })}
              </Box>
            </Box>
          )}

          <Box sx={{ mt: '-0.5rem' }}>
            <Select
              label="Category (Optional)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={groupedCategories.flatMap((group) => [
                {
                  value: `__group_${group.group}`,
                  label: group.label,
                  disabled: true,
                },
                ...group.categories.map((cat) => ({
                  value: cat.id,
                  label: `  ${cat.name}`,
                })),
              ])}
              placeholder="Select a category"
            />
          </div>

          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          </Box>

          {error && <Box sx={{ p: '0.75rem', backgroundColor: '#fee2e2', color: 'var(--error-color)', borderRadius: '0.375rem', fontSize: '0.875rem' }}>{error}</Box>}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', mt: '0.5rem' }}>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Recording...' : 'Record Transaction'}
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}

export default TransactionForm
