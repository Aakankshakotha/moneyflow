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
  const rootStyles = getComputedStyle(document.documentElement)
  const getThemeVar = (name: string, fallback: string): string =>
    rootStyles.getPropertyValue(name).trim() || fallback

  const chartAxis = getThemeVar('--chart-axis', '#94a3b8')
  const chartGrid = getThemeVar('--chart-grid', '#e6edf7')
  const tooltipBg = getThemeVar('--chart-tooltip-bg', '#ffffff')
  const tooltipBorder = getThemeVar('--chart-tooltip-border', '#dbe4f0')
  const tooltipText = getThemeVar('--chart-tooltip-text', '#1f2937')
  const seriesNetWorth = getThemeVar('--chart-series-income', '#3dbb91')
  const seriesAssets = getThemeVar('--chart-series-1', '#5b7cfa')
  const seriesLiabilities = getThemeVar('--chart-series-liability', '#f2b36f')

  if (loading) {
    return (
      <Card sx={{ p: '2rem' }}>
        <Box sx={{ textAlign: 'center', py: '4rem', px: '2rem', color: 'var(--text-secondary)' }}>Loading chart...</Box>
      </Card>
    )
  }

  if (snapshots.length === 0) {
    return (
      <Card sx={{ p: '2rem' }}>
        <Typography variant="h5" component="h2" sx={{ fontSize: '1.25rem', fontWeight: 600, m: 0, mb: '1.5rem', color: 'var(--text-primary)' }}>Net Worth Trend</Typography>
        <Box sx={{ textAlign: 'center', py: '4rem', px: '2rem', color: 'var(--text-secondary)' }}>
          <Typography sx={{ m: '0.5rem 0' }}>No snapshot history available</Typography>
          <Typography sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)', m: '0.5rem 0' }}>
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
      <Typography variant="h5" component="h2" sx={{ fontSize: '1.25rem', fontWeight: 600, m: 0, mb: '1.5rem', color: 'var(--text-primary)' }}>Net Worth Trend</Typography>
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
