import React from 'react'
import type { TransactionWithAccounts } from '@/types/transaction'
import { TransactionTableRow } from './TransactionTableRow'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'

interface TransactionTableProps {
  transactions: TransactionWithAccounts[]
  onDelete?: (transaction: TransactionWithAccounts) => void
}

/**
 * TransactionTable - displays transactions in a table format
 */
const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onDelete,
}) => {
  if (transactions.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: '4rem',
          px: '2rem',
          color: 'text.secondary',
        }}
      >
        <Typography>No transactions found</Typography>
        <Typography
          sx={{ fontSize: '0.875rem', color: 'text.secondary' }}
        >
          Try adjusting your filters or record a new transaction
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        border: '1px solid', borderColor: 'divider',
        borderRadius: '0.5rem',
        overflow: 'hidden',
      }}
    >
      <Table>
        <TableHead sx={{ backgroundColor: 'action.selected' }}>
          <TableRow>
            <TableCell
              sx={{
                width: '25%',
                fontWeight: 600,
                fontSize: '0.75rem',
                letterSpacing: '0.05em',
                color: 'text.secondary',
                textTransform: 'uppercase',
              }}
            >
              DATE &amp; DESCRIPTION
            </TableCell>
            <TableCell
              sx={{
                width: '12%',
                fontWeight: 600,
                fontSize: '0.75rem',
                letterSpacing: '0.05em',
                color: 'text.secondary',
                textTransform: 'uppercase',
              }}
            >
              CATEGORY
            </TableCell>
            <TableCell
              sx={{
                width: '16%',
                fontWeight: 600,
                fontSize: '0.75rem',
                letterSpacing: '0.05em',
                color: 'text.secondary',
                textTransform: 'uppercase',
              }}
            >
              SOURCE (DEBIT)
            </TableCell>
            <TableCell
              sx={{
                width: '16%',
                fontWeight: 600,
                fontSize: '0.75rem',
                letterSpacing: '0.05em',
                color: 'text.secondary',
                textTransform: 'uppercase',
              }}
            >
              DEST (DEBIT)
            </TableCell>
            <TableCell
              sx={{
                width: '10%',
                fontWeight: 600,
                fontSize: '0.75rem',
                letterSpacing: '0.05em',
                color: 'text.secondary',
                textTransform: 'uppercase',
              }}
            >
              TYPE
            </TableCell>
            <TableCell
              sx={{
                width: '12%',
                fontWeight: 600,
                fontSize: '0.75rem',
                letterSpacing: '0.05em',
                color: 'text.secondary',
                textTransform: 'uppercase',
              }}
            >
              AMOUNT
            </TableCell>
            <TableCell
              sx={{
                width: '9%',
                fontWeight: 600,
                fontSize: '0.75rem',
                letterSpacing: '0.05em',
                color: 'text.secondary',
                textTransform: 'uppercase',
              }}
            >
              ACTIONS
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((txn) => (
            <TransactionTableRow key={txn.id} txn={txn} onDelete={onDelete} />
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}

export default TransactionTable
