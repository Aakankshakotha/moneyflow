import React from 'react'
import Box from '@mui/material/Box'
import type { EntryMode } from '@/hooks/useTransactionForm'

interface TransactionModeTabsProps {
  entryMode: EntryMode
  onChange: (mode: EntryMode) => void
}

export const TransactionModeTabs: React.FC<TransactionModeTabsProps> = ({
  entryMode,
  onChange,
}) => (
  <Box
    sx={{
      display: 'flex',
      borderBottom: '2px solid',
      borderBottomColor: 'divider',
    }}
  >
    {(['expense', 'income', 'transfer'] as const).map((mode) => (
      <Box
        key={mode}
        component="button"
        type="button"
        onClick={() => onChange(mode)}
        sx={{
          flex: 1,
          p: '1rem',
          background: 'transparent',
          border: 'none',
          borderBottom: '3px solid',
          borderBottomColor:
            entryMode === mode ? 'primary.main' : 'transparent',
          fontSize: '0.9375rem',
          fontWeight: 600,
          color: entryMode === mode ? 'primary.main' : 'text.secondary',
          cursor: 'pointer',
          transition: 'all 0.2s',
          textTransform: 'capitalize',
          '&:hover': {
            backgroundColor: 'action.hover',
            color: 'text.primary',
          },
        }}
      >
        {mode.charAt(0).toUpperCase() + mode.slice(1)}
      </Box>
    ))}
  </Box>
)
