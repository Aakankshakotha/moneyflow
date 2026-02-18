import React, { useState, useEffect } from 'react'
import { NetWorthDisplay, NetWorthChart } from '@/components/features'
import { Button } from '@/components/common'
import * as netWorthService from '@/services/netWorthService'
import type { NetWorthCalculation, NetWorthSnapshot } from '@/types/netWorth'
import './Dashboard.css'

/**
 * Dashboard page - displays net worth overview and trends
 */
const Dashboard: React.FC = () => {
  const [calculation, setCalculation] = useState<NetWorthCalculation | null>(
    null
  )
  const [snapshots, setSnapshots] = useState<NetWorthSnapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creatingSnapshot, setCreatingSnapshot] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async (): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      // Load current net worth calculation
      const calcResult = await netWorthService.calculateNetWorth()
      if (calcResult.success) {
        setCalculation(calcResult.data)
      } else {
        setError('Failed to calculate net worth')
      }

      // Load historical snapshots
      const historyResult = await netWorthService.getNetWorthHistory()
      if (historyResult.success) {
        setSnapshots(historyResult.data)
      }
    } catch (err) {
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSnapshot = async (): Promise<void> => {
    setCreatingSnapshot(true)
    setError(null)

    try {
      const result = await netWorthService.createSnapshot()
      if (result.success) {
        await loadDashboardData()
      } else {
        setError('Failed to create snapshot')
      }
    } catch (err) {
      setError('Failed to create snapshot')
    } finally {
      setCreatingSnapshot(false)
    }
  }

  if (loading && !calculation) {
    return (
      <div className="dashboard-page">
        <p>Loading dashboard...</p>
      </div>
    )
  }

  if (error && !calculation) {
    return (
      <div className="dashboard-page">
        <p className="dashboard-page__error">{error}</p>
        <Button onClick={loadDashboardData}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__header">
        <h1>Dashboard</h1>
        <Button
          onClick={handleCreateSnapshot}
          disabled={creatingSnapshot || !calculation}
        >
          {creatingSnapshot ? 'Creating...' : 'Create Snapshot'}
        </Button>
      </div>

      {error && <div className="dashboard-page__error-banner">{error}</div>}

      <div className="dashboard-page__content">
        {calculation && (
          <div className="dashboard-page__section">
            <NetWorthDisplay calculation={calculation} loading={loading} />
          </div>
        )}

        <div className="dashboard-page__section">
          <NetWorthChart snapshots={snapshots} loading={loading} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
