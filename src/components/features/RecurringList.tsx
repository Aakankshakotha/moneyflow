import React, { useMemo } from 'react'
import { Input, Select } from '@/components/common'
import RecurringCard from './RecurringCard'
import type {
  RecurringTransactionWithAccounts,
  RecurringStatus,
} from '@/types/recurring'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

interface RecurringListProps {
  recurring: RecurringTransactionWithAccounts[]
  onProcess?: (id: string) => void
  onPause?: (id: string) => void
  onResume?: (id: string) => void
  onDelete?: (id: string) => void
}

/**
 * RecurringList - displays a filterable list of recurring transactions
 */
const RecurringList: React.FC<RecurringListProps> = ({
  recurring,
  onProcess,
  onPause,
  onResume,
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<
    RecurringStatus | 'all'
  >('all')

  const filteredRecurring = useMemo(() => {
    return recurring.filter((r) => {
      // Apply search filter
      const matchesSearch =
        searchQuery.trim() === '' ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.fromAccountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.toAccountName.toLowerCase().includes(searchQuery.toLowerCase())

      // Apply status filter
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [recurring, searchQuery, statusFilter])

  const activeCount = recurring.filter((r) => r.status === 'active').length
  const pausedCount = recurring.filter((r) => r.status === 'paused').length

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Box
        sx={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ flex: 1, minWidth: '200px' }}>
          <Input
            type="text"
            placeholder="Search recurring transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Box>
        <Box sx={{ minWidth: '180px' }}>
          <Select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as RecurringStatus | 'all')
            }
            options={[
              { value: 'all', label: `All (${recurring.length})` },
              { value: 'active', label: `Active (${activeCount})` },
              { value: 'paused', label: `Paused (${pausedCount})` },
            ]}
          />
        </Box>
      </Box>

      {filteredRecurring.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: '4rem',
            px: '2rem',
            color: 'var(--text-secondary)',
          }}
        >
          {recurring.length === 0 ? (
            <>
              <Typography>No recurring transactions yet</Typography>
              <Typography
                sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}
              >
                Create your first recurring transaction to automate regular
                transfers
              </Typography>
            </>
          ) : (
            <Typography>No recurring transactions match your search</Typography>
          )}
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredRecurring.map((r) => (
            <RecurringCard
              key={r.id}
              recurring={r}
              onProcess={onProcess}
              onPause={onPause}
              onResume={onResume}
              onDelete={onDelete}
            />
          ))}
        </Box>
      )}
    </Box>
  )
}

export default RecurringList
