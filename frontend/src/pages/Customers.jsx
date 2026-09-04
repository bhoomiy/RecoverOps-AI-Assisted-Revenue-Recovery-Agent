import { useEffect, useState } from 'react'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import SearchInput from '../components/ui/SearchInput'
import { api } from '../services/api'
import { formatCurrency } from '../utils/formatCurrency'

export default function Customers() {
  const [q, setQ] = useState('')
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadCustomers() {
      try {
        setLoading(true)
        setError(null)

        const data = await api.customers()

        setCustomers(data.customers || [])
      } catch (err) {
        console.error(err)
        setError('Failed to load customers.')
      } finally {
        setLoading(false)
      }
    }

    loadCustomers()
  }, [])

  const rows = customers.filter((customer) =>
    String(customer.cust_id).includes(q)
  )

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle="Customer value, lifetime revenue and recovery exposure."
      />

      <Card className="table-card">
        <div className="filters-bar">
          <SearchInput
            value={q}
            onChange={setQ}
            placeholder="Search customers..."
          />
        </div>

        {loading ? (
          <div className="page-state">
            Loading customers...
          </div>
        ) : error ? (
          <div className="page-state">
            {error}
          </div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Previous Purchases</th>
                  <th>Total Spending</th>
                  <th>CLV</th>
                  <th>Customer Value</th>
                  <th>Revenue At Risk</th>
                  <th>Recovered</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((customer) => {
                  const customerType =
                    customer.prev_purchases > 0
                      ? 'Returning'
                      : 'New'

                  return (
                    <tr key={customer.cust_id}>
                      <td>
                        <strong>
                          C{String(customer.cust_id).padStart(3, '0')}
                        </strong>
                      </td>

                      <td>
                        {customerType}
                      </td>

                      <td>
                        {customer.prev_purchases}
                      </td>

                      <td>
                        {formatCurrency(
                          customer.total_spending ?? 0,
                          2
                        )}
                      </td>

                      <td>
                        {formatCurrency(
                          customer.clv ?? 0,
                          2
                        )}
                      </td>

                      <td>
                        <Badge value={customer.customer_value} />
                      </td>

                      <td>
                        {formatCurrency(
                          customer.revenue_at_risk ?? 0,
                          2
                        )}
                      </td>

                      <td className="success-text">
                        {formatCurrency(
                          customer.recovered ?? 0,
                          2
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}