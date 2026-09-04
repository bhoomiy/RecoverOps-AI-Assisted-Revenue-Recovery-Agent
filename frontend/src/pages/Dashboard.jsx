import { useEffect, useState } from 'react'

import {
  ArrowUpRight,
  CircleCheckBig,
  CircleDollarSign,
  ShieldAlert,
  Sparkles,
  TrendingUp
} from 'lucide-react'

import { useNavigate } from 'react-router-dom'

import PageHeader from '../components/ui/PageHeader'
import MetricCard from '../components/dashboard/MetricCard'
import RevenueOverviewChart from '../components/dashboard/RevenueOverviewChart'
import RiskDistribution from '../components/dashboard/RiskDistribution'
import RecoveryActivity from '../components/dashboard/RecoveryActivity'

import { api } from '../services/api'
import { formatCurrency } from '../utils/formatCurrency'


export default function Dashboard() {
  const navigate = useNavigate()

  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true)
        setError('')

        const data = await api.dashboard()

        setDashboard(data)

      } catch (err) {
        console.error(err)

        setError(
          'Could not load dashboard data.'
        )

      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])


  if (loading) {
    return (
      <p>Loading dashboard...</p>
    )
  }


  if (error) {
    return (
      <p>{error}</p>
    )
  }


  if (!dashboard) {
    return null
  }


  const {
    revenue_at_risk,
    revenue_recovered,
    recovery_rate,
    successful_recoveries,
    failed_recoveries,
    recovery_attempts,
    needs_recovery
  } = dashboard


  return (
    <>
      <PageHeader
        title="Revenue recovery"
        subtitle="A calmer view of what is at risk, what came back, and what your agent is doing next."
      />


      <section className="dashboard-hero">

        <div className="hero-copy">

          <span className="hero-kicker">
            <Sparkles size={14} />
            recovery pulse
          </span>


          <h2>
            {formatCurrency(revenue_recovered)}
            {' '}brought back into the business.
          </h2>


          <p>
            Your recovery agent has successfully recovered{' '}
            <strong>
              {successful_recoveries}
            </strong>
            {' '}transactions with a{' '}
            <strong>
              {recovery_rate}%
            </strong>
            {' '}recovery success rate.
          </p>


          <button
            className="hero-link"
            onClick={() => navigate('/recovery')}
          >
            Open recovery center
            <ArrowUpRight size={15} />
          </button>

        </div>


        <div className="hero-score-card">

          <div className="score-ring">

            <strong>
              {Math.round(recovery_rate)}%
            </strong>

            <span>
              recovered
            </span>

          </div>


          <div>

            <span className="mini-label">
              Agent status
            </span>

            <strong className="healthy-text">
              Active & running
            </strong>

            <small>
              {needs_recovery} transactions awaiting recovery
            </small>

          </div>

        </div>


        <span className="hero-star hero-star-one">
          ✦
        </span>

        <span className="hero-star hero-star-two">
          ✧
        </span>

      </section>


      <div className="metric-grid metric-grid-soft">

        <MetricCard
          label="Revenue at Risk"
          value={formatCurrency(revenue_at_risk)}
          detail={`${needs_recovery} transactions`}
          icon={ShieldAlert}
          accent="red"
        />


        <MetricCard
          label="Revenue Recovered"
          value={formatCurrency(revenue_recovered)}
          detail={`${successful_recoveries} successful recoveries`}
          icon={CircleDollarSign}
          accent="green"
        />


        <MetricCard
          label="Recovery Rate"
          value={`${recovery_rate}%`}
          detail={`${recovery_attempts} recovery attempts`}
          icon={TrendingUp}
          accent="blue"
        />


        <MetricCard
          label="Successful Recoveries"
          value={successful_recoveries}
          detail={`${failed_recoveries} failed attempts`}
          icon={CircleCheckBig}
          accent="violet"
        />

      </div>


      <div className="dashboard-grid dashboard-grid-editorial">
  <RevenueOverviewChart
    data={dashboard.revenue_trend}
  />

  <RiskDistribution
    data={dashboard.risk_distribution}
    total={dashboard.total_risky_events}
  />
</div>

<RecoveryActivity
  data={dashboard.recent_activity}
/>

    </>
  )
}