import { Clock3 } from 'lucide-react'
import Badge from '../ui/Badge'
import { formatCurrency } from '../../utils/formatCurrency'
import { labelize } from '../../utils/statusStyles'

export default function RecoveryCard({ item }) {
  return <article className="recovery-card"><div className="recovery-card-top"><Badge value={item.eventType}/><span>#{item.id}</span></div><strong className="risk-amount">{formatCurrency(item.amount)} <small>at risk</small></strong><p>{item.failureReason ? labelize(item.failureReason) : 'Checkout abandonment'}</p><div className="mini-row"><span>Priority</span><Badge value={item.riskLevel}/></div><div className="recommended-action"><span>Recommended action</span><strong>{item.eventType==='PAYMENT_FAILED' ? (item.failureReason==='NETWORK_ERROR' ? 'Retry Payment' : 'Payment Method Update') : 'Checkout Reminder'}</strong></div><footer><span>C{String(item.customerId).padStart(3,'0')}</span><span><Clock3 size={13}/> {new Date(item.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></footer></article>
}
