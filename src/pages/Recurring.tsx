import React, { useState, useEffect } from 'react'
import { Button } from '@/components/common'
import RecurringForm from '@/components/features/RecurringForm'
import RecurringList from '@/components/features/RecurringList'
import * as recurringService from '@/services/recurringService'
import * as accountService from '@/services/accountService'
import type {
  RecurringTransactionWithAccounts,
  CreateRecurringDto,
} from '@/types/recurring'
import type { Account } from '@/types/account'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import './Recurring.css'

/**
 * Recurring page - manage recurring transactions
 */
const Recurring: React.FC = () => {
  const [recurring, setRecurring] = useState<
    RecurringTransactionWithAccounts[]
  >([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async (): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      // Load accounts
      const accountsResult = await accountService.listAccounts()
      if (!accountsResult.success) {
        throw new Error('Failed to load accounts')
      }

      // Load recurring transactions
      const recurringResult = await recurringService.listRecurring()
      if (!recurringResult.success) {
        throw new Error('Failed to load recurring transactions')
      }

      // Enrich recurring transactions with account names
      const enrichedRecurring: RecurringTransactionWithAccounts[] =
        recurringResult.data.map((r) => {
          const fromAccount = accountsResult.data.find(
            (a: Account) => a.id === r.fromAccountId
          )
          const toAccount = accountsResult.data.find(
            (a: Account) => a.id === r.toAccountId
          )

          return {
            ...r,
            fromAccountName: fromAccount?.name || 'Unknown',
            toAccountName: toAccount?.name || 'Unknown',
          }
        })

      setAccounts(accountsResult.data)
      setRecurring(enrichedRecurring)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRecurring = async (
    data: CreateRecurringDto
  ): Promise<void> => {
    const result = await recurringService.createRecurring(data)
    if (!result.success) {
      throw new Error(result.error.message)
    }
    await loadData()
  }

  const handleProcess = async (id: string): Promise<void> => {
    if (!window.confirm('Process this recurring transaction now?')) {
      return
    }

    const today = new Date().toISOString().split('T')[0]
    const result = await recurringService.processRecurring(id, today)

    if (!result.success) {
      alert(`Failed to process: ${result.error.message}`)
      return
    }

    alert('Recurring transaction processed successfully!')
    await loadData()
  }

  const handlePause = async (id: string): Promise<void> => {
    const result = await recurringService.updateRecurring(id, {
      status: 'paused',
    })

    if (!result.success) {
      alert(`Failed to pause: ${result.error.message}`)
      return
    }

    await loadData()
  }

  const handleResume = async (id: string): Promise<void> => {
    const result = await recurringService.updateRecurring(id, {
      status: 'active',
    })

    if (!result.success) {
      alert(`Failed to resume: ${result.error.message}`)
      return
    }

    await loadData()
  }

  const handleDelete = async (id: string): Promise<void> => {
    if (
      !window.confirm(
        'Are you sure you want to delete this recurring transaction?'
      )
    ) {
      return
    }

    const result = await recurringService.deleteRecurring(id)

    if (!result.success) {
      alert(`Failed to delete: ${result.error.message}`)
      return
    }

    await loadData()
  }

  if (loading) {
    return (
      <Box className="recurring-page" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={20} />
        <Typography>Loading recurring transactions...</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box className="recurring-page">
        <Alert severity="error">Error: {error}</Alert>
      </Box>
    )
  }

  return (
    <Box className="recurring-page">
      <Box className="recurring-page__header">
        <Typography component="h1" className="recurring-page__title">
          Recurring Transactions
        </Typography>
        <Button variant="primary" onClick={() => setIsFormOpen(true)}>
          New Recurring Transaction
        </Button>
      </Box>

      <Box className="recurring-page__content">
        <RecurringList
          recurring={recurring}
          onProcess={handleProcess}
          onPause={handlePause}
          onResume={handleResume}
          onDelete={handleDelete}
        />
      </Box>

      <RecurringForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateRecurring}
        accounts={accounts}
      />
    </Box>
  )
}

export default Recurring
