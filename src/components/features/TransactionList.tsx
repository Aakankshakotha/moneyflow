import React from 'react'
import { Input, Select } from '@/components/common'
import TransactionCard from './TransactionCard'
import { TRANSACTION_CATEGORIES, CATEGORY_GROUPS } from '@/constants/categories'
import type { TransactionWithAccounts } from '@/types/transaction'
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
      <div className="transaction-list__empty">
        <p>No transactions yet</p>
        <p className="transaction-list__empty-hint">
          Record your first transaction to start tracking your money flow
        </p>
      </div>
    )
  }

  return (
    <div className="transaction-list">
      <div className="transaction-list__filters">
        <div className="transaction-list__search">
          <Input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search transactions..."
          />
        </div>

        <div className="transaction-list__category-filter">
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
        </div>

        {onToggleGrouping && (
          <button
            className={`transaction-list__group-toggle ${groupByCategory ? 'active' : ''}`}
            onClick={onToggleGrouping}
            type="button"
            title={
              groupByCategory ? 'Ungroup transactions' : 'Group by category'
            }
          >
            {groupByCategory ? '📋 List' : '📁 Group'}
          </button>
        )}
      </div>

      {transactions.length === 0 ? (
        <div className="transaction-list__empty">
          <p>No transactions found matching "{searchTerm}"</p>
        </div>
      ) : (
        <div className="transaction-list__groups">
          {groupedTransactions.map(({ group, transactions: groupTxns }) => (
            <div key={group || 'all'} className="transaction-list__group">
              {group && groupByCategory && (
                <h3 className="transaction-list__group-header">
                  {CATEGORY_GROUPS[group as keyof typeof CATEGORY_GROUPS]
                    ?.icon || '📋'}{' '}
                  {CATEGORY_GROUPS[group as keyof typeof CATEGORY_GROUPS]
                    ?.label || 'Uncategorized'}
                  <span className="transaction-list__group-count">
                    {groupTxns.length}
                  </span>
                </h3>
              )}
              <div className="transaction-list__items">
                {groupTxns.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TransactionList
