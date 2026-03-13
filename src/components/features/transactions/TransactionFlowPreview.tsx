import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { formatCurrency } from '@/utils/currencyUtils'
import type { Account } from '@/types/account'

interface TransactionFlowPreviewProps {
  fromAccount: Account | undefined
  toAccount: Account | undefined
  amount: string
  arrowColor: string
  fromLabel: string
  toLabel: string
}

const FlowAccountBox: React.FC<{
  label: string
  name: string
  balance: number
}> = ({ label, name, balance }) => (
  <Box
    sx={{
      flex: 1,
      p: '0.75rem',
      backgroundColor: 'action.selected',
      border: '1px solid', borderColor: 'divider',
      borderRadius: '6px',
      textAlign: 'center',
    }}
  >
    <Typography
      sx={{
        fontSize: '0.625rem',
        fontWeight: 600,
        color: 'text.secondary',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        mb: '0.25rem',
      }}
    >
      {label}
    </Typography>
    <Typography
      sx={{
        fontSize: '0.875rem',
        fontWeight: 600,
        color: 'text.primary',
        mb: '0.25rem',
      }}
    >
      {name}
    </Typography>
    <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
      {formatCurrency(balance)}
    </Typography>
  </Box>
)

export const TransactionFlowPreview: React.FC<TransactionFlowPreviewProps> = ({
  fromAccount,
  toAccount,
  amount,
  arrowColor,
  fromLabel,
  toLabel,
}) => (
  <Box
    sx={{
      backgroundColor: 'background.paper',
      border: '1px solid', borderColor: 'divider',
      borderRadius: '8px',
      p: '1rem',
      my: '0.5rem',
    }}
  >
    <Typography
      sx={{
        fontSize: '0.75rem',
        fontWeight: 600,
        color: 'text.secondary',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        mb: '0.75rem',
      }}
    >
      Flow Preview
    </Typography>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
      }}
    >
      <FlowAccountBox
        label={fromLabel}
        name={fromAccount?.name ?? 'Account'}
        balance={fromAccount?.balance ?? 0}
      />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <Typography sx={{ fontSize: '1.5rem', color: arrowColor }}>
          →
        </Typography>
        <Typography
          sx={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'primary.main',
            mt: '0.25rem',
          }}
        >
          {formatCurrency(Math.round(parseFloat(amount) * 100))}
        </Typography>
      </Box>
      <FlowAccountBox
        label={toLabel}
        name={toAccount?.name ?? 'Account'}
        balance={toAccount?.balance ?? 0}
      />
    </Box>
  </Box>
)
