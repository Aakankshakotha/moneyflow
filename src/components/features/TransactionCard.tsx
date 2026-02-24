import React from 'react'
import { Card } from '@/components/common'
import { formatCurrency } from '@/utils/currencyUtils'
import { formatDate } from '@/utils/dateUtils'
import { getCategoryById } from '@/constants/categories'
import type { TransactionWithAccounts } from '@/types/transaction'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'

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

  const typeColors: Record<string, { bg: string; color: string }> = {
    income: { bg: 'rgba(34,197,94,0.1)', color: '#22c55e' },
    expense: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
    transfer: { bg: 'rgba(99,102,241,0.1)', color: '#6366f1' },
  }

  return (
    <Card
      noPadding
      sx={{
        px: '1rem',
        py: '0.75rem',
        borderLeft: '3px solid transparent',
        '&:hover': { backgroundColor: 'var(--hover-background)' },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flex: 1,
            minWidth: 0,
          }}
        >
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              minWidth: '65px',
            }}
          >
            {formatDate(new Date(transaction.date), 'MMM dd')}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              minWidth: 0,
              flex: 1,
            }}
          >
            <Typography
              component="span"
              sx={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {transaction.fromAccount.name}
            </Typography>
            <Typography
              component="span"
              sx={{
                fontSize: '1rem',
                color: 'var(--text-secondary)',
                flexShrink: 0,
              }}
            >
              →
            </Typography>
            <Typography
              component="span"
              sx={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {transaction.toAccount.name}
            </Typography>
          </Box>
          <Typography
            sx={{
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flex: 1,
            }}
          >
            {transaction.description}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Chip
            label={typeLabels[transactionType]}
            size="small"
            sx={{
              backgroundColor: typeColors[transactionType].bg,
              color: typeColors[transactionType].color,
              fontWeight: 600,
              fontSize: '0.7rem',
            }}
          />
          {category && (
            <Chip
              label={category.name}
              size="small"
              sx={{
                backgroundColor: `${category.color}20`,
                color: category.color,
                fontSize: '0.75rem',
              }}
            />
          )}
          <Typography
            sx={{
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
            }}
          >
            {formatCurrency(transaction.amount)}
          </Typography>
          {onDelete && (
            <IconButton
              onClick={handleDelete}
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
        </Box>
      </Box>
    </Card>
  )
}

export default TransactionCard
