import { useEffect, useState } from 'react'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import Badge from '../components/ui/Badge'
import PageHeader from '../components/ui/PageHeader'
import AgentPipeline from '../components/intelligence/AgentPipeline'

import {
  CustomerCard,
  DecisionCard,
  RecoveryResultCard,
  RiskDetectorCard
} from '../components/intelligence/IntelligenceCards'

import AgentTimeline from '../components/intelligence/AgentTimeline'

import { api } from '../services/api'
import { formatCurrency } from '../utils/formatCurrency'
import { labelize } from '../utils/statusStyles'

export default function TransactionIntelligence() {
  const { id } = useParams()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [aiData, setAiData] = useState(null)
const [aiLoading, setAiLoading] = useState(false)
const [aiError, setAiError] = useState('')

  useEffect(() => {
    async function loadTransaction() {
      try {
        setLoading(true)
        setError(null)

        const result = await api.transaction(id)

        setData(result)
      } catch (err) {
        console.error(err)
        setError('Failed to load transaction intelligence.')
      } finally {
        setLoading(false)
      }
    }

    loadTransaction()
  }, [id])
async function handleGenerateAI() {
  try {
    setAiLoading(true)
    setAiError('')

    const result = await api.generateTransactionAI(id)

    if (result.generated_content?.error) {
      throw new Error(result.generated_content.message)
    }

    setAiData(result.generated_content)
  } catch (err) {
    console.error(err)
    setAiError('Failed to generate AI insight.')
  } finally {
    setAiLoading(false)
  }
}
  if (loading) {
    return (
      <div className="page-state">
        Loading transaction intelligence...
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
        Transaction not found.
      </div>
    )
  }

  const t = data.transaction
  const risk = data.risk_analysis
  const customer = data.customer_analysis
  const decision = data.decision
  const recovery = data.recovery

  const recoveryStatus =
    recovery?.success === 1
      ? 'RECOVERED'
      : recovery?.success === 0
      ? 'FAILED'
      : 'PENDING'

  const amountAtRisk =
    risk?.amount_at_risk ??
    t.cart_value ??
    t.amount ??
    0

  return (
    <>
      <div className="breadcrumb">
        <Link to="/transactions">
          <ArrowLeft size={14} />
          Transactions
        </Link>

        <span>/</span>

        <strong>#{t.transac_id}</strong>
      </div>

      <PageHeader
        title="Transaction Intelligence"
        subtitle="Trace the agent pipeline, decision logic and recovery result."
        actions={
          <button className="secondary-button">
            <ExternalLink size={14} />
            Raw event
          </button>
        }
      />

      <div className="transaction-hero">
        <div>
          <span className="eyebrow">
            Transaction #{t.transac_id}
          </span>

          <h2>
            {labelize(t.event_type)}
            {' '}
            <Badge value={recoveryStatus} />
          </h2>

          <p>
            Customer C{String(t.customer_id).padStart(3, '0')}
            {' · '}
            Revenue at risk
          </p>
        </div>

        <strong>
          {formatCurrency(amountAtRisk, 2)}
        </strong>
      </div>

      <AgentPipeline />

      <div className="intel-grid">
        <RiskDetectorCard data={risk} />

        <CustomerCard data={customer} />

        <DecisionCard data={decision} />

        <RecoveryResultCard data={recovery} />
      </div>
        <div className="ai-intelligence-panel">
  <div className="ai-intelligence-header">
    <div>
      <span className="eyebrow">GROQ AI ASSISTANT</span>
      <h3>Recovery Explanation</h3>
      <p>
        Generate an AI explanation and customer-facing recovery message
        based on the agent's decision.
      </p>
    </div>

    <button
      className="secondary-button"
      onClick={handleGenerateAI}
      disabled={aiLoading}
    >
      {aiLoading
        ? 'Generating...'
        : aiData
        ? 'Regenerate Insight'
        : 'Generate AI Insight'}
    </button>
  </div>

  {aiError && (
    <div className="ai-error">
      {aiError}
    </div>
  )}

  {!aiData && !aiLoading && (
    <div className="ai-placeholder">
      AI insight has not been generated for this transaction yet.
    </div>
  )}

  {aiLoading && (
    <div className="ai-placeholder">
      Groq is analyzing the recovery decision...
    </div>
  )}

  {aiData && (
    <div className="ai-content">

      <div className="ai-explanation">
        <span className="eyebrow">WHY THIS ACTION?</span>
        <p>{aiData.explanation}</p>
      </div>

      <div className="ai-factors">
        {aiData.key_factors?.map((factor, index) => (
          <span key={index}>
            {factor}
          </span>
        ))}
      </div>

      <div className="ai-message">
        <span className="eyebrow">
          CUSTOMER MESSAGE
        </span>

        <h4>{aiData.subject}</h4>

        <div className="ai-message-meta">
          <span>
            <strong>Channel:</strong>{' '}
            {aiData.recommended_channel}
          </span>

          <span>
            <strong>Tone:</strong>{' '}
            {aiData.tone}
          </span>
        </div>

        <p>{aiData.explanation}</p>
      </div>

    </div>
  )}
</div>

<AgentTimeline />
      <AgentTimeline />
    </>
  )
}