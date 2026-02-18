import React from 'react'
import { Card } from '@/components/common'
import { formatCurrency } from '@/utils/currencyUtils'
import { formatDate } from '@/utils/dateUtils'
import type { RecurringTransactionWithAccounts } from '@/types/recurring'
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

  return (
    <Card className="recurring-card">
      <div className="recurring-card__main">
        <div className="recurring-card__left">
          <div className="recurring-card__flow">
            <span className="recurring-card__account from">
              {recurring.fromAccountName}
            </span>
            <span className="recurring-card__arrow">→</span>
            <span className="recurring-card__account to">
              {recurring.toAccountName}
            </span>
          </div>
          <div className="recurring-card__description">
            {recurring.description}
          </div>
          <div className="recurring-card__meta">
            <span className="recurring-card__frequency">{frequencyLabel}</span>
            {recurring.lastProcessedDate && (
              <span className="recurring-card__last-processed">
                Last: {formatDate(new Date(recurring.lastProcessedDate))}
              </span>
            )}
          </div>
        </div>

        <div className="recurring-card__right">
          <div className="recurring-card__amount">
            {formatCurrency(recurring.amount)}
          </div>
          <span
            className={`recurring-card__status recurring-card__status--${recurring.status}`}
          >
            {recurring.status}
          </span>
        </div>
      </div>

      <div className="recurring-card__actions">
        {onProcess && recurring.status === 'active' && (
          <button
            type="button"
            className="recurring-card__button recurring-card__button--process"
            onClick={() => onProcess(recurring.id)}
          >
            Process Now
          </button>
        )}
        {onPause && recurring.status === 'active' && (
          <button
            type="button"
            className="recurring-card__button recurring-card__button--pause"
            onClick={() => onPause(recurring.id)}
          >
            Pause
          </button>
        )}
        {onResume && recurring.status === 'paused' && (
          <button
            type="button"
            className="recurring-card__button recurring-card__button--resume"
            onClick={() => onResume(recurring.id)}
          >
            Resume
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            className="recurring-card__button recurring-card__button--delete"
            onClick={() => onDelete(recurring.id)}
          >
            Delete
          </button>
        )}
      </div>
    </Card>
  )
}

export default RecurringCard
