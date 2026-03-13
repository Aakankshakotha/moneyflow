import React from 'react'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import MuiSelect from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'
import type { DateFilter } from '@/hooks/useTransactionFilters'

interface TransactionFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  dateFilter: DateFilter
  onDateFilterChange: (value: DateFilter) => void
  customStartDate: string
  onCustomStartChange: (value: string) => void
  customEndDate: string
  onCustomEndChange: (value: string) => void
  accountFilter: string
  onAccountFilterChange: (value: string) => void
  typeFilter: string
  onTypeFilterChange: (value: string) => void
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  searchTerm,
  onSearchChange,
  dateFilter,
  onDateFilterChange,
  customStartDate,
  onCustomStartChange,
  customEndDate,
  onCustomEndChange,
  accountFilter,
  onAccountFilterChange,
  typeFilter,
  onTypeFilterChange,
}) => {
  return (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        border: '1px solid', borderColor: 'divider',
        borderRadius: '8px',
        p: '1rem 1.25rem',
        mb: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        flexWrap: 'wrap',
      }}
    >
      <TextField
        size="small"
        placeholder="Search by description, amount, or tag..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ flex: 1.5, minWidth: '200px' }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />
      <FormControl size="small" sx={{ minWidth: '130px' }}>
        <MuiSelect
          value={dateFilter}
          onChange={(e) => onDateFilterChange(e.target.value as DateFilter)}
        >
          <MenuItem value="this-month">This Month</MenuItem>
          <MenuItem value="this-week">This Week</MenuItem>
          <MenuItem value="custom">Custom Range</MenuItem>
          <MenuItem value="all">All Time</MenuItem>
        </MuiSelect>
      </FormControl>
      {dateFilter === 'custom' && (
        <>
          <TextField
            size="small"
            type="date"
            label="From"
            value={customStartDate}
            onChange={(e) => onCustomStartChange(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            size="small"
            type="date"
            label="To"
            value={customEndDate}
            onChange={(e) => onCustomEndChange(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </>
      )}
      <FormControl size="small" sx={{ minWidth: '130px' }}>
        <MuiSelect
          value={accountFilter}
          onChange={(e) => onAccountFilterChange(e.target.value)}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="asset">Asset</MenuItem>
          <MenuItem value="income">Income</MenuItem>
          <MenuItem value="expense">Expense</MenuItem>
          <MenuItem value="liability">Liability</MenuItem>
        </MuiSelect>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: '130px' }}>
        <MuiSelect
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value)}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="income">Income</MenuItem>
          <MenuItem value="expense">Expense</MenuItem>
          <MenuItem value="transfer">Transfer</MenuItem>
        </MuiSelect>
      </FormControl>
    </Box>
  )
}
