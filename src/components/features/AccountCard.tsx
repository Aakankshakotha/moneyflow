import React from 'react'
import type { Account } from '@/types/account'
import { Card, Button } from '@/components/common'
import { formatCurrency } from '@/utils/currencyUtils'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import './AccountCard.css'

interface AccountCardProps {
  account: Account
  parentName?: string
  onEdit?: (account: Account) => void
  onToggleStatus?: (account: Account) => void
  onDelete?: (account: Account) => void
}

/**
 * AccountCard - displays a single account with its details
 */
const AccountCard: React.FC<AccountCardProps> = ({
  account,
  parentName,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
  const getAmountDisplay = (
    accountData: Account
  ): { label: string; value: number; tone: string } => {
    if (accountData.type === 'income') {
      return { label: 'Total Inflow:', value: Math.abs(accountData.balance), tone: 'income' }
    }
    if (accountData.type === 'expense') {
      return { label: 'Total Spent:', value: Math.abs(accountData.balance), tone: 'expense' }
    }
    if (accountData.type === 'liability') {
      return { label: 'Balance:', value: accountData.balance, tone: 'liability' }
    }
    return { label: 'Balance:', value: accountData.balance, tone: 'asset' }
  }

  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      asset: 'Asset',
      liability: 'Liability',
      income: 'Income',
      expense: 'Expense',
    }
    return labels[type] || type
  }

  const amountDisplay = getAmountDisplay(account)

  return (
    <Card className="account-card">
      <Box className="account-card__header">
        <Box>
          <Typography variant="h6" component="h3" className="account-card__name">
            {account.name}
          </Typography>
          {parentName && (
            <Typography variant="body2" className="account-card__parent">
              Sub-account of {parentName}
            </Typography>
          )}
          <Typography component="span" className="account-card__type">
            {getTypeLabel(account.type)}
          </Typography>
        </Box>
        <Chip
          label={account.status === 'active' ? 'Active' : 'Archived'}
          size="small"
          className={`account-card__badge account-card__badge--${account.status}`}
          sx={{
            backgroundColor:
              account.status === 'active'
                ? 'rgba(34,197,94,0.1)'
                : 'rgba(107,114,128,0.1)',
            color: account.status === 'active' ? '#22c55e' : '#6b7280',
            fontWeight: 500,
            fontSize: '0.75rem',
          }}
        />
      </Box>
      <Box className="account-card__balance">
        <Typography component="span" className="account-card__balance-label">
          {amountDisplay.label}
        </Typography>
        <Typography
          component="span"
          className={`account-card__balance-amount account-card__balance-amount--${amountDisplay.tone}`}
        >
          {formatCurrency(amountDisplay.value)}
        </Typography>
      </Box>
      {(onEdit || onToggleStatus || onDelete) && (
        <Box className="account-card__actions">
          {onEdit && (
            <Button
              variant="secondary"
              size="sm"
              className="account-card__button account-card__button--edit"
              onClick={() => onEdit(account)}
            >
              Edit
            </Button>
          )}
          {onToggleStatus && (
            <Button
              variant="secondary"
              size="sm"
              className="account-card__button account-card__button--archive"
              onClick={() => onToggleStatus(account)}
            >
              {account.status === 'active' ? 'Archive' : 'Unarchive'}
            </Button>
          )}
          {onDelete && (
            <Button
              variant="danger"
              size="sm"
              className="account-card__button account-card__button--delete"
              onClick={() => onDelete(account)}
            >
              Delete
            </Button>
          )}
        </Box>
      )}
    </Card>
  )
}

export default AccountCard
