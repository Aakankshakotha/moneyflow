import React from 'react'
import { formatCurrency } from '@/utils/currencyUtils'
import { formatDate } from '@/utils/dateUtils'
import { getCategoryById } from '@/constants/categories'
import type { TransactionWithAccounts } from '@/types/transaction'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'

interface TransactionTableRowProps {
  txn: TransactionWithAccounts
  onDelete?: (txn: TransactionWithAccounts) => void
}

type TxnType = 'income' | 'expense' | 'transfer'

const getTransactionType = (txn: TransactionWithAccounts): TxnType => {
  if (txn.fromAccount.type === 'income' && txn.toAccount.type === 'asset')
    return 'income'
  if (txn.fromAccount.type === 'asset' && txn.toAccount.type === 'expense')
    return 'expense'
  return 'transfer'
}

const TYPE_AMOUNT_COLOR: Record<TxnType, string> = {
  income: 'success.main',
  expense: 'error.main',
  transfer: 'text.primary',
}

const TYPE_CHIP_COLOR: Record<TxnType, 'success' | 'error' | 'info'> = {
  income: 'success',
  expense: 'error',
  transfer: 'info',
}

const TYPE_ICON: Record<TxnType, string> = {
  income: '💰',
  expense: '🛍️',
  transfer: '🔄',
}

export const TransactionTableRow: React.FC<TransactionTableRowProps> = ({
  txn,
  onDelete,
}) => {
  const category = txn.category ? getCategoryById(txn.category) : null
  const type = getTransactionType(txn)

  return (
    <TableRow hover>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Box
            sx={{
              width: '2rem',
              height: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'action.selected',
              borderRadius: '50%',
              flexShrink: 0,
            }}
          >
            {TYPE_ICON[type]}
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
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
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
          <Typography sx={{ color: 'text.secondary' }}>—</Typography>
        )}
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Typography
            component="span"
            sx={{
              fontSize: '0.65rem',
              fontWeight: 700,
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            CR
          </Typography>
          <Typography
            component="span"
            sx={{ fontSize: '0.875rem', color: 'text.primary' }}
          >
            {txn.fromAccount.name}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Typography
            component="span"
            sx={{
              fontSize: '0.65rem',
              fontWeight: 700,
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            DR
          </Typography>
          <Typography
            component="span"
            sx={{ fontSize: '0.875rem', color: 'text.primary' }}
          >
            {txn.toAccount.name}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Chip
          label={type.toUpperCase()}
          size="small"
          color={TYPE_CHIP_COLOR[type]}
          variant="outlined"
          sx={{ fontWeight: 600, fontSize: '0.7rem' }}
        />
      </TableCell>
      <TableCell>
        <Typography
          component="span"
          sx={{
            fontSize: '0.9rem',
            fontWeight: 600,
            color: TYPE_AMOUNT_COLOR[type],
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
              color: 'text.secondary',
              '&:hover': { color: 'error.main' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </TableCell>
    </TableRow>
  )
}
