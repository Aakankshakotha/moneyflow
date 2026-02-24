import React from 'react'
import { Card, Button } from '@/components/common'
import { formatCurrency } from '@/utils/currencyUtils'
import { formatDate } from '@/utils/dateUtils'
import type { RecurringTransactionWithAccounts } from '@/types/recurring'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'

interface RecurringCardProps {
  recurring: RecurringTransactionWithAccounts
  onProcess?: (id: string) => void
  onPause?: (id: string) => void
  onResume?: (id: string) => void
  onDelete?: (id: string) => void
}

const FREQUENCY_LABELS: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
}

/**
 * RecurringCard - displays a single recurring transaction
 */
const RecurringCard: React.FC<RecurringCardProps> = ({
  recurring,
  onProcess,
  onPause,
  onResume,
  onDelete,
}) => {
  const frequencyLabel =
    FREQUENCY_LABELS[recurring.frequency] || recurring.frequency

  const statusColors: Record<string, { bg: string; color: string }> = {
    active: { bg: 'rgba(34,197,94,0.1)', color: '#22c55e' },
    paused: { bg: 'rgba(251,146,60,0.1)', color: '#fb923c' },
  }
  const statusColor = statusColors[recurring.status] ?? {
    bg: 'rgba(107,114,128,0.1)',
    color: '#6b7280',
  }

  return (
    <Card
      noPadding
      sx={{
        p: '1.25rem',
        transition: 'background-color 0.15s',
        '&:hover': { backgroundColor: 'var(--hover-background)' },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '1rem',
          mb: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            flex: 1,
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap',
            }}
          >
            <Typography
              component="span"
              sx={{
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              {recurring.fromAccountName}
            </Typography>
            <Typography
              component="span"
              sx={{ fontSize: '1rem', color: 'var(--text-secondary)' }}
            >
              →
            </Typography>
            <Typography
              component="span"
              sx={{
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              {recurring.toAccountName}
            </Typography>
          </Box>
          <Typography
            sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}
          >
            {recurring.description}
          </Typography>
          <Box sx={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
            <Typography
              component="span"
              sx={{
                fontWeight: 600,
                textTransform: 'uppercase',
                px: '0.375rem',
                py: '0.125rem',
                backgroundColor: '#e0e7ff',
                color: '#4338ca',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
              }}
            >
              {frequencyLabel}
            </Typography>
            {recurring.lastProcessedDate && (
              <Typography
                component="span"
                sx={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}
              >
                Last: {formatDate(new Date(recurring.lastProcessedDate))}
              </Typography>
            )}
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '0.5rem',
          }}
        >
          <Typography
            sx={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          >
            {formatCurrency(recurring.amount)}
          </Typography>
          <Chip
            label={recurring.status}
            size="small"
            sx={{
              backgroundColor: statusColor.bg,
              color: statusColor.color,
              fontWeight: 500,
              fontSize: '0.75rem',
              textTransform: 'capitalize',
            }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: '0.5rem',
          pt: '0.75rem',
          borderTop: '1px solid var(--border-color)',
        }}
      >
        {onProcess && recurring.status === 'active' && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onProcess(recurring.id)}
          >
            Process Now
          </Button>
        )}
        {onPause && recurring.status === 'active' && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPause(recurring.id)}
          >
            Pause
          </Button>
        )}
        {onResume && recurring.status === 'paused' && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onResume(recurring.id)}
          >
            Resume
          </Button>
        )}
        {onDelete && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(recurring.id)}
          >
            Delete
          </Button>
        )}
      </Box>
    </Card>
  )
}

export default RecurringCard
