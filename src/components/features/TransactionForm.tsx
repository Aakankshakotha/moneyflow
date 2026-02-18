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
import './TransactionForm.css'

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
  const [fromAccountId, setFromAccountId] = useState('')
  const [toAccountId, setToAccountId] = useState('')
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
      setFromAccountId(defaultFromAccountId || '')
      setToAccountId(defaultToAccountId || '')
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
      setFromAccountId('')
      setToAccountId('')
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

  // Get available accounts (active only)
  const activeAccounts = accounts.filter((acc) => acc.status === 'active')

  // Get from account balance
  const fromAccount = activeAccounts.find((acc) => acc.id === fromAccountId)
  const fromBalance = fromAccount ? fromAccount.balance : 0

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
    <Modal isOpen={isOpen} onClose={handleClose} title="Record Transaction">
      <form onSubmit={handleSubmit} className="transaction-form">
        <Select
          label="From Account"
          value={fromAccountId}
          onChange={(e) => setFromAccountId(e.target.value)}
          options={activeAccounts.map((acc) => ({
            value: acc.id,
            label: `${acc.name} (${formatCurrency(acc.balance)})`,
          }))}
          required
          placeholder="Select source account"
        />

        {fromAccount && (
          <div className="transaction-form__balance">
            Available: {formatCurrency(fromBalance)}
          </div>
        )}

        <Select
          label="To Account"
          value={toAccountId}
          onChange={(e) => setToAccountId(e.target.value)}
          options={activeAccounts
            .filter((acc) => acc.id !== fromAccountId)
            .map((acc) => ({
              value: acc.id,
              label: `${acc.name} (${formatCurrency(acc.balance)})`,
            }))}
          required
          placeholder="Select destination account"
          disabled={!fromAccountId}
        />

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
          <div className="transaction-form__suggestions">
            <label className="transaction-form__suggestions-label">
              Suggested:
            </label>
            <div className="transaction-form__suggestions-list">
              {suggestedCategories.slice(0, 3).map((catId) => {
                const cat = TRANSACTION_CATEGORIES.find((c) => c.id === catId)
                if (!cat) return null
                return (
                  <button
                    key={catId}
                    type="button"
                    className={`transaction-form__suggestion ${category === catId ? 'active' : ''}`}
                    onClick={() => setCategory(catId)}
                    style={{
                      backgroundColor:
                        category === catId ? cat.color : `${cat.color}20`,
                      color: category === catId ? '#fff' : cat.color,
                    }}
                  >
                    {cat.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="transaction-form__category-select">
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
        />

        {error && <div className="transaction-form__error">{error}</div>}

        <div className="transaction-form__actions">
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
        </div>
      </form>
    </Modal>
  )
}

export default TransactionForm
