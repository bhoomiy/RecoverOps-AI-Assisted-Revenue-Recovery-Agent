import { useEffect, useState } from 'react'
import {
  CircleCheckBig,
  CircleX,
  ShieldAlert
} from 'lucide-react'

import PageHeader from '../components/ui/PageHeader'
import MetricCard from '../components/dashboard/MetricCard'
import RecoveryBoard from '../components/recovery/RecoveryBoard'
import { api } from '../services/api'
import { formatCurrency } from '../utils/formatCurrency'

export default function RecoveryCenter() {
  const [recoveries, setRecoveries] = useState([])
  const [batchRunning, setBatchRunning] = useState(false)
const [batchResult, setBatchResult] = useState(null)
const [batchError, setBatchError] = useState('')

  const [metrics, setMetrics] = useState({
  needs_recovery: 0,
  recovered: 0,
  failed: 0
})

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  async function handleBatchRecovery() {
  try {
    setBatchRunning(true)
    setBatchResult(null)
    setBatchError('')

    const result = await api.batchRecovery()

    setBatchResult(result)

    // Reload the board + counts after database changes
    await loadRecoveries()

  } catch (err) {
    console.error(err)

    setBatchError(
      'Batch recovery could not be completed.'
    )
  } finally {
    setBatchRunning(false)
  }
}

  async function loadRecoveries() {
    try {
      setLoading(true)
      setError('')

      const data = await api.recoveries()

      const formatted = data.recoveries.map((r) => ({
        id: r.id,
        customerId: r.customer_id,
        eventType: r.event_type,
        amount: r.amount_at_risk,
        failureReason: r.failure_reason,
        timestamp: r.timestamp,
        riskLevel: r.risk_level,
        priority: r.priority,
        status: r.status,
        recommendedAction: r.recommended_action,
        recoverySuccess: r.recovery_success,
        simulationResult: r.simulation_result,
        revenueRecovered: r.revenue_recovered,
        revenueLost: r.revenue_lost
      }))

      setRecoveries(formatted)
      setMetrics(data.metrics)
    } catch (err) {
      console.error(err)
      setError('Could not load recovery data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecoveries()
  }, [])

  return (
    <>
      <PageHeader
  title="Recovery Center"
  subtitle="Manage and execute automated revenue recovery workflows."
  actions={
    <button
      className="primary-button"
      onClick={handleBatchRecovery}
      disabled={batchRunning}
    >
      {batchRunning
        ? 'Running batch...'
        : 'Run Batch Recovery'}
    </button>
  }
/>
{batchResult && (
  <div className="batch-result">
    <div>
      <strong>Batch recovery complete</strong>

      <span>
        {batchResult.attempted} attempted
        {' · '}
        {batchResult.successful} recovered
        {' · '}
        {batchResult.failed} failed
        {' · '}
        {batchResult.no_action} no action
      </span>
    </div>

    <strong className="batch-revenue">
      {formatCurrency(batchResult.revenue_recovered)}
      {' '}recovered
    </strong>
  </div>
)}

{batchError && (
  <div className="batch-error">
    {batchError}
  </div>
)}

      <div className="recovery-metric-grid">
        <MetricCard
          label="Needs Recovery"
          value={metrics.needs_recovery}
          detail="Awaiting recovery"
          icon={ShieldAlert}
          accent="red"
        />


        <MetricCard
          label="Recovered"
          value={metrics.recovered}
          detail="Successful recoveries"
          icon={CircleCheckBig}
          accent="green"
        />

        <MetricCard
          label="Failed"
          value={metrics.failed}
          detail="Unsuccessful recoveries"
          icon={CircleX}
          accent="violet"
        />
      </div>

      {loading && <p>Loading recovery data...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && (
        <RecoveryBoard
          transactions={recoveries}
          onRecoveryExecuted={loadRecoveries}
        />
      )}
    </>
  )
}