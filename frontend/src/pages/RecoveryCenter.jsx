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

export default function RecoveryCenter() {
  const [recoveries, setRecoveries] = useState([])
  const [metrics, setMetrics] = useState({
  needs_recovery: 0,
  recovered: 0,
  failed: 0
})

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
        subtitle="Track and manage revenue recovery attempts across the recovery lifecycle."
      />

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