import React from 'react'
import type { Account } from '@/types/account'
import { Card, Button } from '@/components/common'
import { formatCurrency } from '@/utils/currencyUtils'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import { useTheme, alpha } from '@mui/material/styles'

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
  const theme = useTheme()
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
    asset: 'success.main',
    income: 'success.main',
    liability: 'error.main',
    expense: 'error.main',
  }

  const amountDisplay = getAmountDisplay(account)

  const hasInvestmentData =
    account.type === 'asset' && account.costBasis !== undefined
  const gainLoss = hasInvestmentData
    ? account.balance - (account.costBasis ?? 0)
    : 0
  const gainLossPct =
    hasInvestmentData && (account.costBasis ?? 0) !== 0
      ? (gainLoss / (account.costBasis ?? 1)) * 100
      : 0
  const gainLossColor = gainLoss >= 0 ? 'success.main' : 'error.main'

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
              color: 'text.primary',
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
                color: 'text.secondary',
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
              backgroundColor: 'action.selected',
              color: 'text.secondary',
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
                ? alpha(theme.palette.success.main, 0.1)
                : alpha(theme.palette.secondary.main, 0.1),
            color:
              account.status === 'active' ? 'success.main' : 'text.secondary',
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
          borderTop: '1px solid',
          borderTopColor: 'divider',
          borderBottom: '1px solid',
          borderBottomColor: 'divider',
        }}
      >
        <Typography
          component="span"
          sx={{ fontSize: '0.875rem', color: 'text.secondary' }}
        >
          {amountDisplay.label}
        </Typography>
        <Typography
          component="span"
          sx={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: toneColor[amountDisplay.tone] ?? 'text.primary',
          }}
        >
          {formatCurrency(amountDisplay.value)}
        </Typography>
      </Box>

      {hasInvestmentData && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            py: '0.5rem',
            borderBottom: '1px solid',
            borderBottomColor: 'divider',
          }}
        >
          <Typography
            component="span"
            sx={{ fontSize: '0.8rem', color: 'text.secondary' }}
          >
            Invested: {formatCurrency(account.costBasis ?? 0)}
          </Typography>
          <Typography
            component="span"
            sx={{ fontSize: '0.875rem', fontWeight: 600, color: gainLossColor }}
          >
            {gainLoss >= 0 ? '+' : ''}
            {formatCurrency(gainLoss)} ({gainLoss >= 0 ? '+' : ''}
            {gainLossPct.toFixed(2)}%)
          </Typography>
        </Box>
      )}
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
