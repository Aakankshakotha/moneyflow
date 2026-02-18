import React, { useState, useEffect } from 'react'
import { Modal, Button, Input, Select } from '@/components/common'
import { formatCurrency } from '@/utils/currencyUtils'
import type { CreateRecurringDto, RecurrenceFrequency } from '@/types/recurring'
import type { Account } from '@/types/account'
import './RecurringForm.css'

interface RecurringFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateRecurringDto) => Promise<void>
  accounts: Account[]
  defaultFromAccountId?: string
  defaultToAccountId?: string
}

const FREQUENCY_OPTIONS: { value: RecurrenceFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]

/**
 * RecurringForm - form for creating recurring transactions
 */
const RecurringForm: React.FC<RecurringFormProps> = ({
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
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('monthly')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Set defaults when dialog opens
  useEffect(() => {
    if (isOpen) {
      setFromAccountId(defaultFromAccountId || '')
      setToAccountId(defaultToAccountId || '')
      setAmount('')
      setDescription('')
      setFrequency('monthly')
      setError(null)
    }
  }, [isOpen, defaultFromAccountId, defaultToAccountId])

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

      const dto: CreateRecurringDto = {
        fromAccountId,
        toAccountId,
        amount: amountInCents,
        description: description.trim(),
        frequency,
      }

      await onSubmit(dto)
      handleClose()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create recurring transaction'
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
      setFrequency('monthly')
      setError(null)
      onClose()
    }
  }

  const selectedFromAccount = accounts.find((a) => a.id === fromAccountId)
  const selectedToAccount = accounts.find((a) => a.id === toAccountId)

  const fromAccountOptions = accounts.map((account) => ({
    value: account.id,
    label: `${account.name} (${formatCurrency(account.balance)})`,
  }))

  const toAccountOptions = accounts.map((account) => ({
    value: account.id,
    label: `${account.name} (${formatCurrency(account.balance)})`,
  }))

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="New Recurring Transaction"
      size="md"
    >
      <form onSubmit={handleSubmit} className="recurring-form">
        {error && <div className="recurring-form__error">{error}</div>}

        <Select
          label="From Account"
          value={fromAccountId}
          onChange={(e) => setFromAccountId(e.target.value)}
          options={[
            { value: '', label: 'Select source account' },
            ...fromAccountOptions,
          ]}
          required
        />

        {selectedFromAccount && (
          <div className="recurring-form__balance">
            Available: {formatCurrency(selectedFromAccount.balance)}
          </div>
        )}

        <Select
          label="To Account"
          value={toAccountId}
          onChange={(e) => setToAccountId(e.target.value)}
          options={[
            { value: '', label: 'Select destination account' },
            ...toAccountOptions,
          ]}
          required
        />

        {selectedToAccount && (
          <div className="recurring-form__balance">
            Current: {formatCurrency(selectedToAccount.balance)}
          </div>
        )}

        <Input
          label="Amount"
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          required
        />

        <Input
          label="Description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Monthly rent, Weekly groceries"
          required
        />

        <Select
          label="Frequency"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as RecurrenceFrequency)}
          options={FREQUENCY_OPTIONS}
          required
        />

        <div className="recurring-form__actions">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Recurring Transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default RecurringForm
