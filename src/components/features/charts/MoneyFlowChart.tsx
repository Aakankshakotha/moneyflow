import React, { useMemo, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import type { Transaction } from '@/types/transaction'
import type { Account } from '@/types/account'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { formatCurrency } from '@/utils/currencyUtils'
import { Box, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'

interface MoneyFlowChartProps {
  transactions: Transaction[]
  accounts: Account[]
}

const getNodeColor = (
  accountType: Account['type'],
  paletteIndex: number,
  palette: string[],
  muiTheme: Theme
): string => {
  const semanticColor =
    accountType === 'income'
      ? muiTheme.palette.success.main
      : accountType === 'expense'
        ? muiTheme.palette.error.main
        : accountType === 'liability'
          ? muiTheme.palette.warning.main
          : muiTheme.palette.primary.main

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

  const muiTheme = useTheme()

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
    const tooltipBg = muiTheme.palette.background.paper
    const tooltipBorder = muiTheme.palette.divider
    const tooltipText = muiTheme.palette.text.primary
    const labelColor = muiTheme.palette.text.primary
    const nodePalette = muiTheme.palette.charts.categorical

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
          muiTheme
        )
        nodeMap.set(name, { name, itemStyle: { color: nextColor } })
      }
    }

    const addFlow = (from: string, to: string, amount: number): void => {
      if (from === to) return // sankey requires source !== target
      const key = `${from}->${to}`
      flowMap.set(key, (flowMap.get(key) || 0) + amount)
    }

    filteredTransactions.forEach((txn) => {
      const fromAccount = accountMap.get(txn.fromAccountId)
      const toAccount = accountMap.get(txn.toAccountId)
      if (!fromAccount || !toAccount) return

      // Resolve display names: use parent name if parent exists, then add child link
      const fromParent = fromAccount.parentAccountId
        ? accountMap.get(fromAccount.parentAccountId)
        : undefined
      const toParent = toAccount.parentAccountId
        ? accountMap.get(toAccount.parentAccountId)
        : undefined

      const fromNode = fromParent ?? fromAccount
      const toNode = toParent ?? toAccount

      addNode(fromNode.name, fromNode.type)
      addNode(toNode.name, toNode.type)

      // Main transaction flow (through parent nodes)
      addFlow(fromNode.name, toNode.name, txn.amount)

      // If from has a parent: add parent → child breakdown link
      if (fromParent) {
        addNode(fromAccount.name, fromAccount.type)
        addFlow(fromParent.name, fromAccount.name, txn.amount)
      }

      // If to has a parent: add parent → child breakdown link
      if (toParent) {
        addNode(toAccount.name, toAccount.type)
        addFlow(toParent.name, toAccount.name, txn.amount)
      }
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
  }, [filteredTransactions, accountMap, muiTheme])

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
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '12px',
        p: '20px',
        boxShadow: 2,
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
              color: 'text.primary',
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
            sx={{ fontSize: '0.875rem', color: 'text.secondary', m: 0 }}
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
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '12px',
        }}
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
              color: 'text.secondary',
              textAlign: 'center',
              padding: '2rem',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💸</div>
            <h4 style={{ marginBottom: '0.5rem', color: 'text.primary' }}>
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
