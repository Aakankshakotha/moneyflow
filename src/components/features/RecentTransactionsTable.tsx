import React from 'react'
import type { TransactionWithAccounts } from '@/types/transaction'
import { formatCurrency } from '@/utils/currencyUtils'
import { formatDate } from '@/utils/dateUtils'
import { categoryService } from '@/services/categoryService'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import FilterListIcon from '@mui/icons-material/FilterList'
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

  const getCategoryChip = (transaction: TransactionWithAccounts): JSX.Element => {
    if (transaction.category) {
      const category = categoryService.getCategoryById(transaction.category)
      if (category) {
        return (
          <Chip
            label={`${category.icon} ${category.name}`}
            size="small"
            sx={{
              backgroundColor: category.color + '20',
              color: category.color,
              border: `1px solid ${category.color}`,
              fontWeight: 500,
              fontSize: '0.75rem',
            }}
          />
        )
      }
    }

    const account = transaction.toAccount
    const isExpense = account.type === 'expense'
    const isIncome = account.type === 'income'

    return (
      <Chip
        label={account.name}
        size="small"
        sx={{
          backgroundColor: isIncome
            ? 'rgba(34,197,94,0.1)'
            : isExpense
              ? 'rgba(239,68,68,0.1)'
              : undefined,
          color: isIncome ? '#22c55e' : isExpense ? '#ef4444' : undefined,
          fontWeight: 500,
          fontSize: '0.75rem',
        }}
      />
    )
  }

  const getStatusChip = (transaction: TransactionWithAccounts): JSX.Element => {
    const daysSince = Math.floor(
      (Date.now() - new Date(transaction.date).getTime()) /
        (1000 * 60 * 60 * 24)
    )
    const isCompleted = daysSince <= 7
    return (
      <Chip
        label={isCompleted ? 'Completed' : 'Pending'}
        size="small"
        sx={{
          backgroundColor: isCompleted
            ? 'rgba(34,197,94,0.1)'
            : 'rgba(251,146,60,0.1)',
          color: isCompleted ? '#22c55e' : '#fb923c',
          fontWeight: 500,
          fontSize: '0.75rem',
        }}
      />
    )
  }

  return (
    <Box className="recent-transactions">
      <Box className="recent-transactions__header">
        <Typography variant="h6" className="recent-transactions__title">
          Recent Transactions
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<FilterListIcon />}
          className="recent-transactions__filter-btn"
          sx={{
            textTransform: 'none',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
            '&:hover': { borderColor: 'var(--primary-color)', color: 'var(--primary-color)' },
          }}
        >
          Filter
        </Button>
      </Box>

      <Box className="recent-transactions__table">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ paddingLeft: '60px' }}>Transaction</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Account</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentTransactions.map((txn) => (
              <TableRow key={txn.id} hover>
                <TableCell>
                  <Box className="txn-info">
                    <Box className="txn-icon">
                      {txn.toAccount.type === 'expense' ? '💰' : '📈'}
                    </Box>
                    <Box className="txn-details">
                      <Typography className="txn-description">{txn.description}</Typography>
                      <Typography className="txn-sub">{txn.fromAccount.name}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{formatDate(new Date(txn.date))}</TableCell>
                <TableCell>{getCategoryChip(txn)}</TableCell>
                <TableCell>{txn.fromAccount.name}</TableCell>
                <TableCell>{getStatusChip(txn)}</TableCell>
                <TableCell align="right">
                  <Typography
                    component="span"
                    className={
                      txn.toAccount.type === 'expense'
                        ? 'amount amount--negative'
                        : 'amount amount--positive'
                    }
                  >
                    {txn.toAccount.type === 'expense' ? '-' : '+'}
                    {formatCurrency(txn.amount)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <Box className="recent-transactions__footer">
        <Button
          variant="outlined"
          className="view-all-btn"
          sx={{
            textTransform: 'none',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
            px: 3,
            py: 1.25,
            '&:hover': { borderColor: 'var(--primary-color)', color: 'var(--primary-color)' },
          }}
        >
          View All Transactions
        </Button>
      </Box>
    </Box>
  )
}
