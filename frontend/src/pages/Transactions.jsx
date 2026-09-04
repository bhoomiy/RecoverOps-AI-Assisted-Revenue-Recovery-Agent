import { useEffect, useMemo, useState } from 'react'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import TransactionFilters from '../components/transactions/TransactionFilters'
import TransactionTable from '../components/transactions/TransactionTable'
import { api } from '../services/api'


export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [recoveryStatus, setRecoveryStatus] = useState('')
  const [riskLevel, setRiskLevel] = useState('')

  useEffect(() => {
  async function loadTransactions() {
    try {
      setLoading(true)

      // 1. Get data from Flask
      const data = await api.transactions()

      // 2. Convert Flask/SQLite field names
      //    into the names your frontend already expects
      const formattedTransactions = data.transactions.map((t) => ({
        id: t.transac_id,
        customerId: t.customer_id,
        eventType: t.event_type,

        amount:
          t.event_type === 'CHECKOUT_ABANDONED'
            ? t.cart_value
            : t.amount,

        failureReason: t.failure_reason,
        timestamp: t.timestamp,

        riskLevel: t.risk_level,

        recoveryStatus:
          t.recovery_success === 1
            ? 'RECOVERED'
            : t.recovery_success === 0
            ? 'FAILED'
            : t.event_type === 'SUCCESSFUL_PURCHASE'
            ? 'COMPLETED'
            : 'PENDING',
      }))

      // 3. Store them in React
      setTransactions(formattedTransactions)
      setError(null)

    } catch (err) {
      console.error('Failed to load transactions:', err)
      setError('Unable to load transactions.')
    } finally {
      setLoading(false)
    }
  }

  loadTransactions()
}, [])

  const rows = useMemo(() => {
  return transactions.filter((t) => {
    const matchesEvent =
      filter === 'ALL' || t.eventType === filter

    const matchesSearch =
      `${t.id} ${t.customerId}`
        .toLowerCase()
        .includes(search.toLowerCase())

    const matchesRecovery =
      recoveryStatus === '' ||
      t.recoveryStatus === recoveryStatus

    const matchesRisk =
      riskLevel === '' ||
      t.riskLevel === riskLevel

    return (
      matchesEvent &&
      matchesSearch &&
      matchesRecovery &&
      matchesRisk
    )
  })
}, [
  transactions,
  search,
  filter,
  recoveryStatus,
  riskLevel
])

  if (loading) {
    return <p>Loading transactions...</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  return (
    <>
      <PageHeader
        title="Transactions"
        subtitle="Monitor purchase events, payment failures and checkout abandonment."
        actions={
          <button className="primary-button">
            Export CSV
          </button>
        }
      />

      <Card className="table-card">
        <TransactionFilters
          search={search}
          setSearch={setSearch}
          filter={filter}
          setFilter={setFilter}
          recoveryStatus={recoveryStatus}
          setRecoveryStatus={setRecoveryStatus}
          riskLevel={riskLevel}
          setRiskLevel={setRiskLevel}
        />

        <TransactionTable rows={rows} />

        <div className="pagination">
          <span>
            Showing {rows.length} of {transactions.length} transactions
          </span>

          <div>
            <button disabled>Previous</button>
            <button className="active">1</button>
            <button>2</button>
            <button>3</button>
            <button>Next</button>
          </div>
        </div>
      </Card>
    </>
  )
}