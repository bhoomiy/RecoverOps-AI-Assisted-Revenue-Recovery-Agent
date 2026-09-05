import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  Bot,
  CircleCheckBig,
  Cpu
} from 'lucide-react'

import PageHeader from '../components/ui/PageHeader'
import MetricCard from '../components/dashboard/MetricCard'
import Card from '../components/ui/Card'
import { api } from '../services/api'
import { labelize } from '../utils/statusStyles'

export default function AgentActivity() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    async function loadActivity() {
      try {
        setLoading(true)
        setError('')

        const result = await api.activity()

        setData(result)
      } catch (err) {
        console.error(err)
        setError('Failed to load agent activity.')
      } finally {
        setLoading(false)
      }
    }

    loadActivity()
  }, [])

  const filteredActivity = useMemo(() => {
    if (!data?.activity) {
      return []
    }

    if (filter === 'ALL') {
      return data.activity
    }

    return data.activity.filter(
      (item) => item.activity_type === filter
    )
  }, [data, filter])

  function formatTime(timestamp) {
    if (!timestamp) {
      return '—'
    }

    const date = new Date(timestamp)

    if (Number.isNaN(date.getTime())) {
      return timestamp
    }

    return date.toLocaleString()
  }

  if (loading) {
    return (
      <div className="page-state">
        Loading agent activity...
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-state">
        {error}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="page-state">
        No agent activity available.
      </div>
    )
  }

  const metrics = data.metrics

  return (
    <>
      <PageHeader
        title="Agent Activity"
        subtitle="Visibility into recent revenue recovery agent decisions and actions."
        />

      <div className="metric-grid">
        <MetricCard
          label="Agent Status"
          value={metrics.agent_status}
          detail="Live"
          icon={Bot}
          accent="green"
        />

        <MetricCard
          label="Events Processed"
          value={metrics.events_processed.toLocaleString()}
          detail="At-risk events evaluated"
          icon={Cpu}
          accent="blue"
        />

        <MetricCard
          label="Recovery Actions"
          value={metrics.recovery_actions.toLocaleString()}
          detail="Actions attempted"
          icon={Activity}
          accent="violet"
        />

        <MetricCard
          label="Successful Recoveries"
          value={metrics.successful_recoveries.toLocaleString()}
          detail="Recovered transactions"
          icon={CircleCheckBig}
          accent="green"
        />
      </div>

      <Card className="log-card">
        <div className="section-title-row">
          <div>
            <h3>Agent Event Stream</h3>

            <p>
              Recent execution trace across recovery modules
            </p>
          </div>

          <div className="filter-pills">
            <button
              className={
                filter === 'ALL'
                  ? 'active'
                  : ''
              }
              onClick={() => setFilter('ALL')}
            >
              All Activity
            </button>

            <button
              className={
                filter === 'DECISION'
                  ? 'active'
                  : ''
              }
              onClick={() => setFilter('DECISION')}
            >
              Decisions
            </button>

            <button
              className={
                filter === 'RECOVERY'
                  ? 'active'
                  : ''
              }
              onClick={() => setFilter('RECOVERY')}
            >
              Recovery
            </button>
          </div>
        </div>

        <div className="log-stream">
          {filteredActivity.length === 0 ? (
            <div className="page-state">
              No activity found for this filter.
            </div>
          ) : (
            filteredActivity.map((a, index) => (
              <div
                className="log-row"
                key={`${a.transaction_id}-${index}`}
              >
                <time>
                  {formatTime(a.time)}
                </time>

                <span className="log-dot" />

                <div>
                  <strong>
                    {a.module}
                  </strong>

                  <h4>
                    {a.title}
                  </h4>

                  <p>
                    {a.detail}
                  </p>

                  {a.action &&
                    a.action !== 'NO_ACTION' && (
                      <small>
                        Action: {labelize(a.action)}
                      </small>
                    )}
                </div>

                <span
                  className={`log-status ${
                    a.status?.toLowerCase() || ''
                  }`}
                >
                  {labelize(a.status)}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>
    </>
  )
}