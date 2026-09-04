import { useState } from 'react'
import { Clock3 } from 'lucide-react'

import Badge from '../ui/Badge'
import { formatCurrency } from '../../utils/formatCurrency'
import { labelize } from '../../utils/statusStyles'
import { api } from '../../services/api'

export default function RecoveryCard({
  item,
  onRecoveryExecuted
}) {
  const [executing, setExecuting] = useState(false)
  const [error, setError] = useState('')

  async function handleExecuteRecovery() {
    try {
      setExecuting(true)
      setError('')

      await api.executeRecovery(item.id)

      if (onRecoveryExecuted) {
        await onRecoveryExecuted()
      }
    } catch (err) {
      console.error(err)
      setError('Recovery execution failed.')
    } finally {
      setExecuting(false)
    }
  }

  return (
    <article className="recovery-card">

      <div className="recovery-card-top">
        <Badge value={item.eventType} />
        <span>#{item.id}</span>
      </div>

      <strong className="risk-amount">
        {formatCurrency(item.amount)}
        {' '}
        <small>at risk</small>
      </strong>

      <p>
        {item.failureReason
          ? labelize(item.failureReason)
          : 'Checkout abandonment'}
      </p>

      <div className="mini-row">
        <span>Priority</span>
        <Badge value={item.priority} />
      </div>

      <div className="mini-row">
        <span>Risk</span>
        <Badge value={item.riskLevel} />
      </div>

      <div className="recommended-action">
        <span>Recommended action</span>

        <strong>
          {item.recommendedAction
            ? labelize(item.recommendedAction)
            : 'No action'}
        </strong>
      </div>

      {item.status === 'NEEDS_RECOVERY' &&
        item.recommendedAction &&
        item.recommendedAction !== 'NO_ACTION' && (
          <button
            className="execute-recovery-button"
            onClick={handleExecuteRecovery}
            disabled={executing}
          >
            {executing
              ? 'Executing...'
              : 'Execute Recovery'}
          </button>
        )}

      {error && (
        <p className="recovery-error">
          {error}
        </p>
      )}

      {item.status === 'RECOVERED' && (
        <div className="mini-row">
          <span>Recovered</span>

          <strong>
            {formatCurrency(item.revenueRecovered)}
          </strong>
        </div>
      )}

      {item.status === 'FAILED' && (
        <div className="mini-row">
          <span>Result</span>

          <strong>
            {item.simulationResult
              ? labelize(item.simulationResult)
              : 'Recovery failed'}
          </strong>
        </div>
      )}

      <footer>
        <span>
          C{String(item.customerId).padStart(3, '0')}
        </span>

        <span>
          <Clock3 size={13} />

          {new Date(item.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </footer>

    </article>
  )
}