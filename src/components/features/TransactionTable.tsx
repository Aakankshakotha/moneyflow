import React from 'react'
import { formatCurrency } from '@/utils/currencyUtils'
import { formatDate } from '@/utils/dateUtils'
import { getCategoryById } from '@/constants/categories'
import type { TransactionWithAccounts } from '@/types/transaction'
import './TransactionTable.css'

interface TransactionTableProps {
  transactions: TransactionWithAccounts[]
  onDelete?: (transaction: TransactionWithAccounts) => void
}

/**
 * TransactionTable - displays transactions in a table format
 */
const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onDelete,
}) => {
  const getTransactionType = (
    txn: TransactionWithAccounts
  ): 'income' | 'expense' | 'transfer' => {
    if (txn.fromAccount.type === 'income' && txn.toAccount.type === 'asset') {
      return 'income'
    }
    if (txn.fromAccount.type === 'asset' && txn.toAccount.type === 'expense') {
      return 'expense'
    }
    return 'transfer'
  }

  if (transactions.length === 0) {
    return (
      <div className="transaction-table__empty">
        <p>No transactions found</p>
        <p className="transaction-table__empty-hint">
          Try adjusting your filters or record a new transaction
        </p>
      </div>
    )
  }

  return (
    <div className="transaction-table">
      <table className="transaction-table__table">
        <thead className="transaction-table__header">
          <tr>
            <th className="transaction-table__col-date">DATE & DESCRIPTION</th>
            <th className="transaction-table__col-category">CATEGORY</th>
            <th className="transaction-table__col-source">SOURCE (DEBIT)</th>
            <th className="transaction-table__col-dest">DEST (DEBIT)</th>
            <th className="transaction-table__col-type">TYPE</th>
            <th className="transaction-table__col-amount">AMOUNT</th>
            <th className="transaction-table__col-actions">ACTIONS</th>
          </tr>
        </thead>
        <tbody className="transaction-table__body">
          {transactions.map((txn) => {
            const category = txn.category ? getCategoryById(txn.category) : null
            const type = getTransactionType(txn)

            return (
              <tr key={txn.id} className="transaction-table__row">
                <td className="transaction-table__cell transaction-table__cell-date">
                  <div className="transaction-table__date-container">
                    <div className="transaction-table__icon">
                      {type === 'income'
                        ? '💰'
                        : type === 'expense'
                          ? '🛍️'
                          : '🔄'}
                    </div>
                    <div>
                      <div className="transaction-table__description">
                        {txn.description}
                      </div>
                      <div className="transaction-table__date">
                        {formatDate(new Date(txn.date), 'MMM dd, yyyy')} •{' '}
                        {new Date(txn.date).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="transaction-table__cell transaction-table__cell-category">
                  {category ? (
                    <span
                      className="transaction-table__category-badge"
                      style={{
                        backgroundColor: `${category.color}20`,
                        color: category.color,
                      }}
                    >
                      {category.name}
                    </span>
                  ) : (
                    <span className="transaction-table__no-category">—</span>
                  )}
                </td>
                <td className="transaction-table__cell transaction-table__cell-source">
                  <div className="transaction-table__account">
                    <span className="transaction-table__account-prefix">
                      CR
                    </span>
                    <span className="transaction-table__account-name">
                      {txn.fromAccount.name}
                    </span>
                  </div>
                </td>
                <td className="transaction-table__cell transaction-table__cell-dest">
                  <div className="transaction-table__account">
                    <span className="transaction-table__account-prefix">
                      DR
                    </span>
                    <span className="transaction-table__account-name">
                      {txn.toAccount.name}
                    </span>
                  </div>
                </td>
                <td className="transaction-table__cell transaction-table__cell-type">
                  <span
                    className={`transaction-table__type-badge transaction-table__type-badge--${type}`}
                  >
                    {type.toUpperCase()}
                  </span>
                </td>
                <td className="transaction-table__cell transaction-table__cell-amount">
                  <span
                    className={`transaction-table__amount transaction-table__amount--${type}`}
                  >
                    {type === 'expense' ? '-' : ''}
                    {formatCurrency(txn.amount)}
                  </span>
                </td>
                <td className="transaction-table__cell transaction-table__cell-actions">
                  {onDelete && (
                    <button
                      className="transaction-table__delete-btn"
                      onClick={() => onDelete(txn)}
                      title="Delete transaction"
                    >
                      ✕
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default TransactionTable
