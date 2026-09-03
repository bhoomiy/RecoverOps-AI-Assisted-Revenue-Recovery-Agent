import { ArrowLeft, ExternalLink } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import Badge from '../components/ui/Badge'
import PageHeader from '../components/ui/PageHeader'
import AgentPipeline from '../components/intelligence/AgentPipeline'
import { CustomerCard, DecisionCard, RecoveryResultCard, RiskDetectorCard } from '../components/intelligence/IntelligenceCards'
import AgentTimeline from '../components/intelligence/AgentTimeline'
import { intelligence, transactions } from '../data/mockTransactions'
import { formatCurrency } from '../utils/formatCurrency'
import { labelize } from '../utils/statusStyles'

export default function TransactionIntelligence() {
  const {id}=useParams()
  const fallback=intelligence[3658]
  const data=intelligence[id] || {...fallback, transaction: transactions.find(t=>String(t.id)===String(id)) || fallback.transaction}
  const t=data.transaction
  return <>
    <div className="breadcrumb"><Link to="/transactions"><ArrowLeft size={14}/> Transactions</Link><span>/</span><strong>#{t.id}</strong></div>
    <PageHeader title="Transaction Intelligence" subtitle="Trace the agent pipeline, decision logic and recovery result." actions={<button className="secondary-button"><ExternalLink size={14}/> Raw event</button>} />
    <div className="transaction-hero"><div><span className="eyebrow">Transaction #{t.id}</span><h2>{labelize(t.eventType)} <Badge value={t.status}/></h2><p>Customer C{String(t.customerId).padStart(3,'0')} · Revenue at risk</p></div><strong>{formatCurrency(t.amount,2)}</strong></div>
    <AgentPipeline/>
    <div className="intel-grid"><RiskDetectorCard data={data.risk}/><CustomerCard data={data.customer}/><DecisionCard data={data.decision}/><RecoveryResultCard data={data.recovery}/></div>
    <AgentTimeline/>
  </>
}
