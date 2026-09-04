import { ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Badge from '../ui/Badge'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import { labelize } from '../../utils/statusStyles'

export default function TransactionTable({ rows }) {
  const navigate = useNavigate()
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead><tr><th>Transaction</th><th>Customer</th><th>Event</th><th>Amount</th><th>Failure reason</th><th>Risk</th><th>Recovery status</th><th>Date</th><th/></tr></thead>
        <tbody>
          {rows.map(t => (
            <tr key={t.id} onClick={() => navigate(`/transactions/${t.id}`)}>
              <td><strong className="txn-id">#{t.id}</strong></td>
              <td>C{String(t.customerId).padStart(3,'0')}</td>
              <td>{labelize(t.eventType)}</td>
              <td><strong>{formatCurrency(t.amount, 2)}</strong></td>
              <td>{t.failureReason ? labelize(t.failureReason) : '—'}</td>
              <td>{t.riskLevel ? <Badge value={t.riskLevel}/> : '—'}</td>
              <td>
                {t.recoveryStatus
                  ? <Badge value={t.recoveryStatus} />
                  : '—'}
              </td>
              <td className="muted-cell">{formatDate(t.timestamp)}</td>
              <td><ChevronRight size={16}/></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
