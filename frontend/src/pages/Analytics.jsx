import { CircleDollarSign, Percent, TrendingDown, TriangleAlert } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import MetricCard from '../components/dashboard/MetricCard'
import RevenueOverviewChart from '../components/dashboard/RevenueOverviewChart'
import RiskDistribution from '../components/dashboard/RiskDistribution'
import { ActionSuccessChart, FailureReasonChart } from '../components/analytics/AnalyticsCharts'

export default function Analytics(){return <><PageHeader title="Analytics" subtitle="Measure recovery effectiveness and understand where revenue is being lost."/><div className="metric-grid"><MetricCard label="Total Revenue At Risk" value="₹8.42L" detail="8.2%" icon={TriangleAlert} accent="red"/><MetricCard label="Revenue Recovered" value="₹5.31L" detail="12.4%" icon={CircleDollarSign} accent="green"/><MetricCard label="Revenue Lost" value="₹1.84L" detail="2.1%" icon={TrendingDown} accent="violet"/><MetricCard label="Overall Recovery Rate" value="63.1%" detail="5.6%" icon={Percent} accent="blue"/></div><RevenueOverviewChart/><div className="analytics-grid"><FailureReasonChart/><ActionSuccessChart/></div><div className="analytics-grid one-small"><RiskDistribution/></div></>}
