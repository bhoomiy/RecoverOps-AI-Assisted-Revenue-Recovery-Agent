import { Bot, CircleDollarSign, ShieldAlert, UserRound } from 'lucide-react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import { formatCurrency } from '../../utils/formatCurrency'
import { labelize } from '../../utils/statusStyles'

function InfoRow({ label, children }) { return <div className="info-row"><span>{label}</span><strong>{children}</strong></div> }

export function RiskDetectorCard({ data }) {
  return <Card className="intel-card"><div className="intel-title"><span className="icon danger"><ShieldAlert size={17}/></span><div><h3>Risk Detector</h3><p>Revenue exposure analysis</p></div></div><InfoRow label="Revenue at risk">{formatCurrency(data.amountAtRisk,2)}</InfoRow><InfoRow label="Risk level"><Badge value={data.riskLevel}/></InfoRow><InfoRow label="Failure reason">{labelize(data.failureReason)}</InfoRow><InfoRow label="Cause">{labelize(data.cause)}</InfoRow><InfoRow label="Recoverability"><Badge value={data.recoverability}/></InfoRow></Card>
}

export function CustomerCard({ data }) {
  return <Card className="intel-card"><div className="intel-title"><span className="icon blue"><UserRound size={17}/></span><div><h3>Customer Intelligence</h3><p>Customer value and history</p></div></div><InfoRow label="Customer">C{String(data.customerId).padStart(3,'0')}</InfoRow><InfoRow label="Type">{data.customerType}</InfoRow><InfoRow label="Previous purchases">{data.previousPurchases}</InfoRow><InfoRow label="Total spending">{formatCurrency(data.totalSpending,2)}</InfoRow><InfoRow label="Customer lifetime value">{formatCurrency(data.clv,2)}</InfoRow><InfoRow label="Average order value">{formatCurrency(data.averageOrderValue,2)}</InfoRow><InfoRow label="Customer value"><Badge value={data.customerValue}/></InfoRow></Card>
}

export function DecisionCard({ data }) {
  return <Card className="intel-card"><div className="intel-title"><span className="icon violet"><Bot size={17}/></span><div><h3>Decision Agent</h3><p>Selected recovery strategy</p></div></div><InfoRow label="Priority"><Badge value={data.priority}/></InfoRow><div className="decision-box"><span>Recommended action</span><strong>{labelize(data.action)}</strong></div><div className="reason-box"><span>Reason</span><p>{data.reason}</p></div><InfoRow label="Recoverability"><Badge value={data.recoverability}/></InfoRow></Card>
}

export function RecoveryResultCard({ data }) {
  return <Card className="intel-card recovery-result"><div className="intel-title"><span className="icon success"><CircleDollarSign size={17}/></span><div><h3>Recovery Result</h3><p>Execution outcome</p></div></div><InfoRow label="Simulation result">{labelize(data.simulationResult)}</InfoRow><InfoRow label="Recovery successful"><Badge value={data.success ? 'SUCCESS' : 'FAILED'}>{data.success ? 'Yes' : 'No'}</Badge></InfoRow><div className="recovered-amount"><span>Revenue recovered</span><strong>{formatCurrency(data.revenueRecovered,2)}</strong></div><InfoRow label="Revenue lost">{formatCurrency(data.revenueLost,2)}</InfoRow></Card>
}
