import React from 'react'
import { formatCurrency } from '@/utils/currencyUtils'
import { formatDate } from '@/utils/dateUtils'
import { getCategoryById } from '@/constants/categories'
import type { TransactionWithAccounts } from '@/types/transaction'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
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
      <Box className="transaction-table__empty">
        <Typography>No transactions found</Typography>
        <Typography className="transaction-table__empty-hint">
          Try adjusting your filters or record a new transaction
        </Typography>
      </Box>
    )
  }

  return (
    <Box className="transaction-table">
      <Table className="transaction-table__table">
        <TableHead className="transaction-table__header">
          <TableRow>
            <TableCell className="transaction-table__col-date">DATE &amp; DESCRIPTION</TableCell>
            <TableCell className="transaction-table__col-category">CATEGORY</TableCell>
            <TableCell className="transaction-table__col-source">SOURCE (DEBIT)</TableCell>
            <TableCell className="transaction-table__col-dest">DEST (DEBIT)</TableCell>
            <TableCell className="transaction-table__col-type">TYPE</TableCell>
            <TableCell className="transaction-table__col-amount">AMOUNT</TableCell>
            <TableCell className="transaction-table__col-actions">ACTIONS</TableCell>
          </TableRow>
        </TableHead>
        <TableBody className="transaction-table__body">
          {transactions.map((txn) => {
            const category = txn.category ? getCategoryById(txn.category) : null
            const type = getTransactionType(txn)

            return (
              <TableRow key={txn.id} className="transaction-table__row" hover>
                <TableCell className="transaction-table__cell transaction-table__cell-date">
                  <Box className="transaction-table__date-container">
                    <Box className="transaction-table__icon">
                      {type === 'income' ? '💰' : type === 'expense' ? '🛍️' : '🔄'}
                    </Box>
                    <Box>
                      <Typography className="transaction-table__description">
                        {txn.description}
                      </Typography>
                      <Typography className="transaction-table__date">
                        {formatDate(new Date(txn.date), 'MMM dd, yyyy')} •{' '}
                        {new Date(txn.date).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell className="transaction-table__cell transaction-table__cell-category">
                  {category ? (
                    <Chip
                      label={category.name}
                      size="small"
                      className="transaction-table__category-badge"
                      sx={{
                        backgroundColor: `${category.color}20`,
                        color: category.color,
                        fontWeight: 500,
                        fontSize: '0.75rem',
                      }}
                    />
                  ) : (
                    <Typography className="transaction-table__no-category">—</Typography>
                  )}
                </TableCell>
                <TableCell className="transaction-table__cell transaction-table__cell-source">
                  <Box className="transaction-table__account">
                    <Typography component="span" className="transaction-table__account-prefix">CR</Typography>
                    <Typography component="span" className="transaction-table__account-name">
                      {txn.fromAccount.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell className="transaction-table__cell transaction-table__cell-dest">
                  <Box className="transaction-table__account">
                    <Typography component="span" className="transaction-table__account-prefix">DR</Typography>
                    <Typography component="span" className="transaction-table__account-name">
                      {txn.toAccount.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell className="transaction-table__cell transaction-table__cell-type">
                  <Chip
                    label={type.toUpperCase()}
                    size="small"
                    className={`transaction-table__type-badge transaction-table__type-badge--${type}`}
                    sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                  />
                </TableCell>
                <TableCell className="transaction-table__cell transaction-table__cell-amount">
                  <Typography
                    component="span"
                    className={`transaction-table__amount transaction-table__amount--${type}`}
                  >
                    {type === 'expense' ? '-' : ''}
                    {formatCurrency(txn.amount)}
                  </Typography>
                </TableCell>
                <TableCell className="transaction-table__cell transaction-table__cell-actions">
                  {onDelete && (
                    <IconButton
                      className="transaction-table__delete-btn"
                      onClick={() => onDelete(txn)}
                      title="Delete transaction"
                      size="small"
                      aria-label="Delete transaction"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Box>
  )
}

export default TransactionTable
