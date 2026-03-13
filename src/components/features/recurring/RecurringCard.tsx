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
    active: { bg: 'success.light', color: 'success.main' },
    paused: { bg: 'warning.light', color: 'warning.main' },
  }
  const statusColor = statusColors[recurring.status] ?? {
    bg: 'action.selected',
    color: 'text.secondary',
  }

  return (
    <Card
      noPadding
      sx={{
        p: '1.25rem',
        transition: 'background-color 0.15s',
        '&:hover': { backgroundColor: 'action.hover' },
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
                color: 'text.primary',
              }}
            >
              {recurring.fromAccountName}
            </Typography>
            <Typography
              component="span"
              sx={{ fontSize: '1rem', color: 'text.secondary' }}
            >
              →
            </Typography>
            <Typography
              component="span"
              sx={{
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: 'text.primary',
              }}
            >
              {recurring.toAccountName}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
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
                backgroundColor: 'primary.light',
                color: 'primary.contrastText',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
              }}
            >
              {frequencyLabel}
            </Typography>
            {recurring.lastProcessedDate && (
              <Typography
                component="span"
                sx={{ fontSize: '0.75rem', color: 'text.secondary' }}
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
              color: 'text.primary',
            }}
          >
            {formatCurrency(recurring.amount)}
          </Typography>
          <Chip
            label={recurring.status}
            size="small"
            color={
              recurring.status === 'active'
                ? 'success'
                : recurring.status === 'paused'
                  ? 'warning'
                  : 'default'
            }
            variant="outlined"
            sx={{
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
          borderTop: '1px solid',
          borderTopColor: 'divider',
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
