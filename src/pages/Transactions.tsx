import React from 'react'
import { Button } from '@/components/common'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import {
  TransactionForm,
  TransactionTable,
  TransactionMetrics,
} from '@/components/features'
import { TransactionFilters } from '@/components/features'
import { useTransactions } from '@/hooks/useTransactions'
import { useTransactionFilters } from '@/hooks/useTransactionFilters'

/**
 * Transactions page - record and view transactions
 */
const Transactions: React.FC = () => {
  const {
    transactions,
    accounts,
    loading,
    error,
    isFormOpen,
    openForm,
    closeForm,
    handleCreateTransaction,
    handleDeleteTransaction,
  } = useTransactions()

  const {
    dateFilter,
    setDateFilter,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    searchTerm,
    setSearchTerm,
    accountFilter,
    setAccountFilter,
    typeFilter,
    setTypeFilter,
    filteredTransactions,
  } = useTransactionFilters(transactions)

  if (loading) {
    return (
      <Box sx={{ p: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
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
          Transactions
        </Typography>
        <Box sx={{ color: 'text.secondary', mt: '1rem' }}>
          Loading transactions...
        </Box>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
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
          Transactions
        </Typography>
        <Box sx={{ color: 'error.main', mt: '1rem' }}>{error}</Box>
      </Box>
    )
  }

  return (
    <Box sx={{ p: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: '2rem',
        }}
      >
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
          Transactions
        </Typography>
        <Box sx={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Button variant="secondary">Export CSV</Button>
          <Button onClick={openForm}>Add Transaction</Button>
        </Box>
      </Box>

      <TransactionMetrics transactions={filteredTransactions} />

      <TransactionFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        customStartDate={customStartDate}
        onCustomStartChange={setCustomStartDate}
        customEndDate={customEndDate}
        onCustomEndChange={setCustomEndDate}
        accountFilter={accountFilter}
        onAccountFilterChange={setAccountFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
      />

      <Box sx={{ mt: '1rem' }}>
        <TransactionTable
          transactions={filteredTransactions}
          onDelete={handleDeleteTransaction}
        />
      </Box>

      <TransactionForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={handleCreateTransaction}
        accounts={accounts}
      />
    </Box>
  )
}

export default Transactions
