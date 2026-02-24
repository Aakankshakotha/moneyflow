import React from 'react'
import { Card, Button } from '@/components/common'
import { formatCurrency } from '@/utils/currencyUtils'
import { formatDate } from '@/utils/dateUtils'
import type { RecurringTransactionWithAccounts } from '@/types/recurring'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import './RecurringCard.css'

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
  const statusColor = statusColors[recurring.status] ?? { bg: 'rgba(107,114,128,0.1)', color: '#6b7280' }

  return (
    <Card className="recurring-card">
      <Box className="recurring-card__main">
        <Box className="recurring-card__left">
          <Box className="recurring-card__flow">
            <Typography component="span" className="recurring-card__account from">
              {recurring.fromAccountName}
            </Typography>
            <Typography component="span" className="recurring-card__arrow">→</Typography>
            <Typography component="span" className="recurring-card__account to">
              {recurring.toAccountName}
            </Typography>
          </Box>
          <Typography className="recurring-card__description">
            {recurring.description}
          </Typography>
          <Box className="recurring-card__meta">
            <Typography component="span" className="recurring-card__frequency">
              {frequencyLabel}
            </Typography>
            {recurring.lastProcessedDate && (
              <Typography component="span" className="recurring-card__last-processed">
                Last: {formatDate(new Date(recurring.lastProcessedDate))}
              </Typography>
            )}
          </Box>
        </Box>

        <Box className="recurring-card__right">
          <Typography className="recurring-card__amount">
            {formatCurrency(recurring.amount)}
          </Typography>
          <Chip
            label={recurring.status}
            size="small"
            className={`recurring-card__status recurring-card__status--${recurring.status}`}
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

      <Box className="recurring-card__actions">
        {onProcess && recurring.status === 'active' && (
          <Button
            variant="primary"
            size="sm"
            className="recurring-card__button recurring-card__button--process"
            onClick={() => onProcess(recurring.id)}
          >
            Process Now
          </Button>
        )}
        {onPause && recurring.status === 'active' && (
          <Button
            variant="secondary"
            size="sm"
            className="recurring-card__button recurring-card__button--pause"
            onClick={() => onPause(recurring.id)}
          >
            Pause
          </Button>
        )}
        {onResume && recurring.status === 'paused' && (
          <Button
            variant="secondary"
            size="sm"
            className="recurring-card__button recurring-card__button--resume"
            onClick={() => onResume(recurring.id)}
          >
            Resume
          </Button>
        )}
        {onDelete && (
          <Button
            variant="danger"
            size="sm"
            className="recurring-card__button recurring-card__button--delete"
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
