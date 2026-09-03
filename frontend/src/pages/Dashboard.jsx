import { ArrowUpRight, CircleCheckBig, CircleDollarSign, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import MetricCard from '../components/dashboard/MetricCard'
import RevenueOverviewChart from '../components/dashboard/RevenueOverviewChart'
import RiskDistribution from '../components/dashboard/RiskDistribution'
import RecoveryActivity from '../components/dashboard/RecoveryActivity'

export default function Dashboard() {
  return <>
    <PageHeader title="Revenue recovery" subtitle="A calmer view of what is at risk, what came back, and what your agent is doing next." />

    <section className="dashboard-hero">
      <div className="hero-copy">
        <span className="hero-kicker"><Sparkles size={14}/> today’s recovery pulse</span>
        <h2>₹5.31L brought back into the business.</h2>
        <p>Your recovery agent is performing above its recent baseline, with 128 successful recoveries and a 63.1% recovery rate.</p>
        <button className="hero-link">Open recovery center <ArrowUpRight size={15}/></button>
      </div>
      <div className="hero-score-card">
        <div className="score-ring"><strong>63%</strong><span>recovered</span></div>
        <div><span className="mini-label">Agent status</span><strong className="healthy-text">Healthy & running</strong><small>Last recovery 2 min ago</small></div>
      </div>
      <span className="hero-star hero-star-one">✦</span>
      <span className="hero-star hero-star-two">✧</span>
    </section>

    <div className="metric-grid metric-grid-soft">
      <MetricCard label="Revenue at Risk" value="₹8.42L" detail="8.2%" icon={ShieldAlert} accent="red" />
      <MetricCard label="Revenue Recovered" value="₹5.31L" detail="12.4%" icon={CircleDollarSign} accent="green" />
      <MetricCard label="Recovery Rate" value="63.1%" detail="5.6%" icon={TrendingUp} accent="blue" />
      <MetricCard label="Successful Recoveries" value="128" detail="9.8%" icon={CircleCheckBig} accent="violet" />
    </div>

    <div className="dashboard-grid dashboard-grid-editorial"><RevenueOverviewChart/><RiskDistribution/></div>
    <RecoveryActivity/>
  </>
}
