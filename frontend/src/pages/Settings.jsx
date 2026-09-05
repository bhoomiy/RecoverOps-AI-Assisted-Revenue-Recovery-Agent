import { useEffect, useState } from 'react'

import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import { api } from '../services/api'
import { formatCurrency } from '../utils/formatCurrency'

function StatusValue({ children }) {
  return (
    <span className="setting-status">
      {children}
    </span>
  )
}

export default function Settings() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true)
        setError('')

        const result = await api.settings()

        setData(result)
      } catch (err) {
        console.error(err)

        setError(
          'Failed to load system configuration.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  if (loading) {
    return (
      <div className="page-state">
        Loading settings...
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
        No configuration available.
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="View the current recovery agent configuration."
      />

      <div className="settings-grid">

        <Card className="settings-card">
          <h3>Agent Configuration</h3>

          <p>
            Current execution behavior of the recovery agent.
          </p>

          <div className="setting-row">
            <div>
              <strong>Agent Status</strong>

              <span>
                Current health of the recovery system.
              </span>
            </div>

            <StatusValue>
              {data.agent.status}
            </StatusValue>
          </div>

          <div className="setting-row">
            <div>
              <strong>Execution Mode</strong>

              <span>
                Recovery is triggered through individual
                or batch execution.
              </span>
            </div>

            <StatusValue>
              {data.agent.execution_mode}
            </StatusValue>
          </div>

          <div className="setting-row">
            <div>
              <strong>Recovery Mode</strong>

              <span>
                Recovery outcomes are currently simulated.
              </span>
            </div>

            <StatusValue>
              {data.agent.recovery_mode}
            </StatusValue>
          </div>
        </Card>


        <Card className="settings-card">
          <h3>Risk Thresholds</h3>

          <p>
            Monetary ranges used by the Risk Detector.
          </p>

          <label>
            Low risk threshold

            <input
              value={formatCurrency(
                data.risk_thresholds.low
              )}
              readOnly
            />
          </label>

          <label>
            High risk threshold

            <input
              value={formatCurrency(
                data.risk_thresholds.high
              )}
              readOnly
            />
          </label>
        </Card>


        <Card className="settings-card">
          <h3>Simulation Settings</h3>

          <p>
            Behavior used by the current recovery simulator.
          </p>

          <div className="setting-row">
            <div>
              <strong>
                Returning Customer Rules
              </strong>

              <span>
                Customer history is considered by selected
                simulation rules.
              </span>
            </div>

            <StatusValue>
              {data.simulation.returning_customer_rules
                ? 'Enabled'
                : 'Disabled'}
            </StatusValue>
          </div>

          <div className="setting-row">
            <div>
              <strong>Stored Tracking</strong>

              <span>
                Information currently persisted by the
                recovery pipeline.
              </span>
            </div>

            <StatusValue>
              {data.simulation.tracking}
            </StatusValue>
          </div>
        </Card>


        <Card className="settings-card">
          <h3>AI Assistance</h3>

          <p>
            Configuration for recovery explanations and
            customer-facing message generation.
          </p>

          <div className="setting-row">
            <div>
              <strong>Groq Integration</strong>

              <span>
                Generates recovery explanations and
                communication content.
              </span>
            </div>

            <StatusValue>
              {data.ai.enabled
                ? 'Enabled'
                : 'Disabled'}
            </StatusValue>
          </div>

          <div className="setting-row">
            <div>
              <strong>Generation Mode</strong>

              <span>
                AI is called only when an insight is
                explicitly requested.
              </span>
            </div>

            <StatusValue>
              {data.ai.generation_mode}
            </StatusValue>
          </div>
        </Card>

      </div>
    </>
  )
}