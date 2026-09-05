import { useEffect, useState } from 'react'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import TransactionFilters from '../components/transactions/TransactionFilters'
import TransactionTable from '../components/transactions/TransactionTable'
import { api } from '../services/api'


export default function Transactions() {
  const [transactions, setTransactions] = useState([])

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [recoveryStatus, setRecoveryStatus] = useState('')
  const [riskLevel, setRiskLevel] = useState('')

  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTransactions()
    }, 250)

    return () => clearTimeout(timer)
  }, [
    page,
    search,
    filter,
    recoveryStatus,
    riskLevel
  ])

  async function loadTransactions() {
    try {
      setLoading(true)

      const data = await api.transactions({
        page,
        limit: 50,
        search,
        event_type: filter,
        recovery_status: recoveryStatus,
        risk_level: riskLevel
      })

      const formatted = data.transactions.map((t) => ({
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

      setTransactions(formatted)

      setTotal(data.total)
      setTotalPages(data.total_pages)

      setError(null)

    } catch (err) {
      console.error(
        'Failed to load transactions:',
        err
      )

      setError(
        'Unable to load transactions.'
      )

    } finally {
      setLoading(false)
    }
  }

  function changeSearch(value) {
    setSearch(value)
    setPage(1)
  }

  function changeFilter(value) {
    setFilter(value)
    setPage(1)
  }

  function changeRecoveryStatus(value) {
    setRecoveryStatus(value)
    setPage(1)
  }

  function changeRiskLevel(value) {
    setRiskLevel(value)
    setPage(1)
  }

  return (
    <>
      <PageHeader
        title="Transactions"
        subtitle="Monitor purchase events, payment failures and checkout abandonment."
      />

      <Card className="table-card">
        <TransactionFilters
          search={search}
          setSearch={changeSearch}

          filter={filter}
          setFilter={changeFilter}

          recoveryStatus={recoveryStatus}
          setRecoveryStatus={changeRecoveryStatus}

          riskLevel={riskLevel}
          setRiskLevel={changeRiskLevel}
        />

        {loading ? (
          <div className="page-state">
            Loading transactions...
          </div>
        ) : error ? (
          <div className="page-state">
            {error}
          </div>
        ) : (
          <>
            <TransactionTable
              rows={transactions}
            />

            <div className="pagination">
              <span>
                Showing {transactions.length} of {total} transactions
              </span>

              <div>
                <button
                  disabled={page === 1}
                  onClick={() =>
                    setPage((p) => p - 1)
                  }
                >
                  Previous
                </button>

                <button className="active">
                  {page}
                </button>

                <span>
                  of {totalPages}
                </span>

                <button
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage((p) => p + 1)
                  }
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </Card>
    </>
  )
}