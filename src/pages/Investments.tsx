import React, { useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import { useTheme, alpha } from '@mui/material/styles'
import EditIcon from '@mui/icons-material/Edit'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { useAccounts } from '@/hooks/useAccounts'
import { AccountForm } from '@/components/features'
import { formatCurrency } from '@/utils/currencyUtils'
import type { Account } from '@/types/account'

type RangeKey = 'today' | 'week' | 'month' | 'all'

const RANGES: { key: RangeKey; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'all', label: 'All Time' },
]

function getRangeSince(key: RangeKey): Date | null {
  const now = new Date()
  if (key === 'today') {
    const d = new Date(now)
    d.setHours(0, 0, 0, 0)
    return d
  }
  if (key === 'week') {
    const d = new Date(now)
    d.setDate(d.getDate() - 6)
    d.setHours(0, 0, 0, 0)
    return d
  }
  if (key === 'month') {
    const d = new Date(now)
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
    return d
  }
  return null
}

const cardSx = {
  backgroundColor: 'background.paper',
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: '12px',
  p: 2,
}

const Investments: React.FC = () => {
  const theme = useTheme()
  const {
    accounts,
    transactions,
    loading,
    error,
    isFormOpen,
    editingAccount,
    handleCreateAccount,
    handleEditAccount,
    handleCloseForm,
  } = useAccounts()

  const [range, setRange] = useState<RangeKey>('month')

  const investmentAccounts = useMemo(
    () =>
      accounts.filter(
        (a) =>
          a.type === 'asset' &&
          a.costBasis !== undefined &&
          a.status === 'active'
      ),
    [accounts]
  )

  const totalInvested = useMemo(
    () => investmentAccounts.reduce((s, a) => s + (a.costBasis ?? 0), 0),
    [investmentAccounts]
  )

  const totalCurrentValue = useMemo(
    () => investmentAccounts.reduce((s, a) => s + a.balance, 0),
    [investmentAccounts]
  )

  const totalGainLoss = totalCurrentValue - totalInvested
  const totalReturnPct =
    totalInvested !== 0 ? (totalGainLoss / totalInvested) * 100 : 0

  const rangeSince = getRangeSince(range)

  const investmentAccountIds = useMemo(
    () => new Set(investmentAccounts.map((a) => a.id)),
    [investmentAccounts]
  )

  const accountMap = useMemo(
    () => new Map(accounts.map((a) => [a.id, a])),
    [accounts]
  )

  const periodTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        const involvesInvestment =
          investmentAccountIds.has(t.fromAccountId) ||
          investmentAccountIds.has(t.toAccountId)
        if (!involvesInvestment) return false
        if (rangeSince && new Date(t.date) < rangeSince) return false
        return true
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [transactions, investmentAccountIds, rangeSince])

  const periodDeployed = useMemo(
    () =>
      periodTransactions
        .filter((t) => investmentAccountIds.has(t.toAccountId))
        .reduce((s, t) => s + t.amount, 0),
    [periodTransactions, investmentAccountIds]
  )

  const periodWithdrawn = useMemo(
    () =>
      periodTransactions
        .filter((t) => investmentAccountIds.has(t.fromAccountId))
        .reduce((s, t) => s + t.amount, 0),
    [periodTransactions, investmentAccountIds]
  )

  const netAdded = periodDeployed - periodWithdrawn

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
        <CircularProgress />
      </Box>
    )
  }

  const glColor = totalGainLoss >= 0 ? 'success.main' : 'error.main'
  const glBg =
    totalGainLoss >= 0
      ? alpha(theme.palette.success.main, 0.08)
      : alpha(theme.palette.error.main, 0.08)

  const summaryCards = [
    {
      label: 'Total Invested',
      value: formatCurrency(totalInvested),
      color: 'text.primary' as const,
    },
    {
      label: 'Current Value',
      value: formatCurrency(totalCurrentValue),
      color: 'text.primary' as const,
    },
    {
      label: 'Unrealized P&L',
      value: `${totalGainLoss >= 0 ? '+' : ''}${formatCurrency(totalGainLoss)}`,
      color: glColor,
      bg: glBg,
    },
    {
      label: 'Total Return',
      value: `${totalReturnPct >= 0 ? '+' : ''}${totalReturnPct.toFixed(2)}%`,
      color: glColor,
      bg: glBg,
    },
  ]

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 4 }, py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} color="text.primary">
          Investments
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Track portfolio gains &amp; losses. Set a "Cost Basis" on any Asset
          account to include it here.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {investmentAccounts.length === 0 ? (
        <Box sx={{ ...cardSx, textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No investment accounts yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Go to <strong>Accounts</strong>, create or edit an Asset account,
            and set an <strong>Invested Amount / Cost Basis</strong> to start
            tracking gains &amp; losses here.
          </Typography>
        </Box>
      ) : (
        <>
          {/* Summary cards */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
              gap: 2,
              mb: 3,
            }}
          >
            {summaryCards.map((card) => (
              <Box
                key={card.label}
                sx={{
                  ...cardSx,
                  backgroundColor: card.bg ?? 'background.paper',
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontSize: '0.72rem',
                  }}
                >
                  {card.label}
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  color={card.color}
                  sx={{ mt: 0.5 }}
                >
                  {card.value}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Holdings list */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              mb: 1.5,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Holdings ({investmentAccounts.length})
          </Typography>

          <Box
            sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}
          >
            {investmentAccounts
              .slice()
              .sort((a, b) => b.balance - a.balance)
              .map((account) => {
                const gl = account.balance - (account.costBasis ?? 0)
                const pct =
                  (account.costBasis ?? 0) !== 0
                    ? (gl / (account.costBasis ?? 1)) * 100
                    : 0
                const holdingGlColor = gl >= 0 ? 'success.main' : 'error.main'
                const weight =
                  totalCurrentValue > 0
                    ? (account.balance / totalCurrentValue) * 100
                    : 0

                return (
                  <Box
                    key={account.id}
                    sx={{
                      ...cardSx,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    {/* Left: name + meta */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 0.25,
                        }}
                      >
                        <Typography
                          fontWeight={600}
                          color="text.primary"
                          noWrap
                        >
                          {account.name}
                        </Typography>
                        <Chip
                          label={`${weight.toFixed(1)}% of portfolio`}
                          size="small"
                          sx={{
                            fontSize: '0.68rem',
                            height: 18,
                            backgroundColor: 'action.selected',
                            color: 'text.secondary',
                          }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Invested {formatCurrency(account.costBasis ?? 0)}{' '}
                        &nbsp;·&nbsp; Current {formatCurrency(account.balance)}
                      </Typography>
                    </Box>

                    {/* Right: P&L + edit */}
                    <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                      <Typography
                        fontWeight={700}
                        color={holdingGlColor}
                        fontSize="1.05rem"
                      >
                        {gl >= 0 ? '+' : ''}
                        {formatCurrency(gl)}
                      </Typography>
                      <Typography
                        variant="caption"
                        color={holdingGlColor}
                        fontWeight={600}
                      >
                        {pct >= 0 ? '+' : ''}
                        {pct.toFixed(2)}%
                      </Typography>
                    </Box>

                    <Tooltip title="Edit account">
                      <IconButton
                        size="small"
                        onClick={() => handleEditAccount(account as Account)}
                        sx={{ flexShrink: 0 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )
              })}
          </Box>

          {/* Period activity */}
          <Box sx={cardSx}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1,
                mb: 2,
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                Activity
              </Typography>
              <Tabs
                value={range}
                onChange={(_, v: RangeKey) => setRange(v)}
                sx={{
                  minHeight: 32,
                  '& .MuiTab-root': {
                    minHeight: 32,
                    py: 0.5,
                    fontSize: '0.8rem',
                    textTransform: 'none',
                  },
                }}
              >
                {RANGES.map((r) => (
                  <Tab key={r.key} value={r.key} label={r.label} />
                ))}
              </Tabs>
            </Box>

            {/* Period summary row */}
            <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Deployed
                </Typography>
                <Typography fontWeight={600} color="success.main">
                  +{formatCurrency(periodDeployed)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Withdrawn
                </Typography>
                <Typography fontWeight={600} color="error.main">
                  -{formatCurrency(periodWithdrawn)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Net Added
                </Typography>
                <Typography
                  fontWeight={600}
                  color={netAdded >= 0 ? 'success.main' : 'error.main'}
                >
                  {netAdded >= 0 ? '+' : ''}
                  {formatCurrency(netAdded)}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Transaction rows */}
            {periodTransactions.length === 0 ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ py: 3, textAlign: 'center' }}
              >
                No investment activity in this period.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {periodTransactions.map((txn) => {
                  const isDeposit = investmentAccountIds.has(txn.toAccountId)
                  const investAccId = isDeposit
                    ? txn.toAccountId
                    : txn.fromAccountId
                  const counterAccId = isDeposit
                    ? txn.fromAccountId
                    : txn.toAccountId
                  const investAcc = accountMap.get(investAccId)
                  const counterAcc = accountMap.get(counterAccId)

                  return (
                    <Box
                      key={txn.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        py: 1.25,
                        borderBottom: '1px solid',
                        borderBottomColor: 'divider',
                        '&:last-child': { borderBottom: 'none' },
                      }}
                    >
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color="text.primary"
                        >
                          {txn.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(txn.date).toLocaleDateString(undefined, {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}{' '}
                          &nbsp;·&nbsp; {investAcc?.name ?? 'Unknown'}{' '}
                          {isDeposit ? '←' : '→'}{' '}
                          {counterAcc?.name ?? 'Unknown'}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color={isDeposit ? 'success.main' : 'error.main'}
                        sx={{ whiteSpace: 'nowrap', ml: 2 }}
                      >
                        {isDeposit ? '+' : '-'}
                        {formatCurrency(txn.amount)}
                      </Typography>
                    </Box>
                  )
                })}
              </Box>
            )}
          </Box>
        </>
      )}

      {/* AccountForm for editing investment cost basis / balance */}
      <AccountForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleCreateAccount}
        accounts={accounts}
        account={editingAccount ?? undefined}
        title="Edit Investment Account"
      />
    </Box>
  )
}

export default Investments
