import React from 'react'
import { Input, Select, Button } from '@/components/common'
import TransactionCard from './TransactionCard'
import { TRANSACTION_CATEGORIES, CATEGORY_GROUPS } from '@/constants/categories'
import type { TransactionWithAccounts } from '@/types/transaction'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import './TransactionList.css'

interface TransactionListProps {
  transactions: TransactionWithAccounts[]
  onDelete?: (transaction: TransactionWithAccounts) => void
  onSearchChange?: (searchTerm: string) => void
  onCategoryFilter?: (category: string) => void
  groupByCategory?: boolean
  onToggleGrouping?: () => void
}

/**
 * TransactionList - displays a list of transactions with search and filtering
 */
const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onDelete,
  onSearchChange,
  onCategoryFilter,
  groupByCategory = false,
  onToggleGrouping,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [categoryFilter, setCategoryFilter] = React.useState('')

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value
    setSearchTerm(value)
    onSearchChange?.(value)
  }

  const handleCategoryChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const value = e.target.value
    setCategoryFilter(value)
    onCategoryFilter?.(value)
  }

  // Group transactions by category
  const groupedTransactions = React.useMemo(() => {
    if (!groupByCategory) {
      return [{ group: null, transactions }]
    }

    const groups = new Map<string, TransactionWithAccounts[]>()

    transactions.forEach((txn) => {
      const category = txn.category
        ? TRANSACTION_CATEGORIES.find((c) => c.id === txn.category)
        : null
      const groupKey = category?.group || 'uncategorized'

      if (!groups.has(groupKey)) {
        groups.set(groupKey, [])
      }
      groups.get(groupKey)!.push(txn)
    })

    return Array.from(groups.entries()).map(([group, txns]) => ({
      group,
      transactions: txns,
    }))
  }, [transactions, groupByCategory])

  if (transactions.length === 0 && !searchTerm && !categoryFilter) {
    return (
      <Box className="transaction-list__empty">
        <Typography>No transactions yet</Typography>
        <Typography className="transaction-list__empty-hint">
          Record your first transaction to start tracking your money flow
        </Typography>
      </Box>
    )
  }

  return (
    <Box className="transaction-list">
      <Box className="transaction-list__filters">
        <Box className="transaction-list__search">
          <Input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search transactions..."
          />
        </Box>

        <Box className="transaction-list__category-filter">
          <Select
            value={categoryFilter}
            onChange={handleCategoryChange}
            options={[
              { value: '', label: 'All Categories' },
              ...TRANSACTION_CATEGORIES.map((cat) => ({
                value: cat.id,
                label: cat.name,
              })),
            ]}
            placeholder="Filter by category"
          />
        </Box>

        {onToggleGrouping && (
          <Button
            variant="secondary"
            size="sm"
            className={`transaction-list__group-toggle ${groupByCategory ? 'active' : ''}`}
            onClick={onToggleGrouping}
            title={groupByCategory ? 'Ungroup transactions' : 'Group by category'}
          >
            {groupByCategory ? '📋 List' : '📁 Group'}
          </Button>
        )}
      </div>

      {transactions.length === 0 ? (
        <Box className="transaction-list__empty">
          <Typography>No transactions found matching "{searchTerm}"</Typography>
        </Box>
      ) : (
        <Box className="transaction-list__groups">
          {groupedTransactions.map(({ group, transactions: groupTxns }) => (
            <Box key={group || 'all'} className="transaction-list__group">
              {group && groupByCategory && (
                <Typography
                  variant="h6"
                  component="h3"
                  className="transaction-list__group-header"
                >
                  {CATEGORY_GROUPS[group as keyof typeof CATEGORY_GROUPS]
                    ?.icon || '📋'}{' '}
                  {CATEGORY_GROUPS[group as keyof typeof CATEGORY_GROUPS]
                    ?.label || 'Uncategorized'}
                  <Typography
                    component="span"
                    className="transaction-list__group-count"
                  >
                    {groupTxns.length}
                  </Typography>
                </Typography>
              )}
              <Box className="transaction-list__items">
                {groupTxns.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    onDelete={onDelete}
                  />
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}

export default TransactionList
