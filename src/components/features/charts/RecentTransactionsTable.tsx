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

  const getCategoryChip = (
    transaction: TransactionWithAccounts
  ): JSX.Element => {
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
        color={isIncome ? 'success' : isExpense ? 'error' : 'default'}
        variant="outlined"
        sx={{ fontWeight: 500, fontSize: '0.75rem' }}
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
        color={isCompleted ? 'success' : 'warning'}
        variant="outlined"
        sx={{ fontWeight: 500, fontSize: '0.75rem' }}
      />
    )
  }

  return (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '0.75rem',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: '1.25rem 1.5rem',
          borderBottom: '1px solid',
          borderBottomColor: 'divider',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            fontSize: '1rem',
            color: 'text.primary',
          }}
        >
          Recent Transactions
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<FilterListIcon />}
          className="recent-transactions__filter-btn"
          sx={{
            textTransform: 'none',
            borderColor: 'divider',
            color: 'text.primary',
            '&:hover': {
              borderColor: 'primary.main',
              color: 'primary.main',
            },
          }}
        >
          Filter
        </Button>
      </Box>

      <Box sx={{ overflowX: 'auto' }}>
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
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                    }}
                  >
                    <Box
                      sx={{
                        width: '2.25rem',
                        height: '2.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'action.selected',
                        borderRadius: '50%',
                        flexShrink: 0,
                      }}
                    >
                      {txn.toAccount.type === 'expense' ? '💰' : '📈'}
                    </Box>
                    <Box>
                      <Typography
                        sx={{
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: 'text.primary',
                        }}
                      >
                        {txn.description}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '0.75rem',
                          color: 'text.secondary',
                        }}
                      >
                        {txn.fromAccount.name}
                      </Typography>
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
                    sx={{
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color:
                        txn.toAccount.type === 'expense'
                          ? 'error.main'
                          : 'success.main',
                    }}
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

      <Box
        sx={{
          p: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'center',
          borderTop: '1px solid',
          borderTopColor: 'divider',
        }}
      >
        <Button
          variant="outlined"
          className="view-all-btn"
          sx={{
            textTransform: 'none',
            borderColor: 'divider',
            color: 'text.primary',
            px: 3,
            py: 1.25,
            '&:hover': {
              borderColor: 'primary.main',
              color: 'primary.main',
            },
          }}
        >
          View All Transactions
        </Button>
      </Box>
    </Box>
  )
}
