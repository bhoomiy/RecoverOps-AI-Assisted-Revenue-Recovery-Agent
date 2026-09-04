import { useNavigate } from 'react-router-dom'

import Card from '../ui/Card'
import Badge from '../ui/Badge'

import { formatCurrency } from '../../utils/formatCurrency'
import { labelize } from '../../utils/statusStyles'

export default function RecoveryActivity({
  data = []
}) {

  const navigate = useNavigate()

  return (
    <Card className="activity-card">

      <div className="section-title-row">

        <div>
          <h3>
            Recent Recovery Activity
          </h3>

          <p>
            Latest decisions from the recovery agent
          </p>
        </div>


        <button
          className="text-button"
          onClick={() =>
            navigate('/transactions')
          }
        >
          View all
        </button>

      </div>


      <div className="activity-table">

        {data.length > 0 ? (

          data.map(t => (

            <button
              className="activity-row"
              key={t.id}
              onClick={() =>
                navigate(
                  `/transactions/${t.id}`
                )
              }
            >

              <span className="txn-id">
                #{t.id}
              </span>


              <span>
                {labelize(
                  t.event_type
                )}
              </span>


              <strong>
                {formatCurrency(
                  t.amount
                )}
              </strong>


              <Badge
                value={t.risk_level}
              />


              <span className="activity-action">
                {t.action
                  ? labelize(t.action)
                  : t.failure_reason
                    ? labelize(
                        t.failure_reason
                      )
                    : 'Checkout reminder'}
              </span>


              <Badge
                value={t.status}
              />

            </button>

          ))

        ) : (

          <p>
            No recent recovery activity.
          </p>

        )}

      </div>

    </Card>
  )
}