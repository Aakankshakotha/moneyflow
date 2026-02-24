import React from 'react'
import type { Account } from '@/types/account'
import { Card, Button } from '@/components/common'
import { formatCurrency } from '@/utils/currencyUtils'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'

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
      return {
        label: 'Total Inflow:',
        value: Math.abs(accountData.balance),
        tone: 'income',
      }
    }
    if (accountData.type === 'expense') {
      return {
        label: 'Total Spent:',
        value: Math.abs(accountData.balance),
        tone: 'expense',
      }
    }
    if (accountData.type === 'liability') {
      return {
        label: 'Balance:',
        value: accountData.balance,
        tone: 'liability',
      }
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

  const toneColor: Record<string, string> = {
    asset: 'var(--success-color)',
    income: 'var(--success-color)',
    liability: 'var(--error-color)',
    expense: 'var(--error-color)',
  }

  const amountDisplay = getAmountDisplay(account)

  return (
    <Card sx={{ mb: 1 }} hoverable>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 1,
        }}
      >
        <Box>
          <Typography
            variant="h6"
            component="h3"
            sx={{
              m: 0,
              mb: '0.25rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            {account.name}
          </Typography>
          {parentName && (
            <Typography
              variant="body2"
              sx={{
                mb: '0.4rem',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
              }}
            >
              Sub-account of {parentName}
            </Typography>
          )}
          <Typography
            component="span"
            sx={{
              display: 'inline-block',
              px: '0.5rem',
              py: '0.25rem',
              backgroundColor: 'var(--badge-background)',
              color: 'var(--text-secondary)',
              borderRadius: '4px',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            {getTypeLabel(account.type)}
          </Typography>
        </Box>
        <Chip
          label={account.status === 'active' ? 'Active' : 'Archived'}
          size="small"
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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: '0.75rem',
          borderTop: '1px solid var(--border-color)',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <Typography
          component="span"
          sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}
        >
          {amountDisplay.label}
        </Typography>
        <Typography
          component="span"
          sx={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: toneColor[amountDisplay.tone] ?? 'var(--text-primary)',
          }}
        >
          {formatCurrency(amountDisplay.value)}
        </Typography>
      </Box>
      {(onEdit || onToggleStatus || onDelete) && (
        <Box sx={{ display: 'flex', gap: '0.5rem', mt: 1 }}>
          {onEdit && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit(account)}
            >
              Edit
            </Button>
          )}
          {onToggleStatus && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onToggleStatus(account)}
            >
              {account.status === 'active' ? 'Archive' : 'Unarchive'}
            </Button>
          )}
          {onDelete && (
            <Button
              variant="danger"
              size="sm"
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
