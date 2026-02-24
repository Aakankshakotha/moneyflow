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
      <Box
        sx={{
          textAlign: 'center',
          py: '4rem',
          px: '2rem',
          color: 'var(--text-secondary)',
        }}
      >
        <Typography>No transactions found</Typography>
        <Typography
          sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}
        >
          Try adjusting your filters or record a new transaction
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        backgroundColor: 'var(--card-background)',
        border: '1px solid var(--border-color)',
        borderRadius: '0.5rem',
        overflow: 'hidden',
      }}
    >
      <Table>
        <TableHead sx={{ backgroundColor: 'var(--background-secondary)' }}>
          <TableRow>
            <TableCell
              sx={{
                width: '25%',
                fontWeight: 600,
                fontSize: '0.75rem',
                letterSpacing: '0.05em',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
              }}
            >
              DATE &amp; DESCRIPTION
            </TableCell>
            <TableCell
              sx={{
                width: '12%',
                fontWeight: 600,
                fontSize: '0.75rem',
                letterSpacing: '0.05em',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
              }}
            >
              CATEGORY
            </TableCell>
            <TableCell
              sx={{
                width: '16%',
                fontWeight: 600,
                fontSize: '0.75rem',
                letterSpacing: '0.05em',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
              }}
            >
              SOURCE (DEBIT)
            </TableCell>
            <TableCell
              sx={{
                width: '16%',
                fontWeight: 600,
                fontSize: '0.75rem',
                letterSpacing: '0.05em',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
              }}
            >
              DEST (DEBIT)
            </TableCell>
            <TableCell
              sx={{
                width: '10%',
                fontWeight: 600,
                fontSize: '0.75rem',
                letterSpacing: '0.05em',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
              }}
            >
              TYPE
            </TableCell>
            <TableCell
              sx={{
                width: '12%',
                fontWeight: 600,
                fontSize: '0.75rem',
                letterSpacing: '0.05em',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
              }}
            >
              AMOUNT
            </TableCell>
            <TableCell
              sx={{
                width: '9%',
                fontWeight: 600,
                fontSize: '0.75rem',
                letterSpacing: '0.05em',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
              }}
            >
              ACTIONS
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((txn) => {
            const category = txn.category ? getCategoryById(txn.category) : null
            const type = getTransactionType(txn)

            return (
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
                        width: '2rem',
                        height: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'var(--background-secondary)',
                        borderRadius: '50%',
                        flexShrink: 0,
                      }}
                    >
                      {type === 'income'
                        ? '💰'
                        : type === 'expense'
                          ? '🛍️'
                          : '🔄'}
                    </Box>
                    <Box>
                      <Typography
                        sx={{
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: 'var(--text-primary)',
                        }}
                      >
                        {txn.description}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {formatDate(new Date(txn.date), 'MMM dd, yyyy')} •{' '}
                        {new Date(txn.date).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  {category ? (
                    <Chip
                      label={category.name}
                      size="small"
                      sx={{
                        backgroundColor: `${category.color}20`,
                        color: category.color,
                        fontWeight: 500,
                        fontSize: '0.75rem',
                      }}
                    />
                  ) : (
                    <Typography sx={{ color: 'var(--text-secondary)' }}>
                      —
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <Typography
                      component="span"
                      sx={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      CR
                    </Typography>
                    <Typography
                      component="span"
                      sx={{
                        fontSize: '0.875rem',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {txn.fromAccount.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <Typography
                      component="span"
                      sx={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      DR
                    </Typography>
                    <Typography
                      component="span"
                      sx={{
                        fontSize: '0.875rem',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {txn.toAccount.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={type.toUpperCase()}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      backgroundColor:
                        type === 'income'
                          ? 'rgba(16,185,129,0.1)'
                          : type === 'expense'
                            ? 'rgba(239,68,68,0.1)'
                            : 'rgba(59,130,246,0.1)',
                      color:
                        type === 'income'
                          ? '#10b981'
                          : type === 'expense'
                            ? '#ef4444'
                            : '#3b82f6',
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color:
                        type === 'income'
                          ? '#10b981'
                          : type === 'expense'
                            ? '#ef4444'
                            : 'var(--text-primary)',
                    }}
                  >
                    {type === 'expense' ? '-' : ''}
                    {formatCurrency(txn.amount)}
                  </Typography>
                </TableCell>
                <TableCell>
                  {onDelete && (
                    <IconButton
                      onClick={() => onDelete(txn)}
                      title="Delete transaction"
                      size="small"
                      aria-label="Delete transaction"
                      sx={{
                        color: 'var(--text-secondary)',
                        '&:hover': { color: 'var(--error-color)' },
                      }}
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
