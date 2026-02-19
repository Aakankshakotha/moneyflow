import React, { useEffect, useState } from 'react'
import type {
  AccountType,
  AccountStatus,
  CreateAccountDto,
  UpdateAccountDto,
  Account,
} from '@/types/account'
import { Input, Select, Button, Modal } from '@/components/common'
import { dollarsToCents, centsToDollars } from '@/utils/currencyUtils'
import './AccountForm.css'

interface AccountFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateAccountDto | UpdateAccountDto) => void
  accounts: Account[]
  account?: Account
  title?: string
}

/**
 * AccountForm - form for creating or editing accounts
 */
const AccountForm: React.FC<AccountFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  accounts,
  account,
  title,
}) => {
  const isEdit = !!account
  const isDerivedFlowAccount =
    isEdit && (account?.type === 'income' || account?.type === 'expense')

  const [name, setName] = useState(account?.name || '')
  const [type, setType] = useState<AccountType>(account?.type || 'asset')
  const [balance, setBalance] = useState(
    account ? centsToDollars(account.balance).toString() : '0'
  )
  const [status, setStatus] = useState<AccountStatus>(
    account?.status || 'active'
  )
  const [parentAccountId, setParentAccountId] = useState(
    account?.parentAccountId || ''
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      setName(account?.name || '')
      setType(account?.type || 'asset')
      setBalance(account ? centsToDollars(account.balance).toString() : '0')
      setStatus(account?.status || 'active')
      setParentAccountId(account?.parentAccountId || '')
      setErrors({})
    }
  }, [isOpen, account])

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()

    // Clear previous errors
    setErrors({})

    // Validate
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = 'Account name is required'
    }

    if (name.length > 100) {
      newErrors.name = 'Account name must be 100 characters or less'
    }

    const balanceNum = parseFloat(balance)
    if (isNaN(balanceNum)) {
      newErrors.balance = 'Balance must be a valid number'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Prepare data
    if (isEdit) {
      const updateData: UpdateAccountDto = {
        name: name.trim(),
        status,
        parentAccountId: parentAccountId || null,
        ...(isDerivedFlowAccount
          ? {}
          : { balance: dollarsToCents(balanceNum) }),
      }
      onSubmit(updateData)
    } else {
      const createData: CreateAccountDto = {
        name: name.trim(),
        type,
        parentAccountId: parentAccountId || null,
        balance: dollarsToCents(balanceNum),
      }
      onSubmit(createData)
    }

    // Reset form
    handleClose()
  }

  const handleClose = (): void => {
    setName('')
    setType('asset')
    setBalance('0')
    setStatus('active')
    setParentAccountId('')
    setErrors({})
    onClose()
  }

  const selectedType = isEdit ? account?.type : type
  const parentOptions = accounts
    .filter(
      (candidate) =>
        candidate.status === 'active' &&
        candidate.type === selectedType &&
        candidate.id !== account?.id
    )
    .map((candidate) => ({
      value: candidate.id,
      label: candidate.name,
    }))

  const modalContent = (
    <form onSubmit={handleSubmit} className="account-form">
      <Input
        label="Account Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        placeholder="e.g., Checking Account"
        required
      />

      {!isEdit && (
        <Select
          label="Account Type"
          value={type}
          onChange={(e) => setType(e.target.value as AccountType)}
          options={[
            { value: 'asset', label: 'Asset (what you own)' },
            { value: 'liability', label: 'Liability (what you owe)' },
            { value: 'income', label: 'Income (money coming in)' },
            { value: 'expense', label: 'Expense (money going out)' },
          ]}
          required
        />
      )}

      <Select
        label="Parent Account (Optional)"
        value={parentAccountId}
        onChange={(e) => setParentAccountId(e.target.value)}
        options={parentOptions}
        placeholder="No parent (top-level account)"
      />

      <Input
        label={isEdit ? 'Balance ($)' : 'Initial Balance ($)'}
        type="number"
        value={balance}
        onChange={(e) => setBalance(e.target.value)}
        error={errors.balance}
        helperText={
          isDerivedFlowAccount
            ? 'For income/expense accounts, this value is derived from transactions.'
            : undefined
        }
        placeholder="0.00"
        step="0.01"
        disabled={isDerivedFlowAccount}
      />

      {isEdit && (
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'archived', label: 'Archived' },
          ]}
          required
        />
      )}

      <div className="account-form__actions">
        <Button type="button" variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {isEdit ? 'Update Account' : 'Create Account'}
        </Button>
      </div>
    </form>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title || (isEdit ? 'Edit Account' : 'Create New Account')}
    >
      {modalContent}
    </Modal>
  )
}

export default AccountForm
