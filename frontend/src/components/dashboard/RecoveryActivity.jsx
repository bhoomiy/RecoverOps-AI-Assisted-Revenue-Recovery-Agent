import { useNavigate } from 'react-router-dom'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import { transactions } from '../../data/mockTransactions'
import { formatCurrency } from '../../utils/formatCurrency'
import { labelize } from '../../utils/statusStyles'

export default function RecoveryActivity() {
  const navigate = useNavigate()
  const rows = transactions.filter(t => t.eventType !== 'SUCCESSFUL_PURCHASE').slice(0, 5)
  return (
    <Card className="activity-card">
      <div className="section-title-row"><div><h3>Live Recovery Activity</h3><p>Latest decisions from the recovery agent</p></div><button className="text-button" onClick={() => navigate('/transactions')}>View all</button></div>
      <div className="activity-table">
        {rows.map(t => (
          <button className="activity-row" key={t.id} onClick={() => navigate(`/transactions/${t.id}`)}>
            <span className="txn-id">#{t.id}</span>
            <span>{labelize(t.eventType)}</span>
            <strong>{formatCurrency(t.amount)}</strong>
            <Badge value={t.riskLevel} />
            <span className="activity-action">{t.failureReason ? labelize(t.failureReason) : 'Checkout reminder'}</span>
            <Badge value={t.status} />
          </button>
        ))}
      </div>
    </Card>
  )
}
