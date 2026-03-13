import React, { useMemo } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import EditIcon from '@mui/icons-material/Edit'
import ArchiveIcon from '@mui/icons-material/Archive'
import UnarchiveIcon from '@mui/icons-material/Unarchive'
import DeleteIcon from '@mui/icons-material/Delete'
import type { Account } from '@/types/account'
import type { Transaction } from '@/types/transaction'
import { formatCurrency } from '@/utils/currencyUtils'

interface AccountDetailPanelProps {
  selectedAccount: Account | null
  showArchived: boolean
  rangeLabel: string
  rangeSince: Date
  transactions: Transaction[]
  accountMap: Map<string, Account>
  onEdit: (account: Account) => void
  onToggleStatus: (account: Account) => void
  onDelete: (account: Account) => void
}

const detailCardSx = {
  backgroundColor: 'background.paper',
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: '12px',
  p: '1rem',
  minWidth: 0,
}

export const AccountDetailPanel: React.FC<AccountDetailPanelProps> = ({
  selectedAccount,
  showArchived,
  rangeLabel,
  rangeSince,
  transactions,
  accountMap,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
  const { monthlyInflow, monthlyOutflow, recentTransactions } = useMemo(() => {
    if (!selectedAccount) {
      return { monthlyInflow: 0, monthlyOutflow: 0, recentTransactions: [] }
    }

    const relevant = transactions.filter(
      (t) =>
        (t.fromAccountId === selectedAccount.id ||
          t.toAccountId === selectedAccount.id) &&
        new Date(t.date) >= rangeSince
    )
    const inflow = relevant
      .filter((t) => t.toAccountId === selectedAccount.id)
      .reduce((sum, t) => sum + t.amount, 0)
    const outflow = relevant
      .filter((t) => t.fromAccountId === selectedAccount.id)
      .reduce((sum, t) => sum + t.amount, 0)

    const recent = transactions
      .filter(
        (t) =>
          t.fromAccountId === selectedAccount.id ||
          t.toAccountId === selectedAccount.id
      )
      .slice(0, 5)

    return {
      monthlyInflow: inflow,
      monthlyOutflow: outflow,
      recentTransactions: recent,
    }
  }, [selectedAccount, transactions, rangeSince])

  if (!selectedAccount) {
    return (
      <Box sx={detailCardSx}>
        <Typography>
          {showArchived
            ? 'Select an archived account to unarchive or delete it.'
            : 'No accounts available yet. Add your first account to get started.'}
        </Typography>
      </Box>
    )
  }

  return (
    <>
      {/* Account header */}
      <Box sx={{ ...detailCardSx, wordBreak: 'break-word' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '0.65rem',
          }}
        >
          <Typography
            sx={{
              m: 0,
              color: 'text.secondary',
              fontSize: '0.75rem',
              letterSpacing: '0.04em',
            }}
          >
            {selectedAccount.type.toUpperCase()}
          </Typography>
          <Box sx={{ display: 'flex', gap: '0.1rem' }}>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => onEdit(selectedAccount)}
                sx={{
                  color: 'text.secondary',
                  '&:hover': { color: 'primary.main' },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip
              title={
                selectedAccount.status === 'active' ? 'Archive' : 'Unarchive'
              }
            >
              <IconButton
                size="small"
                onClick={() => onToggleStatus(selectedAccount)}
                sx={{
                  color: 'text.secondary',
                  '&:hover': { color: 'warning.main' },
                }}
              >
                {selectedAccount.status === 'active' ? (
                  <ArchiveIcon fontSize="small" />
                ) : (
                  <UnarchiveIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={() => onDelete(selectedAccount)}
                sx={{
                  color: 'text.secondary',
                  '&:hover': { color: 'error.main' },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Typography
          variant="h6"
          component="h3"
          sx={{
            m: '0.7rem 0 0',
            fontSize: '1.4rem',
            color: 'text.primary',
          }}
        >
          {selectedAccount.name}
        </Typography>
        <Typography
          sx={{
            m: '0.45rem 0 0',
            fontSize: '1.9rem',
            fontWeight: 700,
            color: 'text.primary',
          }}
        >
          {formatCurrency(Math.abs(selectedAccount.balance))}
        </Typography>

        {selectedAccount.type === 'asset' &&
          selectedAccount.costBasis !== undefined &&
          (() => {
            const gainLoss = selectedAccount.balance - selectedAccount.costBasis
            const pct =
              selectedAccount.costBasis !== 0
                ? (gainLoss / selectedAccount.costBasis) * 100
                : 0
            const color = gainLoss >= 0 ? 'success.main' : 'error.main'
            return (
              <>
                <Typography
                  sx={{
                    m: '0.2rem 0 0',
                    fontSize: '0.82rem',
                    color: 'text.secondary',
                  }}
                >
                  Invested: {formatCurrency(selectedAccount.costBasis)}
                </Typography>
                <Typography
                  sx={{
                    m: '0.15rem 0 0',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color,
                  }}
                >
                  {gainLoss >= 0 ? '+' : ''}
                  {formatCurrency(gainLoss)} ({gainLoss >= 0 ? '+' : ''}
                  {pct.toFixed(2)}%)
                </Typography>
              </>
            )
          })()}

        <Typography
          sx={{
            m: '0.45rem 0 0',
            color: 'success.main',
            fontSize: '0.82rem',
            fontWeight: 600,
          }}
        >
          {selectedAccount.status === 'active' ? 'Connected' : 'Archived'}
        </Typography>
      </Box>

      {/* Flow card */}
      <Box sx={detailCardSx}>
        <Typography
          sx={{
            m: '0 0 0.75rem',
            color: 'text.secondary',
            fontSize: '0.78rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {rangeLabel} Flow
        </Typography>
        {selectedAccount.type === 'income' ? (
          <Box>
            <Typography
              sx={{ m: 0, color: 'text.secondary', fontSize: '0.75rem' }}
            >
              Earned
            </Typography>
            <Typography
              sx={{
                m: '0.25rem 0 0',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'success.main',
              }}
            >
              +{formatCurrency(monthlyOutflow)}
            </Typography>
          </Box>
        ) : selectedAccount.type === 'expense' ? (
          <Box>
            <Typography
              sx={{ m: 0, color: 'text.secondary', fontSize: '0.75rem' }}
            >
              Spent
            </Typography>
            <Typography
              sx={{
                m: '0.25rem 0 0',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'error.main',
              }}
            >
              -{formatCurrency(monthlyInflow)}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.8rem',
            }}
          >
            <Box>
              <Typography
                sx={{ m: 0, color: 'text.secondary', fontSize: '0.75rem' }}
              >
                In
              </Typography>
              <Typography
                sx={{
                  m: '0.25rem 0 0',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'success.main',
                }}
              >
                +{formatCurrency(monthlyInflow)}
              </Typography>
            </Box>
            <Box>
              <Typography
                sx={{ m: 0, color: 'text.secondary', fontSize: '0.75rem' }}
              >
                Out
              </Typography>
              <Typography
                sx={{
                  m: '0.25rem 0 0',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'error.main',
                }}
              >
                -{formatCurrency(monthlyOutflow)}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* History card */}
      <Box sx={detailCardSx}>
        <Typography
          sx={{
            m: '0 0 0.75rem',
            color: 'text.secondary',
            fontSize: '0.78rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          History
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => {
              const isInflow = transaction.toAccountId === selectedAccount.id
              const oppositeAccountId = isInflow
                ? transaction.fromAccountId
                : transaction.toAccountId
              return (
                <Box
                  key={transaction.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '0.8rem',
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        m: 0,
                        color: 'text.primary',
                        fontSize: '0.87rem',
                        fontWeight: 600,
                      }}
                    >
                      {transaction.description}
                    </Typography>
                    <Typography
                      sx={{
                        m: '0.2rem 0 0',
                        color: 'text.secondary',
                        fontSize: '0.74rem',
                      }}
                    >
                      {new Date(transaction.date).toLocaleDateString()} •{' '}
                      {accountMap.get(oppositeAccountId)?.name ?? 'Unknown'}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      m: 0,
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color:
                        selectedAccount.type === 'income'
                          ? 'success.main'
                          : selectedAccount.type === 'expense'
                            ? 'error.main'
                            : isInflow
                              ? 'success.main'
                              : 'error.main',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {selectedAccount.type === 'income'
                      ? '+'
                      : selectedAccount.type === 'expense'
                        ? '-'
                        : isInflow
                          ? '+'
                          : '-'}
                    {formatCurrency(transaction.amount)}
                  </Typography>
                </Box>
              )
            })
          ) : (
            <Typography
              sx={{ m: 0, color: 'text.secondary', fontSize: '0.85rem' }}
            >
              No recent activity for this account.
            </Typography>
          )}
        </Box>
      </Box>
    </>
  )
}
