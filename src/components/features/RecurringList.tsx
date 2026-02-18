import React, { useMemo } from 'react'
import { Input, Select } from '@/components/common'
import RecurringCard from './RecurringCard'
import type {
  RecurringTransactionWithAccounts,
  RecurringStatus,
} from '@/types/recurring'
import './RecurringList.css'

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
    <div className="recurring-list">
      <div className="recurring-list__filters">
        <div className="recurring-list__search">
          <Input
            type="text"
            placeholder="Search recurring transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="recurring-list__status-filter">
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
        </div>
      </div>

      {filteredRecurring.length === 0 ? (
        <div className="recurring-list__empty">
          {recurring.length === 0 ? (
            <>
              <p>No recurring transactions yet</p>
              <p className="recurring-list__empty-hint">
                Create your first recurring transaction to automate regular
                transfers
              </p>
            </>
          ) : (
            <p>No recurring transactions match your search</p>
          )}
        </div>
      ) : (
        <div className="recurring-list__items">
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
        </div>
      )}
    </div>
  )
}

export default RecurringList
