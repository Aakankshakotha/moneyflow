import React from 'react'
import type { TransactionWithAccounts } from '@/types/transaction'
import { formatCurrency } from '@/utils/currencyUtils'
import { formatDate } from '@/utils/dateUtils'
import { categoryService } from '@/services/categoryService'
import './RecentTransactionsTable.css'

interface RecentTransactionsTableProps {
  transactions: TransactionWithAccounts[]
  limit?: number
}

export const RecentTransactionsTable: React.FC<
  RecentTransactionsTableProps
> = ({ transactions, limit = 5 }) => {
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)

  const getCategoryBadge = (
    transaction: TransactionWithAccounts
  ): JSX.Element => {
    if (transaction.category) {
      const category = categoryService.getCategoryById(transaction.category)
      if (category) {
        const badgeClass =
          category.group === 'income'
            ? 'txn-badge txn-badge--income'
            : 'txn-badge txn-badge--expense'

        return (
          <span
            className={badgeClass}
            style={{
              backgroundColor: category.color + '20',
              color: category.color,
              borderColor: category.color,
            }}
          >
            {category.icon} {category.name}
          </span>
        )
      }
    }

    // Fallback to account type if no category
    const account = transaction.toAccount
    if (account.type === 'expense') {
      return (
        <span className="txn-badge txn-badge--expense">{account.name}</span>
      )
    }
    if (account.type === 'income') {
      return <span className="txn-badge txn-badge--income">{account.name}</span>
    }
    return <span className="txn-badge">{account.name}</span>
  }

  const getStatusBadge = (
    transaction: TransactionWithAccounts
  ): JSX.Element => {
    // Simple heuristic: if it's recent (within 7 days), show as "Completed"
    const daysSince = Math.floor(
      (Date.now() - new Date(transaction.date).getTime()) /
        (1000 * 60 * 60 * 24)
    )
    if (daysSince <= 7) {
      return (
        <span className="status-badge status-badge--completed">Completed</span>
      )
    }
    return <span className="status-badge status-badge--pending">Pending</span>
  }

  return (
    <div className="recent-transactions">
      <div className="recent-transactions__header">
        <h3 className="recent-transactions__title">Recent Transactions</h3>
        <button className="recent-transactions__filter-btn">🔍 Filter</button>
      </div>

      <div className="recent-transactions__table">
        <table>
          <thead>
            <tr>
              <th>Transaction</th>
              <th>Date</th>
              <th>Category</th>
              <th>Account</th>
              <th>Status</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.map((txn) => (
              <tr key={txn.id}>
                <td>
                  <div className="txn-info">
                    <div className="txn-icon">
                      {txn.toAccount.type === 'expense' ? '💰' : '📈'}
                    </div>
                    <div className="txn-details">
                      <div className="txn-description">{txn.description}</div>
                      <div className="txn-sub">{txn.fromAccount.name}</div>
                    </div>
                  </div>
                </td>
                <td>{formatDate(new Date(txn.date))}</td>
                <td>{getCategoryBadge(txn)}</td>
                <td>{txn.fromAccount.name}</td>
                <td>{getStatusBadge(txn)}</td>
                <td className="amount">
                  <span
                    className={
                      txn.toAccount.type === 'expense'
                        ? 'amount--negative'
                        : 'amount--positive'
                    }
                  >
                    {txn.toAccount.type === 'expense' ? '-' : '+'}
                    {formatCurrency(txn.amount)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="recent-transactions__footer">
        <button className="view-all-btn">View All Transactions</button>
      </div>
    </div>
  )
}
