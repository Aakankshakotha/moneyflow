import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import type { SvgIconComponent } from '@mui/icons-material'
import type { Account, AccountType } from '@/types/account'
import { AccountRow } from './AccountRow'
import { formatCurrency } from '@/utils/currencyUtils'

interface SectionDefinition {
  type: AccountType
  label: string
  dotColor: string
}

const SECTIONS: SectionDefinition[] = [
  { type: 'asset', label: 'Assets', dotColor: 'success.main' },
  { type: 'liability', label: 'Liabilities', dotColor: 'error.main' },
  { type: 'income', label: 'Income', dotColor: 'info.main' },
  { type: 'expense', label: 'Expenses', dotColor: 'warning.main' },
]

const SECTION_ICONS: Record<AccountType, SvgIconComponent> = {
  asset: AccountBalanceIcon,
  liability: CreditCardIcon,
  income: AttachMoneyIcon,
  expense: ReceiptLongIcon,
}

interface AccountSectionProps {
  type: AccountType
  accounts: Account[]
  selectedAccountId: string | null
  onSelectAccount: (id: string) => void
  showArchived: boolean
  accountMap: Map<string, Account>
  accountTrendMap: Map<string, number[]>
  buildSparklinePoints: (values: number[]) => string
}

export const AccountSection: React.FC<AccountSectionProps> = ({
  type,
  accounts,
  selectedAccountId,
  onSelectAccount,
  showArchived,
  accountMap,
  accountTrendMap,
  buildSparklinePoints,
}) => {
  const section = SECTIONS.find((s) => s.type === type)!
  const SectionIcon = SECTION_ICONS[type]
  const sectionTotal = accounts.reduce((sum, a) => sum + Math.abs(a.balance), 0)
  const singularLabel = section.label.slice(0, -1)

  // DFS ordering: parents first, children immediately after their parent
  const orderedAccounts = React.useMemo(() => {
    const byParentId = new Map<string, Account[]>()
    const roots: Account[] = []
    accounts.forEach((a) => {
      if (!a.parentAccountId) {
        roots.push(a)
        return
      }
      if (!byParentId.has(a.parentAccountId))
        byParentId.set(a.parentAccountId, [])
      byParentId.get(a.parentAccountId)!.push(a)
    })
    const ordered: Account[] = []
    const visit = (a: Account): void => {
      ordered.push(a)
      byParentId
        .get(a.id)
        ?.sort((x, y) => x.name.localeCompare(y.name))
        .forEach(visit)
    }
    roots.sort((a, b) => a.name.localeCompare(b.name)).forEach(visit)
    accounts
      .filter(
        (a) =>
          a.parentAccountId && !accounts.some((p) => p.id === a.parentAccountId)
      )
      .forEach((a) => {
        if (!ordered.includes(a)) ordered.push(a)
      })
    return ordered
  }, [accounts])

  // Count direct children per parent id
  const childCountMap = React.useMemo(() => {
    const map = new Map<string, number>()
    accounts.forEach((a) => {
      if (a.parentAccountId) {
        map.set(a.parentAccountId, (map.get(a.parentAccountId) ?? 0) + 1)
      }
    })
    return map
  }, [accounts])

  return (
    <Box
      component="section"
      sx={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}
    >
      <Box
        component="header"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: '0 0.25rem',
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          sx={{
            m: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            color: 'primary.main',
            fontSize: '1.15rem',
            fontWeight: 700,
          }}
        >
          <Box
            component="span"
            sx={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: section.dotColor,
              display: 'inline-block',
            }}
          />
          {section.label}
        </Typography>
        <Typography
          component="span"
          sx={{
            color: 'primary.main',
            fontSize: '0.9rem',
            fontWeight: 600,
            letterSpacing: '0.03em',
          }}
        >
          {formatCurrency(sectionTotal)}
        </Typography>
      </Box>

      <Box
        sx={{
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {orderedAccounts.map((account) => (
            <AccountRow
              key={account.id}
              account={account}
              isSelected={selectedAccountId === account.id}
              onClick={() => onSelectAccount(account.id)}
              trendValues={accountTrendMap.get(account.id) ?? []}
              showArchived={showArchived}
              parentName={
                account.parentAccountId
                  ? accountMap.get(account.parentAccountId)?.name
                  : undefined
              }
              sectionLabel={singularLabel}
              SectionIcon={SectionIcon}
              buildSparklinePoints={buildSparklinePoints}
              childCount={childCountMap.get(account.id)}
            />
          ))}
        </Box>
      </Box>
    </Box>
  )
}
