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
  const typeLabels = { income: 'INCOME', expense: 'EXPENSE', transfer: 'TRANSFER' }

  const typeColors: Record<string, { bg: string; color: string }> = {
    income: { bg: 'rgba(34,197,94,0.1)', color: '#22c55e' },
    expense: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
    transfer: { bg: 'rgba(99,102,241,0.1)', color: '#6366f1' },
  }

  return (
    <Card className="transaction-card">
      <Box className="transaction-card__main">
        <Box className="transaction-card__left">
          <Typography className="transaction-card__date">
            {formatDate(new Date(transaction.date), 'MMM dd')}
          </Typography>
          <Box className="transaction-card__flow">
            <Typography component="span" className="transaction-card__account from">
              {transaction.fromAccount.name}
            </Typography>
            <Typography component="span" className="transaction-card__arrow">→</Typography>
            <Typography component="span" className="transaction-card__account to">
              {transaction.toAccount.name}
            </Typography>
          </Box>
          <Typography className="transaction-card__description">
            {transaction.description}
          </Typography>
        </Box>

        <Box className="transaction-card__right">
          <Chip
            label={typeLabels[transactionType]}
            size="small"
            className={`transaction-card__type transaction-card__type--${transactionType}`}
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
              className="transaction-card__category"
              sx={{
                backgroundColor: `${category.color}20`,
                color: category.color,
                fontSize: '0.75rem',
              }}
            />
          )}
          <Typography className="transaction-card__amount">
            {formatCurrency(transaction.amount)}
          </Typography>
          {onDelete && (
            <IconButton
              className="transaction-card__delete"
              onClick={handleDelete}
              size="small"
              aria-label="Delete transaction"
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
