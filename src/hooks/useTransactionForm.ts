import { useState, useEffect } from 'react'
import { suggestCategories } from '@/constants/categories'
import { formatCurrency } from '@/utils/currencyUtils'
import type { CreateTransactionDto } from '@/types/transaction'
import type { Account } from '@/types/account'

export type EntryMode = 'expense' | 'income' | 'transfer'

export interface ModeConfig {
  primaryLabel: string
  primaryAccounts: Account[]
  secondaryLabel: string
  secondaryAccounts: Account[]
  secondaryPlaceholder: string
  flowFromLabel: string
  flowToLabel: string
  arrowColor: string
  getFromTo: (
    primary: string,
    secondary: string
  ) => { fromAccountId: string; toAccountId: string }
}

export function getModeConfig(
  mode: EntryMode,
  activeAccounts: Account[],
  primaryAccountId: string
): ModeConfig {
  const assetOrLiabilityAccounts = activeAccounts.filter(
    (acc) => acc.type === 'asset' || acc.type === 'liability'
  )
  const configs: Record<EntryMode, ModeConfig> = {
    expense: {
      primaryLabel: 'Expense Account',
      primaryAccounts: activeAccounts.filter((acc) => acc.type === 'expense'),
      secondaryLabel: 'Pay From (Asset / Credit Card)',
      secondaryAccounts: assetOrLiabilityAccounts,
      secondaryPlaceholder: 'Select which account to pay from',
      flowFromLabel: 'From Account',
      flowToLabel: 'To Expense',
      arrowColor: 'error.main',
      getFromTo: (primary, secondary) => ({
        fromAccountId: secondary,
        toAccountId: primary,
      }),
    },
    income: {
      primaryLabel: 'Income Account',
      primaryAccounts: activeAccounts.filter((acc) => acc.type === 'income'),
      secondaryLabel: 'Deposit To (Asset / Credit Card)',
      secondaryAccounts: assetOrLiabilityAccounts,
      secondaryPlaceholder: 'Select where to deposit the income',
      flowFromLabel: 'From Income',
      flowToLabel: 'To Account',
      arrowColor: 'success.main',
      getFromTo: (primary, secondary) => ({
        fromAccountId: primary,
        toAccountId: secondary,
      }),
    },
    transfer: {
      primaryLabel: 'From Account',
      primaryAccounts: activeAccounts.filter((acc) => acc.type !== 'expense'),
      secondaryLabel: 'To Account',
      secondaryAccounts: activeAccounts.filter(
        (acc) => acc.id !== primaryAccountId && acc.type !== 'income'
      ),
      secondaryPlaceholder: 'Select destination account',
      flowFromLabel: 'From',
      flowToLabel: 'To',
      arrowColor: 'info.main',
      getFromTo: (primary, secondary) => ({
        fromAccountId: primary,
        toAccountId: secondary,
      }),
    },
  }
  return configs[mode]
}

// Re-export for use in account options
export { formatCurrency }

interface UseTransactionFormProps {
  isOpen: boolean
  accounts: Account[]
  defaultFromAccountId?: string
  defaultToAccountId?: string
  onClose: () => void
  onSubmit: (data: CreateTransactionDto) => Promise<void>
}

export interface UseTransactionFormReturn {
  entryMode: EntryMode
  setEntryMode: (mode: EntryMode) => void
  primaryAccountId: string
  setPrimaryAccountId: (id: string) => void
  secondaryAccountId: string
  setSecondaryAccountId: (id: string) => void
  amount: string
  description: string
  setDescription: (v: string) => void
  date: string
  setDate: (v: string) => void
  category: string
  setCategory: (v: string) => void
  submitting: boolean
  error: string | null
  suggestedCategories: string[]
  config: ModeConfig
  displayAccount: Account | undefined
  flowFromAccount: Account | undefined
  flowToAccount: Account | undefined
  activeAccounts: Account[]
  handleSubmit: (e: React.FormEvent) => Promise<void>
  handleClose: () => void
  handleAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function useTransactionForm({
  isOpen,
  accounts,
  defaultFromAccountId,
  defaultToAccountId,
  onClose,
  onSubmit,
}: UseTransactionFormProps): UseTransactionFormReturn {
  const [entryMode, setEntryMode] = useState<EntryMode>('expense')
  const [primaryAccountId, setPrimaryAccountId] = useState('')
  const [secondaryAccountId, setSecondaryAccountId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestedCategories, setSuggestedCategories] = useState<string[]>([])

  // Reset form when dialog opens
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

  // Reset account selections when mode changes
  useEffect(() => {
    setPrimaryAccountId('')
    setSecondaryAccountId('')
  }, [entryMode])

  const activeAccounts = accounts.filter((acc) => acc.status === 'active')
  const config = getModeConfig(entryMode, activeAccounts, primaryAccountId)

  const balanceAccountId =
    entryMode === 'expense' ? secondaryAccountId : primaryAccountId
  const displayAccount = activeAccounts.find(
    (acc) => acc.id === balanceAccountId
  )

  const flowFromAccountId =
    entryMode === 'expense' ? secondaryAccountId : primaryAccountId
  const flowToAccountId =
    entryMode === 'expense' ? primaryAccountId : secondaryAccountId
  const flowFromAccount = activeAccounts.find(
    (acc) => acc.id === flowFromAccountId
  )
  const flowToAccount = activeAccounts.find((acc) => acc.id === flowToAccountId)

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
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
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

      const { fromAccountId, toAccountId } = config.getFromTo(
        primaryAccountId,
        secondaryAccountId
      )

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

  return {
    entryMode,
    setEntryMode,
    primaryAccountId,
    setPrimaryAccountId,
    secondaryAccountId,
    setSecondaryAccountId,
    amount,
    description,
    setDescription,
    date,
    setDate,
    category,
    setCategory,
    submitting,
    error,
    suggestedCategories,
    config,
    displayAccount,
    flowFromAccount,
    flowToAccount,
    activeAccounts,
    handleSubmit,
    handleClose,
    handleAmountChange,
  }
}
