import React from 'react'
import Typography from '@mui/material/Typography'
import { Select } from '@/components/common'
import { formatCurrency } from '@/utils/currencyUtils'
import type { Account } from '@/types/account'

interface TransactionAccountFieldsProps {
  primaryLabel: string
  primaryAccounts: Account[]
  primaryAccountId: string
  onPrimaryChange: (id: string) => void
  displayAccount: Account | undefined
  secondaryLabel: string
  secondaryAccounts: Account[]
  secondaryAccountId: string
  secondaryPlaceholder: string
  onSecondaryChange: (id: string) => void
}

export const TransactionAccountFields: React.FC<
  TransactionAccountFieldsProps
> = ({
  primaryLabel,
  primaryAccounts,
  primaryAccountId,
  onPrimaryChange,
  displayAccount,
  secondaryLabel,
  secondaryAccounts,
  secondaryAccountId,
  secondaryPlaceholder,
  onSecondaryChange,
}) => (
  <>
    <Select
      label={primaryLabel}
      value={primaryAccountId}
      onChange={(e) => onPrimaryChange(e.target.value)}
      options={primaryAccounts.map((acc) => ({
        value: acc.id,
        label: `${acc.name} (${formatCurrency(acc.balance)})`,
      }))}
      required
      placeholder="Select account"
    />

    {displayAccount &&
      displayAccount.type !== 'income' &&
      displayAccount.type !== 'expense' && (
        <Typography
          sx={{
            mt: '-1rem',
            mb: '0.5rem',
            fontSize: '0.875rem',
            color: 'text.secondary',
            pl: '0.25rem',
          }}
        >
          Available: {formatCurrency(displayAccount.balance)}
        </Typography>
      )}

    {primaryAccountId && (
      <Select
        label={secondaryLabel}
        value={secondaryAccountId}
        onChange={(e) => onSecondaryChange(e.target.value)}
        options={secondaryAccounts.map((acc) => ({
          value: acc.id,
          label: `${acc.name} (${formatCurrency(acc.balance)})`,
        }))}
        required
        placeholder={secondaryPlaceholder}
      />
    )}
  </>
)
