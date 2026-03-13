import React from 'react'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MuiSelect from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import {
  AccountSummaryCards,
  AccountSection,
  AccountDetailPanel,
  AccountForm,
} from '@/components/features'
import { Button } from '@/components/common'
import { useAccounts } from '@/hooks/useAccounts'
import { useTrendData } from '@/hooks/useTrendData'
import type { AccountType } from '@/types/account'

const ACCOUNT_TYPES: AccountType[] = ['asset', 'liability', 'income', 'expense']

/**
 * Accounts page – manage financial buckets: Assets, Liabilities, Income, Expenses.
 */
const Accounts: React.FC = () => {
  const {
    accounts,
    transactions,
    selectedAccountId,
    setSelectedAccountId,
    isFormOpen,
    editingAccount,
    loading,
    error,
    showArchived,
    setShowArchived,
    activeAccounts,
    selectedAccount,
    accountMap,
    totalAssets,
    totalLiabilities,
    netWorth,
    loadAccounts,
    handleCreateAccount,
    handleEditAccount,
    handleDeleteAccount,
    handleToggleAccountStatus,
    handleCloseForm,
    openAddForm,
  } = useAccounts()

  const {
    trendRange,
    setTrendRange,
    rangeConfig,
    accountTrendMap,
    buildSparklinePoints,
  } = useTrendData(accounts, transactions)

  if (loading) {
    return (
      <Box
        sx={{
          p: '2rem',
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <CircularProgress size={20} />
        <Typography>Loading accounts...</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: '2rem', maxWidth: '1440px', margin: '0 auto' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={loadAccounts}>Retry</Button>
      </Box>
    )
  }

  return (
    <Box sx={{ p: '2rem', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Page header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          mb: '1.5rem',
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              m: 0,
              fontSize: '1.8rem',
              fontWeight: 700,
              color: 'text.primary',
            }}
          >
            Accounts
          </Typography>
          <Typography
            sx={{
              m: '0.35rem 0 0',
              color: 'text.secondary',
              fontSize: '0.92rem',
            }}
          >
            {showArchived
              ? 'Viewing archived accounts. Select one to unarchive or delete it.'
              : 'Manage your financial buckets: Assets, Liabilities, Income, and Expenses.'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="graph-range-label">Graph Range</InputLabel>
            <MuiSelect
              labelId="graph-range-label"
              label="Graph Range"
              value={trendRange}
              onChange={(e) =>
                setTrendRange(e.target.value as typeof trendRange)
              }
            >
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </MuiSelect>
          </FormControl>
          <Button
            variant={showArchived ? 'primary' : 'secondary'}
            onClick={() => {
              setShowArchived((p) => !p)
              setSelectedAccountId(null)
            }}
          >
            {showArchived ? 'Active Accounts' : 'Show Archived'}
          </Button>
          <Button onClick={openAddForm}>Add Account</Button>
        </Box>
      </Box>

      <AccountSummaryCards
        netWorth={netWorth}
        totalAssets={totalAssets}
        totalLiabilities={totalLiabilities}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.7fr) minmax(340px, 0.9fr)',
          gap: '1rem',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {showArchived && activeAccounts.length === 0 && (
            <Box
              sx={{
                backgroundColor: 'background.paper',
                border: '1px solid', borderColor: 'divider',
                borderRadius: '12px',
                p: '2rem',
                textAlign: 'center',
              }}
            >
              <Typography
                sx={{ color: 'text.secondary', fontSize: '0.92rem' }}
              >
                No archived accounts.
              </Typography>
            </Box>
          )}
          {ACCOUNT_TYPES.map((type) => {
            const sectionAccounts = activeAccounts.filter(
              (a) => a.type === type
            )
            if (sectionAccounts.length === 0) return null
            return (
              <AccountSection
                key={type}
                type={type}
                accounts={sectionAccounts}
                selectedAccountId={selectedAccountId}
                onSelectAccount={(id) =>
                  setSelectedAccountId((prev) => (prev === id ? null : id))
                }
                showArchived={showArchived}
                accountMap={accountMap}
                accountTrendMap={accountTrendMap}
                buildSparklinePoints={buildSparklinePoints}
              />
            )
          })}
        </Box>

        <Box
          component="aside"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            minWidth: 0,
          }}
        >
          <AccountDetailPanel
            selectedAccount={selectedAccount}
            showArchived={showArchived}
            rangeLabel={rangeConfig.label}
            rangeSince={rangeConfig.startDate}
            transactions={transactions}
            accountMap={accountMap}
            onEdit={handleEditAccount}
            onToggleStatus={handleToggleAccountStatus}
            onDelete={handleDeleteAccount}
          />
        </Box>
      </Box>

      <AccountForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleCreateAccount}
        accounts={accounts}
        account={editingAccount ?? undefined}
      />
    </Box>
  )
}

export default Accounts
