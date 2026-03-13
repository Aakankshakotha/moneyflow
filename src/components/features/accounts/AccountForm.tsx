import React, { useEffect, useState } from 'react'
import type {
  AccountType,
  AccountStatus,
  CreateAccountDto,
  UpdateAccountDto,
  Account,
} from '@/types/account'
import { Button, Modal } from '@/components/common'
import { dollarsToCents, centsToDollars } from '@/utils/currencyUtils'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MuiSelect from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

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
  const [costBasis, setCostBasis] = useState(
    account?.costBasis !== undefined
      ? centsToDollars(account.costBasis).toString()
      : ''
  )
  const [status, setStatus] = useState<AccountStatus>(
    account?.status || 'active'
  )
  const [parentAccountId, setParentAccountId] = useState(
    account?.parentAccountId || ''
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isAssetType = isEdit ? account?.type === 'asset' : type === 'asset'

  useEffect(() => {
    if (isOpen) {
      setName(account?.name || '')
      setType(account?.type || 'asset')
      setBalance(account ? centsToDollars(account.balance).toString() : '0')
      setCostBasis(
        account?.costBasis !== undefined
          ? centsToDollars(account.costBasis).toString()
          : ''
      )
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
        ...(isAssetType
          ? {
              costBasis:
                costBasis.trim() !== ''
                  ? dollarsToCents(parseFloat(costBasis))
                  : null,
            }
          : {}),
      }
      onSubmit(updateData)
    } else {
      const createData: CreateAccountDto = {
        name: name.trim(),
        type,
        parentAccountId: parentAccountId || null,
        balance: dollarsToCents(balanceNum),
        ...(isAssetType && costBasis.trim() !== ''
          ? { costBasis: dollarsToCents(parseFloat(costBasis)) }
          : {}),
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
    setCostBasis('')
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
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}
    >
      <TextField
        label="Account Name"
        size="small"
        fullWidth
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={Boolean(errors.name)}
        helperText={errors.name}
        placeholder="e.g., Checking Account"
        required
      />

      {!isEdit && (
        <FormControl size="small" fullWidth required>
          <InputLabel>Account Type</InputLabel>
          <MuiSelect
            label="Account Type"
            value={type}
            onChange={(e) => setType(e.target.value as AccountType)}
          >
            <MenuItem value="asset">Asset (what you own)</MenuItem>
            <MenuItem value="liability">Liability (what you owe)</MenuItem>
            <MenuItem value="income">Income (money coming in)</MenuItem>
            <MenuItem value="expense">Expense (money going out)</MenuItem>
          </MuiSelect>
        </FormControl>
      )}

      <FormControl size="small" fullWidth>
        <InputLabel shrink>Parent Account (Optional)</InputLabel>
        <MuiSelect
          label="Parent Account (Optional)"
          displayEmpty
          value={parentAccountId}
          onChange={(e) => setParentAccountId(e.target.value as string)}
          notched
        >
          <MenuItem value="">
            <em>No parent (top-level account)</em>
          </MenuItem>
          {parentOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </MuiSelect>
      </FormControl>

      <TextField
        label={isEdit ? 'Balance ($)' : 'Initial Balance ($)'}
        size="small"
        fullWidth
        type="number"
        value={balance}
        onChange={(e) => setBalance(e.target.value)}
        error={Boolean(errors.balance)}
        helperText={
          errors.balance ||
          (isDerivedFlowAccount
            ? 'For income/expense accounts, this value is derived from transactions.'
            : undefined)
        }
        placeholder="0.00"
        disabled={isDerivedFlowAccount}
        slotProps={{ htmlInput: { step: '0.01' } }}
      />
      {isAssetType && (
        <TextField
          label="Invested Amount / Cost Basis ($)"
          size="small"
          fullWidth
          type="number"
          value={costBasis}
          onChange={(e) => setCostBasis(e.target.value)}
          helperText="Optional. Set this to track unrealized gain/loss for investment accounts."
          placeholder="0.00"
          slotProps={{ htmlInput: { step: '0.01', min: '0' } }}
        />
      )}
      {isEdit && (
        <FormControl size="small" fullWidth required>
          <InputLabel>Status</InputLabel>
          <MuiSelect
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="archived">Archived</MenuItem>
          </MuiSelect>
        </FormControl>
      )}

      <Box
        sx={{
          display: 'flex',
          gap: 1,
          justifyContent: 'flex-end',
          mt: 0.5,
          pt: 1.5,
        }}
      >
        <Button type="button" variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {isEdit ? 'Update Account' : 'Create Account'}
        </Button>
      </Box>
    </Box>
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
