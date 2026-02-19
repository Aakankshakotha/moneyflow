import React from 'react'
import { Card } from '@/components/common'
import { formatCurrency } from '@/utils/currencyUtils'
import { formatDate } from '@/utils/dateUtils'
import { getCategoryById } from '@/constants/categories'
import type { TransactionWithAccounts } from '@/types/transaction'
import './TransactionCard.css'

interface TransactionCardProps {
  transaction: TransactionWithAccounts
  onDelete?: (transaction: TransactionWithAccounts) => void
}

/**
 * TransactionCard - displays a single transaction in compact format
 */
const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onDelete,
}) => {
  const handleDelete = (): void => {
    if (onDelete) {
      onDelete(transaction)
    }
  }

  const category = transaction.category
    ? getCategoryById(transaction.category)
    : null

  // Determine transaction type
  const getTransactionType = (): 'income' | 'expense' | 'transfer' => {
    if (
      transaction.fromAccount.type === 'income' &&
      transaction.toAccount.type === 'asset'
    ) {
      return 'income'
    }
    if (
      transaction.fromAccount.type === 'asset' &&
      transaction.toAccount.type === 'expense'
    ) {
      return 'expense'
    }
    return 'transfer'
  }

  const transactionType = getTransactionType()
  const typeLabels = {
    income: 'INCOME',
    expense: 'EXPENSE',
    transfer: 'TRANSFER',
  }

  return (
    <Card className="transaction-card">
      <div className="transaction-card__main">
        <div className="transaction-card__left">
          <div className="transaction-card__date">
            {formatDate(new Date(transaction.date), 'MMM dd')}
          </div>
          <div className="transaction-card__flow">
            <span className="transaction-card__account from">
              {transaction.fromAccount.name}
            </span>
            <span className="transaction-card__arrow">→</span>
            <span className="transaction-card__account to">
              {transaction.toAccount.name}
            </span>
          </div>
          <div className="transaction-card__description">
            {transaction.description}
          </div>
        </div>

        <div className="transaction-card__right">
          <span
            className={`transaction-card__type transaction-card__type--${transactionType}`}
          >
            {typeLabels[transactionType]}
          </span>
          {category && (
            <span
              className="transaction-card__category"
              style={{
                backgroundColor: `${category.color}20`,
                color: category.color,
              }}
            >
              {category.name}
            </span>
          )}
          <div className="transaction-card__amount">
            {formatCurrency(transaction.amount)}
          </div>
          {onDelete && (
            <button
              className="transaction-card__delete"
              onClick={handleDelete}
              type="button"
              title="Delete transaction"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </Card>
  )
}

export default TransactionCard
