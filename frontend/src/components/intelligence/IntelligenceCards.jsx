import {
  Bot,
  CircleDollarSign,
  ShieldAlert,
  UserRound
} from 'lucide-react'

import Card from '../ui/Card'
import Badge from '../ui/Badge'
import { formatCurrency } from '../../utils/formatCurrency'
import { labelize } from '../../utils/statusStyles'


function InfoRow({ label, children }) {
  return (
    <div className="info-row">
      <span>{label}</span>
      <strong>{children}</strong>
    </div>
  )
}


// Prevent labelize() from receiving null
function safeLabel(value) {
  return value ? labelize(value) : '—'
}


// Prevent Badge from receiving null
function SafeBadge({ value }) {
  return value ? <Badge value={value} /> : <span>—</span>
}


export function RiskDetectorCard({ data }) {
  if (!data) {
    return null
  }

  return (
    <Card className="intel-card">

      <div className="intel-title">
        <span className="icon danger">
          <ShieldAlert size={17} />
        </span>

        <div>
          <h3>Risk Detector</h3>
          <p>Revenue exposure analysis</p>
        </div>
      </div>

      <InfoRow label="Revenue at risk">
        {formatCurrency(data.amount_at_risk ?? 0, 2)}
      </InfoRow>

      <InfoRow label="Risk level">
        <SafeBadge value={data.risk_level} />
      </InfoRow>

      <InfoRow label="Risk type">
        {safeLabel(data.risk_type)}
      </InfoRow>

      <InfoRow label="Failure reason">
        {safeLabel(data.cause)}
      </InfoRow>

      <InfoRow label="Cause category">
        {safeLabel(data.cause_category)}
      </InfoRow>

      <InfoRow label="Recoverability">
        <SafeBadge value={data.recoverability} />
      </InfoRow>

      {data.recovery_potential && (
        <InfoRow label="Recovery potential">
          <SafeBadge value={data.recovery_potential} />
        </InfoRow>
      )}

      {data.value_category && (
        <InfoRow label="Value category">
          {safeLabel(data.value_category)}
        </InfoRow>
      )}

      {data.cart_size && (
        <InfoRow label="Cart size">
          {safeLabel(data.cart_size)}
        </InfoRow>
      )}

    </Card>
  )
}


export function CustomerCard({ data }) {
  if (!data) {
    return null
  }

  return (
    <Card className="intel-card">

      <div className="intel-title">
        <span className="icon blue">
          <UserRound size={17} />
        </span>

        <div>
          <h3>Customer Intelligence</h3>
          <p>Customer value and history</p>
        </div>
      </div>

      <InfoRow label="Customer">
        C{String(data.customer_id ?? '').padStart(3, '0')}
      </InfoRow>

      <InfoRow label="Type">
        {data.type ?? '—'}
      </InfoRow>

      <InfoRow label="Previous purchases">
        {data.prev_purchases ?? '—'}
      </InfoRow>

      <InfoRow label="Total spending">
        {formatCurrency(data.total_spending ?? 0, 2)}
      </InfoRow>

      <InfoRow label="Customer lifetime value">
        {formatCurrency(data.clv ?? 0, 2)}
      </InfoRow>

      <InfoRow label="Average order value">
        {formatCurrency(data.avg_order_value ?? 0, 2)}
      </InfoRow>

      <InfoRow label="Customer value">
        <SafeBadge value={data.customer_value} />
      </InfoRow>

    </Card>
  )
}


export function DecisionCard({ data }) {
  if (!data) {
    return (
      <Card className="intel-card">

        <div className="intel-title">
          <span className="icon violet">
            <Bot size={17} />
          </span>

          <div>
            <h3>Decision Agent</h3>
            <p>Selected recovery strategy</p>
          </div>
        </div>

        <div className="reason-box">
          <span>Status</span>
          <p>No recovery action required.</p>
        </div>

      </Card>
    )
  }

  return (
    <Card className="intel-card">

      <div className="intel-title">
        <span className="icon violet">
          <Bot size={17} />
        </span>

        <div>
          <h3>Decision Agent</h3>
          <p>Selected recovery strategy</p>
        </div>
      </div>

      <InfoRow label="Priority">
        <SafeBadge value={data.priority} />
      </InfoRow>

      <div className="decision-box">
        <span>Recommended action</span>
        <strong>{safeLabel(data.action)}</strong>
      </div>

      <div className="reason-box">
        <span>Reason</span>
        <p>{data.reason ?? '—'}</p>
      </div>

      <InfoRow label="Recoverability">
        <SafeBadge value={data.recoverability} />
      </InfoRow>

      <InfoRow label="Amount">
        {formatCurrency(data.amount ?? 0, 2)}
      </InfoRow>

    </Card>
  )
}


export function RecoveryResultCard({ data }) {
  if (!data) {
    return (
      <Card className="intel-card recovery-result">

        <div className="intel-title">
          <span className="icon success">
            <CircleDollarSign size={17} />
          </span>

          <div>
            <h3>Recovery Result</h3>
            <p>Execution outcome</p>
          </div>
        </div>

        <div className="reason-box">
          <span>Status</span>
          <p>Recovery has not been executed yet.</p>
        </div>

      </Card>
    )
  }

  const success =
    data.success === 1 ||
    data.success === true

  return (
    <Card className="intel-card recovery-result">

      <div className="intel-title">
        <span className="icon success">
          <CircleDollarSign size={17} />
        </span>

        <div>
          <h3>Recovery Result</h3>
          <p>Execution outcome</p>
        </div>
      </div>

      <InfoRow label="Simulation result">
        {safeLabel(data.simulation_result)}
      </InfoRow>

      <InfoRow label="Recovery successful">
        <Badge value={success ? 'SUCCESS' : 'FAILED'} />
      </InfoRow>

      <div className="recovered-amount">
        <span>Revenue recovered</span>

        <strong>
          {formatCurrency(data.revenue_recovered ?? 0, 2)}
        </strong>
      </div>

      <InfoRow label="Revenue lost">
        {formatCurrency(data.revenue_lost ?? 0, 2)}
      </InfoRow>

      <InfoRow label="Action taken">
        {safeLabel(data.action_taken)}
      </InfoRow>

    </Card>
  )
}