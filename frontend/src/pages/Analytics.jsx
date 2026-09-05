import { useEffect, useState } from 'react'

import {
  CircleDollarSign,
  Percent,
  TrendingDown,
  TriangleAlert
} from 'lucide-react'

import PageHeader from '../components/ui/PageHeader'
import MetricCard from '../components/dashboard/MetricCard'
import RevenueOverviewChart from '../components/dashboard/RevenueOverviewChart'
import RiskDistribution from '../components/dashboard/RiskDistribution'

import {
  ActionSuccessChart,
  FailureReasonChart
} from '../components/analytics/AnalyticsCharts'

import { api } from '../services/api'
import { formatCurrency } from '../utils/formatCurrency'

export default function Analytics() {

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {

    async function loadAnalytics() {

      try {

        setLoading(true)
        setError('')

        const result = await api.analytics()

        setData(result)

      } catch (err) {

        console.error(err)

        setError(
          'Failed to load analytics.'
        )

      } finally {

        setLoading(false)

      }
    }

    loadAnalytics()

  }, [])

  if (loading) {
    return (
      <div className="page-state">
        Loading analytics...
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-state">
        {error}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="page-state">
        No analytics data available.
      </div>
    )
  }

  const metrics = data.metrics

  return (
    <>

      <PageHeader
        title="Analytics"
        subtitle="Measure recovery effectiveness and understand where revenue is being lost."
      />


      <div className="metric-grid">

        <MetricCard
          label="Total Revenue At Risk"
          value={formatCurrency(
            metrics.total_revenue_at_risk
          )}
          detail={`${data.risk_total} at-risk events`}
          icon={TriangleAlert}
          accent="red"
        />


        <MetricCard
          label="Revenue Recovered"
          value={formatCurrency(
            metrics.revenue_recovered
          )}
          detail={`${metrics.successful_attempts} successful recoveries`}
          icon={CircleDollarSign}
          accent="green"
        />


        <MetricCard
          label="Revenue Lost"
          value={formatCurrency(
            metrics.revenue_lost
          )}
          detail={`${metrics.total_attempts} recovery attempts`}
          icon={TrendingDown}
          accent="violet"
        />


        <MetricCard
          label="Overall Recovery Rate"
          value={`${metrics.recovery_rate}%`}
          detail={`${metrics.successful_attempts} of ${metrics.total_attempts} attempts`}
          icon={Percent}
          accent="blue"
        />

      </div>


      <RevenueOverviewChart
        data={data.revenue_trend}
      />


      <div className="analytics-grid">

        <FailureReasonChart
          data={data.failure_reasons}
        />

        <ActionSuccessChart
          data={data.action_success}
        />

      </div>


      <div className="analytics-grid one-small">

        <RiskDistribution
          data={data.risk_distribution}
          total={data.risk_total}
        />

      </div>

    </>
  )
}