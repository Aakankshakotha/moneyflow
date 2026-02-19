import React, { useMemo, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import type { Transaction } from '@/types/transaction'
import type { Account } from '@/types/account'
import { Select } from '@/components/common'
import { formatCurrency } from '@/utils/currencyUtils'
import './MoneyFlowChart.css'

interface MoneyFlowChartProps {
  transactions: Transaction[]
  accounts: Account[]
}

const getAccountColor = (
  accountType: Account['type'],
  getThemeVar: (name: string, fallback: string) => string
): string => {
  if (accountType === 'income')
    return getThemeVar('--chart-series-income', '#5fd6a1')
  if (accountType === 'asset') return getThemeVar('--chart-series-1', '#88a3ff')
  if (accountType === 'expense')
    return getThemeVar('--chart-series-expense', '#f59a9a')
  return getThemeVar('--chart-series-liability', '#f3c178')
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

    const flowMap = new Map<string, number>()
    const nodeMap = new Map<
      string,
      { name: string; itemStyle: { color: string } }
    >()

    const addNode = (name: string, color: string): void => {
      if (!nodeMap.has(name)) {
        nodeMap.set(name, { name, itemStyle: { color } })
      }
    }

    filteredTransactions.forEach((txn) => {
      const fromAccount = accountMap.get(txn.fromAccountId)
      const toAccount = accountMap.get(txn.toAccountId)
      if (!fromAccount || !toAccount) return

      addNode(fromAccount.name, getAccountColor(fromAccount.type, getThemeVar))
      addNode(toAccount.name, getAccountColor(toAccount.type, getThemeVar))

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
            opacity: 0.18,
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
    <div className="money-flow-chart">
      <div className="money-flow-chart__header">
        <h3 className="money-flow-chart__title">
          <span className="money-flow-chart__icon">🔄</span>
          Money Flow
        </h3>
        <p className="money-flow-chart__subtitle">
          Account-to-account money movement
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gap: '12px',
          gridTemplateColumns: '1fr 1fr',
          marginBottom: '16px',
        }}
      >
        <Select
          label="From Account"
          value={fromFilter}
          onChange={(e) => setFromFilter(e.target.value)}
          options={accountOptions}
        />
        <Select
          label="To Account"
          value={toFilter}
          onChange={(e) => setToFilter(e.target.value)}
          options={accountOptions}
        />
      </div>

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
          <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            No Money Flow Data Yet
          </h4>
          <p style={{ maxWidth: '500px', lineHeight: '1.6' }}>
            Record transactions between accounts to visualize money movement.
          </p>
        </div>
      )}
    </div>
  )
}

export default MoneyFlowChart
