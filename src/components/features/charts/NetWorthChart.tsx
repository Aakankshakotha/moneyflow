import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Button, Card } from '@/components/common'
import { formatCurrency } from '@/utils/currencyUtils'
import type { NetWorthSnapshot } from '@/types/netWorth'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

interface NetWorthChartProps {
  snapshots: NetWorthSnapshot[]
  loading?: boolean
  creatingSnapshot?: boolean
  onCreateSnapshot?: () => void | Promise<void>
}

/**
 * NetWorthChart - displays net worth trend over time
 */
const NetWorthChart: React.FC<NetWorthChartProps> = ({
  snapshots,
  loading = false,
  creatingSnapshot = false,
  onCreateSnapshot,
}) => {
  const muiTheme = useTheme()

  const chartAxis = muiTheme.palette.text.secondary
  const chartGrid = muiTheme.palette.divider
  const tooltipBg = muiTheme.palette.background.paper
  const tooltipBorder = muiTheme.palette.divider
  const tooltipText = muiTheme.palette.text.primary
  const seriesNetWorth = muiTheme.palette.success.main
  const seriesAssets = muiTheme.palette.primary.main
  const seriesLiabilities = muiTheme.palette.warning.main

  if (loading) {
    return (
      <Card sx={{ p: '2rem' }}>
        <Box
          sx={{
            textAlign: 'center',
            py: '4rem',
            px: '2rem',
            color: 'text.secondary',
          }}
        >
          Loading chart...
        </Box>
      </Card>
    )
  }

  if (snapshots.length === 0) {
    return (
      <Card sx={{ p: '2rem' }}>
        <Typography
          variant="h5"
          component="h2"
          sx={{
            fontSize: '1.25rem',
            fontWeight: 600,
            m: 0,
            mb: '1.5rem',
            color: 'text.primary',
          }}
        >
          Net Worth Trend
        </Typography>
        <Box
          sx={{
            textAlign: 'center',
            py: '4rem',
            px: '2rem',
            color: 'text.secondary',
          }}
        >
          <Typography sx={{ m: '0.5rem 0' }}>
            No snapshot history available
          </Typography>
          <Typography
            sx={{
              fontSize: '0.875rem',
              color: 'text.secondary',
              m: '0.5rem 0',
            }}
          >
            Create snapshots to track your net worth over time
          </Typography>
          {onCreateSnapshot && (
            <Button
              variant="primary"
              onClick={onCreateSnapshot}
              loading={creatingSnapshot}
              style={{ marginTop: '1rem' }}
            >
              Create Snapshot
            </Button>
          )}
        </Box>
      </Card>
    )
  }

  // Transform data for recharts
  const chartData = snapshots.map((snapshot) => ({
    date: snapshot.date,
    netWorth: snapshot.netWorth / 100, // Convert cents to dollars
    assets: snapshot.totalAssets / 100,
    liabilities: snapshot.totalLiabilities / 100,
  }))

  return (
    <Card sx={{ p: '2rem' }}>
      <Typography
        variant="h5"
        component="h2"
        sx={{
          fontSize: '1.25rem',
          fontWeight: 600,
          m: 0,
          mb: '1.5rem',
          color: 'text.primary',
        }}
      >
        Net Worth Trend
      </Typography>
      <Box sx={{ mt: '1rem' }}>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: chartAxis }}
              axisLine={{ stroke: chartGrid }}
              tickLine={{ stroke: chartGrid }}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: chartAxis }}
              axisLine={{ stroke: chartGrid }}
              tickLine={{ stroke: chartGrid }}
              tickFormatter={(value) => formatCurrency(value * 100)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                border: `1px solid ${tooltipBorder}`,
                borderRadius: '10px',
              }}
              labelStyle={{ color: tooltipText, fontWeight: 600 }}
              itemStyle={{ color: tooltipText }}
              formatter={(value: number | undefined) =>
                value !== undefined ? formatCurrency(value * 100) : ''
              }
              labelFormatter={(label) => {
                const date = new Date(label)
                return date.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="netWorth"
              stroke={seriesNetWorth}
              strokeWidth={3}
              name="Net Worth"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="assets"
              stroke={seriesAssets}
              strokeWidth={2}
              name="Assets"
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="liabilities"
              stroke={seriesLiabilities}
              strokeWidth={2}
              name="Liabilities"
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Card>
  )
}

export default NetWorthChart
