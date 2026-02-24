import React, { useMemo, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import type { Transaction } from '@/types/transaction'
import type { Account } from '@/types/account'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { formatCurrency } from '@/utils/currencyUtils'
import './MoneyFlowChart.css'
import { Box, Typography } from '@mui/material'

interface MoneyFlowChartProps {
  transactions: Transaction[]
  accounts: Account[]
}

const getNodeColor = (
  accountType: Account['type'],
  paletteIndex: number,
  palette: string[],
  getThemeVar: (name: string, fallback: string) => string
): string => {
  const semanticColor =
    accountType === 'income'
      ? getThemeVar('--chart-series-income', '#4ade80')
      : accountType === 'expense'
        ? getThemeVar('--chart-series-expense', '#f87171')
        : accountType === 'liability'
          ? getThemeVar('--chart-series-liability', '#fdba74')
          : getThemeVar('--chart-series-1', '#fb923c')

  const paletteColor = palette[paletteIndex % palette.length]

  return paletteColor || semanticColor
}

/**
 * MoneyFlowChart Component
 * Displays a Sankey diagram showing account-to-account money flow.
 */
export const MoneyFlowChart: React.FC<MoneyFlowChartProps> = ({
  transactions,
  accounts,
}) => {
  const [fromFilter, setFromFilter] = useState('all')
  const [toFilter, setToFilter] = useState('all')

  const accountMap = useMemo(
    () => new Map(accounts.map((account) => [account.id, account])),
    [accounts]
  )

  const filteredTransactions = useMemo(
    () =>
      transactions.filter((txn) => {
        if (fromFilter !== 'all' && txn.fromAccountId !== fromFilter) {
          return false
        }
        if (toFilter !== 'all' && txn.toAccountId !== toFilter) {
          return false
        }
        return true
      }),
    [transactions, fromFilter, toFilter]
  )

  const chartOptions = useMemo(() => {
    const rootStyles = getComputedStyle(document.documentElement)
    const getThemeVar = (name: string, fallback: string): string =>
      rootStyles.getPropertyValue(name).trim() || fallback

    const tooltipBg = getThemeVar('--chart-tooltip-bg', '#101a2b')
    const tooltipBorder = getThemeVar('--chart-tooltip-border', '#31425f')
    const tooltipText = getThemeVar('--chart-tooltip-text', '#e5e7eb')
    const labelColor = getThemeVar('--text-primary', '#e5e7eb')
    const nodePalette = [
      '#14d3b2',
      '#8b5cf6',
      '#f59e0b',
      '#ff5a3c',
      '#ff2f7d',
      '#6366f1',
      '#2ec4b6',
      '#3b82f6',
      getThemeVar('--chart-series-1', '#fb923c'),
      getThemeVar('--chart-series-2', '#f97316'),
    ]

    const flowMap = new Map<string, number>()
    const nodeMap = new Map<
      string,
      { name: string; itemStyle: { color: string } }
    >()

    const addNode = (name: string, accountType: Account['type']): void => {
      if (!nodeMap.has(name)) {
        const nextColor = getNodeColor(
          accountType,
          nodeMap.size,
          nodePalette,
          getThemeVar
        )
        nodeMap.set(name, { name, itemStyle: { color: nextColor } })
      }
    }

    filteredTransactions.forEach((txn) => {
      const fromAccount = accountMap.get(txn.fromAccountId)
      const toAccount = accountMap.get(txn.toAccountId)
      if (!fromAccount || !toAccount) return

      addNode(fromAccount.name, fromAccount.type)
      addNode(toAccount.name, toAccount.type)

      const flowKey = `${fromAccount.name}->${toAccount.name}`
      flowMap.set(flowKey, (flowMap.get(flowKey) || 0) + txn.amount)
    })

    const nodes = Array.from(nodeMap.values())
    const links = Array.from(flowMap.entries()).map(([key, value]) => {
      const [source, target] = key.split('->')
      return {
        source,
        target,
        value: value / 100,
      }
    })

    const hasData = nodes.length > 0 && links.length > 0

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        textStyle: {
          color: tooltipText,
        },
        formatter: (params: {
          dataType?: string
          data?: { source: string; target: string; value: number }
          name?: string
        }) => {
          if (params.dataType === 'edge' && params.data) {
            return `${params.data.source} → ${params.data.target}<br/>Amount: ${formatCurrency(params.data.value * 100)}`
          }
          return params.name || ''
        },
      },
      series: [
        {
          type: 'sankey',
          left: '5%',
          right: '20%',
          top: '8%',
          bottom: '5%',
          nodeWidth: 30,
          nodeGap: 15,
          layoutIterations: 32,
          orient: 'horizontal',
          draggable: false,
          emphasis: {
            focus: 'adjacency',
          },
          data: hasData ? nodes : [],
          links: hasData ? links : [],
          lineStyle: {
            color: 'gradient',
            curveness: 0.5,
            opacity: 0.14,
          },
          label: {
            show: true,
            color: labelColor,
            fontSize: 14,
            fontWeight: 600,
            position: 'right',
            formatter: '{b}',
            overflow: 'none',
          },
        },
      ],
    }
  }, [filteredTransactions, accountMap])

  const hasFlowData = filteredTransactions.some((txn) => {
    const fromAccount = accountMap.get(txn.fromAccountId)
    const toAccount = accountMap.get(txn.toAccountId)
    return Boolean(fromAccount && toAccount)
  })

  const accountOptions = [
    { value: 'all', label: 'All Accounts' },
    ...accounts
      .filter((account) => account.status === 'active')
      .map((account) => ({
        value: account.id,
        label: account.name,
      })),
  ]

  return (
    <Box
      sx={{
        backgroundColor: 'var(--card-background)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        p: '20px',
        boxShadow: 'var(--shadow-soft)',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          mb: '16px',
        }}
      >
        <Box>
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              m: '0 0 4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Typography component="span" sx={{ fontSize: '1.25rem' }}>
              🔄
            </Typography>
            Money Flow
          </Typography>
          <Typography
            sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)', m: 0 }}
          >
            Account-to-account money movement
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <FormControl size="small" sx={{ width: '180px' }}>
            <InputLabel id="money-flow-from-label">From</InputLabel>
            <Select
              labelId="money-flow-from-label"
              label="From"
              value={fromFilter}
              onChange={(e) => setFromFilter(e.target.value)}
            >
              {accountOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ width: '180px' }}>
            <InputLabel id="money-flow-to-label">To</InputLabel>
            <Select
              labelId="money-flow-to-label"
              label="To"
              value={toFilter}
              onChange={(e) => setToFilter(e.target.value)}
            >
              {accountOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Box
        sx={{ border: '1px solid var(--border-color)', borderRadius: '12px' }}
      >
        {hasFlowData ? (
          <ReactECharts
            option={chartOptions}
            style={{ height: '450px', width: '100%', minHeight: '450px' }}
            notMerge={true}
            lazyUpdate={true}
          />
        ) : (
          <div
            style={{
              height: '400px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              textAlign: 'center',
              padding: '2rem',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💸</div>
            <h4
              style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}
            >
              No Money Flow Data Yet
            </h4>
            <p style={{ maxWidth: '500px', lineHeight: '1.6' }}>
              Record transactions between accounts to visualize money movement.
            </p>
          </div>
        )}
      </Box>
    </Box>
  )
}

export default MoneyFlowChart
