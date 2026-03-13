import React from 'react'
import { Modal, Button, Input } from '@/components/common'
import { useTransactionForm } from '@/hooks/useTransactionForm'
import { TransactionModeTabs } from './TransactionModeTabs'
import { TransactionFlowPreview } from './TransactionFlowPreview'
import { TransactionAccountFields } from './TransactionAccountFields'
import { CategorySuggestions } from './CategorySuggestions'
import type { CreateTransactionDto } from '@/types/transaction'
import type { Account } from '@/types/account'
import Box from '@mui/material/Box'
import { alpha } from '@mui/material/styles'

interface TransactionFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateTransactionDto) => Promise<void>
  accounts: Account[]
  defaultFromAccountId?: string
  defaultToAccountId?: string
}

/**
 * TransactionForm - form for recording transactions between accounts
 */
const TransactionForm: React.FC<TransactionFormProps> = (props) => {
  const {
    entryMode,
    setEntryMode,
    primaryAccountId,
    setPrimaryAccountId,
    secondaryAccountId,
    setSecondaryAccountId,
    amount,
    description,
    setDescription,
    date,
    setDate,
    category,
    setCategory,
    submitting,
    error,
    suggestedCategories,
    config,
    displayAccount,
    flowFromAccount,
    flowToAccount,
    handleSubmit,
    handleClose,
    handleAmountChange,
  } = useTransactionForm(props)

  const showFlowPreview =
    !!primaryAccountId &&
    !!secondaryAccountId &&
    !!amount &&
    parseFloat(amount) > 0

  return (
    <Modal
      isOpen={props.isOpen}
      onClose={handleClose}
      title="Add Transaction"
      contentSx={{ p: 0 }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}
      >
        <TransactionModeTabs entryMode={entryMode} onChange={setEntryMode} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            px: '1.5rem',
            py: '1.5rem',
          }}
        >
          {showFlowPreview && (
            <TransactionFlowPreview
              fromAccount={flowFromAccount}
              toAccount={flowToAccount}
              amount={amount}
              arrowColor={config.arrowColor}
              fromLabel={config.flowFromLabel}
              toLabel={config.flowToLabel}
            />
          )}

          <TransactionAccountFields
            primaryLabel={config.primaryLabel}
            primaryAccounts={config.primaryAccounts}
            primaryAccountId={primaryAccountId}
            onPrimaryChange={(id) => {
              setPrimaryAccountId(id)
              setSecondaryAccountId('')
            }}
            displayAccount={displayAccount}
            secondaryLabel={config.secondaryLabel}
            secondaryAccounts={config.secondaryAccounts}
            secondaryAccountId={secondaryAccountId}
            secondaryPlaceholder={config.secondaryPlaceholder}
            onSecondaryChange={setSecondaryAccountId}
          />

          <Input
            label="Amount"
            type="text"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0.00"
            required
            helperText="Enter amount in dollars (e.g., 25.50)"
          />

          <Input
            label="Description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this transaction for?"
            required
          />

          <CategorySuggestions
            suggestions={suggestedCategories}
            selectedCategory={category}
            onSelect={setCategory}
          />

          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          {error && (
            <Box
              sx={{
                p: '0.75rem',
                backgroundColor: (theme) =>
                  alpha(theme.palette.error.main, 0.1),
                color: 'error.main',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
              }}
            >
              {error}
            </Box>
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem',
            mt: '0.5rem',
            px: '1.5rem',
            pb: '1.5rem',
          }}
        >
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Recording...' : 'Record Transaction'}
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}

export default TransactionForm
