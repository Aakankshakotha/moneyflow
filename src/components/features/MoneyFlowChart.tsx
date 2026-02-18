import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import type { Transaction } from '@/types/transaction'
import type { Account } from '@/types/account'
import { formatCurrency } from '@/utils/currencyUtils'
import { categoryService } from '@/services/categoryService'
import { useTheme } from '@/contexts/ThemeContext'
import './MoneyFlowChart.css'

interface MoneyFlowChartProps {
  transactions: Transaction[]
  accounts: Account[]
}

/**
 * MoneyFlowChart Component
 * Displays a Sankey diagram showing 3-level money flow:
 * Income Categories → Asset Accounts → Expense Categories
 */
export const MoneyFlowChart: React.FC<MoneyFlowChartProps> = ({
  transactions,
  accounts,
}) => {
  const { theme } = useTheme()

  const chartOptions = useMemo(() => {
    // Build account map
    const accountMap = new Map(accounts.map((a) => [a.id, a]))

    // Track flows and nodes
    const flowMap = new Map<string, number>()
    const nodeMap = new Map<
      string,
      { name: string; itemStyle: { color: string } }
    >()

    // Helper to add a node with color
    const addNode = (name: string, color: string): void => {
      if (!nodeMap.has(name)) {
        nodeMap.set(name, { name, itemStyle: { color } })
      }
    }

    // Helper to add flow
    const addFlow = (from: string, to: string, amount: number): void => {
      const key = `${from}->${to}`
      flowMap.set(key, (flowMap.get(key) || 0) + amount)
    }

    // Process all transactions to build 3-level flow
    transactions.forEach((txn) => {
      const fromAcc = accountMap.get(txn.fromAccountId)
      const toAcc = accountMap.get(txn.toAccountId)

      if (!fromAcc || !toAcc) return

      // Pattern 1: Income → Asset (left to middle)
      if (fromAcc.type === 'income' && toAcc.type === 'asset') {
        const incomeName = txn.category
          ? categoryService.getCategoryName(txn.category)
          : fromAcc.name
        const assetName = toAcc.name

        addNode(incomeName, '#10b981') // Green for income
        addNode(assetName, '#3b82f6') // Blue for assets
        addFlow(incomeName, assetName, txn.amount)
      }
      // Pattern 2: Asset → Anything (middle to right)
      else if (fromAcc.type === 'asset') {
        const assetName = fromAcc.name
        let targetName: string
        let targetColor: string

        // If category is provided, use it
        if (txn.category) {
          const category = categoryService.getCategoryById(txn.category)
          // Skip income categories on the expense side
          if (category && category.group === 'income') return

          targetName = categoryService.getCategoryName(txn.category)
          targetColor = categoryService.getCategoryColor(txn.category)
        }
        // Otherwise, use the destination account name
        else {
          targetName = toAcc.name
          // Color based on account type
          if (toAcc.type === 'expense') {
            targetColor = '#ef4444' // Red for expenses
          } else if (toAcc.type === 'asset') {
            targetColor = '#3b82f6' // Blue for asset transfers
          } else {
            targetColor = '#6b7280' // Gray for other
          }
        }

        addNode(assetName, '#3b82f6') // Blue for assets
        addNode(targetName, targetColor)
        addFlow(assetName, targetName, txn.amount)
      }
      // Pattern 3: Any other outflow (fallback)
      else if (fromAcc.type !== 'liability') {
        const fromName = fromAcc.name
        const toName = txn.category
          ? categoryService.getCategoryName(txn.category)
          : toAcc.name

        const fromColor = fromAcc.type === 'income' ? '#10b981' : '#6b7280'
        const toColor = txn.category
          ? categoryService.getCategoryColor(txn.category)
          : '#ef4444'

        addNode(fromName, fromColor)
        addNode(toName, toColor)
        addFlow(fromName, toName, txn.amount)
      }
    })

    // Convert to ECharts format
    const nodeArray = Array.from(nodeMap.values())

    const links = Array.from(flowMap.entries()).map(([key, value]) => {
      const [source, target] = key.split('->')
      return {
        source,
        target,
        value: value / 100, // Convert cents to dollars
      }
    })

    // Check if we have data to display
    const hasData = nodeArray.length > 0 && links.length > 0

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#333',
        textStyle: {
          color: '#fff',
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
          top: '5%',
          bottom: '5%',
          nodeWidth: 30,
          nodeGap: 15,
          layoutIterations: 32,
          orient: 'horizontal',
          draggable: false,
          emphasis: {
            focus: 'adjacency',
          },
          data: hasData ? nodeArray : [],
          links: hasData ? links : [],
          lineStyle: {
            color: 'gradient',
            curveness: 0.5,
            opacity: 0.25,
          },
          label: {
            show: true,
            color: theme === 'dark' ? '#f3f4f6' : '#1f2937',
            fontSize: 14,
            fontWeight: 600,
            position: 'right',
            formatter: '{b}',
            overflow: 'none',
          },
        },
      ],
    }
  }, [transactions, accounts, theme])

  // Check if we have any data to display
  const hasFlowData = useMemo(() => {
    const accountMap = new Map(accounts.map((a) => [a.id, a]))

    // Check for income → asset flows
    const hasIncomeFlow = transactions.some((txn) => {
      const fromAcc = accountMap.get(txn.fromAccountId)
      const toAcc = accountMap.get(txn.toAccountId)
      return fromAcc?.type === 'income' && toAcc?.type === 'asset'
    })

    // Check for asset → expense flows (with or without categories)
    const hasExpenseFlow = transactions.some((txn) => {
      const fromAcc = accountMap.get(txn.fromAccountId)
      return (
        fromAcc?.type === 'asset' &&
        (txn.category || accountMap.get(txn.toAccountId)?.type === 'expense')
      )
    })

    return hasIncomeFlow || hasExpenseFlow
  }, [transactions, accounts])

  // Check if transactions are missing categories
  const needsCategoryWarning = useMemo(() => {
    const transactionsWithCategories = transactions.filter(
      (t) => t.category
    ).length
    return transactions.length > 0 && transactionsWithCategories === 0
  }, [transactions])

  return (
    <div className="money-flow-chart">
      <div className="money-flow-chart__header">
        <h3 className="money-flow-chart__title">
          <span className="money-flow-chart__icon">🔄</span>
          Money Flow
        </h3>
        <p className="money-flow-chart__subtitle">
          Income sources → Accounts → Spending categories
        </p>
      </div>

      {/* Warning if no categories are used */}
      {hasFlowData && needsCategoryWarning && (
        <div
          style={{
            backgroundColor: '#fef3c7',
            color: '#92400e',
            padding: '12px 16px',
            marginBottom: '16px',
            borderRadius: '8px',
            border: '1px solid #fbbf24',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <div style={{ flex: 1, fontSize: '14px', lineHeight: '1.5' }}>
            <strong>No categories found!</strong> Your transactions don't have
            categories assigned.
            <br />
            <span style={{ fontSize: '13px' }}>
              Edit your transactions and add categories like{' '}
              <code
                style={{
                  background: '#fff',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                food-groceries
              </code>
              ,{' '}
              <code
                style={{
                  background: '#fff',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                home-rent
              </code>{' '}
              to see detailed spending breakdown.
            </span>
          </div>
        </div>
      )}

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
            To see your money flow visualization:
          </p>
          <ol
            style={{ textAlign: 'left', marginTop: '1rem', lineHeight: '1.8' }}
          >
            <li>
              Create accounts: <strong>Income</strong> → <strong>Asset</strong>{' '}
              → <strong>Expense</strong>
            </li>
            <li>
              Add transaction: Income account → Asset account (e.g., Salary →
              Checking)
            </li>
            <li>
              Add transaction: Asset account → Any account (e.g., Checking →
              Expenses)
            </li>
            <li>
              Optional: Add <strong>categories</strong> to transactions for
              detailed breakdown
            </li>
          </ol>
          <p
            style={{
              marginTop: '1rem',
              fontSize: '0.9rem',
              fontStyle: 'italic',
            }}
          >
            💡 With categories: shows "Checking → 🛒 Groceries"
            <br />
            Without categories: shows "Checking → Expense Account Name"
          </p>
        </div>
      )}
    </div>
  )
}
