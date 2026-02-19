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
import { Card } from '@/components/common'
import { formatCurrency } from '@/utils/currencyUtils'
import type { NetWorthSnapshot } from '@/types/netWorth'
import './NetWorthChart.css'

interface NetWorthChartProps {
  snapshots: NetWorthSnapshot[]
  loading?: boolean
}

/**
 * NetWorthChart - displays net worth trend over time
 */
const NetWorthChart: React.FC<NetWorthChartProps> = ({
  snapshots,
  loading = false,
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
      <Card className="net-worth-chart">
        <div className="net-worth-chart__loading">Loading chart...</div>
      </Card>
    )
  }

  if (snapshots.length === 0) {
    return (
      <Card className="net-worth-chart">
        <h2 className="net-worth-chart__title">Net Worth Trend</h2>
        <div className="net-worth-chart__empty">
          <p>No snapshot history available</p>
          <p className="net-worth-chart__empty-hint">
            Create snapshots to track your net worth over time
          </p>
        </div>
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
    <Card className="net-worth-chart">
      <h2 className="net-worth-chart__title">Net Worth Trend</h2>
      <div className="net-worth-chart__container">
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
      </div>
    </Card>
  )
}

export default NetWorthChart
