import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import { useTheme, alpha } from '@mui/material/styles'
import type { SvgIconComponent } from '@mui/icons-material'
import type { Account } from '@/types/account'
import { formatCurrency } from '@/utils/currencyUtils'

interface AccountRowProps {
  account: Account
  isSelected: boolean
  onClick: () => void
  trendValues: number[]
  showArchived: boolean
  parentName?: string
  sectionLabel: string
  SectionIcon: SvgIconComponent
  buildSparklinePoints: (values: number[]) => string
  childCount?: number
}

export const AccountRow: React.FC<AccountRowProps> = ({
  account,
  isSelected,
  onClick,
  trendValues,
  showArchived,
  parentName,
  sectionLabel,
  SectionIcon,
  buildSparklinePoints,
  childCount,
}) => {
  const sparklinePoints = buildSparklinePoints(trendValues)
  const trendStart = trendValues[0] ?? 0
  const trendEnd = trendValues[trendValues.length - 1] ?? trendStart
  const isUpward = trendEnd >= trendStart
  const theme = useTheme()

  return (
    <Box
      component="button"
      type="button"
      sx={{
        border: 'none',
        borderBottom: '1px solid',
        borderBottomColor: 'divider',
        backgroundColor: isSelected
          ? alpha(theme.palette.primary.main, 0.15)
          : 'transparent',
        boxShadow: isSelected
          ? `inset 4px 0 0 ${theme.palette.primary.main}`
          : 'none',
        color: 'inherit',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        p: parentName ? '0.85rem 1.25rem 0.85rem 2.75rem' : '1rem 1.25rem',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'background 0.15s ease',
        '&:last-child': { borderBottom: 'none' },
        '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.1) },
      }}
      onClick={onClick}
    >
      {/* Indent connector for sub-accounts */}
      {parentName && (
        <Box
          sx={{
            width: 14,
            height: 2,
            backgroundColor: 'divider',
            flexShrink: 0,
            mr: -0.5,
          }}
        />
      )}
      <Box
        sx={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          backgroundColor: 'action.selected',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: 'text.secondary',
        }}
      >
        <SectionIcon fontSize="small" />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            m: 0,
            color: 'text.primary',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {account.name}
        </Typography>
        <Typography
          sx={{
            m: '0.2rem 0 0',
            color: 'text.secondary',
            fontSize: '0.78rem',
          }}
        >
          {parentName ? `Sub-account of ${parentName}` : sectionLabel}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Typography sx={{ m: 0, color: 'text.primary', fontWeight: 700 }}>
          {formatCurrency(Math.abs(account.balance))}
        </Typography>
        {(childCount ?? 0) > 0 && (
          <Chip
            label={`${childCount} sub`}
            size="small"
            sx={{
              height: 18,
              fontSize: '0.65rem',
              backgroundColor: 'action.selected',
              color: 'text.secondary',
            }}
          />
        )}
        {showArchived && (
          <Chip
            label="Archived"
            size="small"
            sx={{
              height: '20px',
              fontSize: '0.68rem',
              backgroundColor: alpha(theme.palette.secondary.main, 0.15),
              color: 'text.secondary',
            }}
          />
        )}
        <svg
          style={{ width: '86px', height: '24px', opacity: 0.95 }}
          viewBox="0 0 86 24"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polyline
            points={sparklinePoints}
            fill="none"
            stroke={isUpward ? 'success.main' : 'error.main'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Box>
    </Box>
  )
}
