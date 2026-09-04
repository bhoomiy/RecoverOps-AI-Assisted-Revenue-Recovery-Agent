import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Card from '../ui/Card'
import { revenueTrend } from '../../data/mockAnalytics'

export default function RevenueOverviewChart() {
  return (
    <Card className="chart-card large-chart">
      <div className="section-title-row">
        <div><span className="section-kicker">30 day movement</span><h3>Revenue Recovery Overview</h3><p>At-risk revenue compared with what the agent recovered.</p></div>
        <span className="chart-period">
  Last 30 days
</span>
      </div>
      <div className="chart-legend-inline"><span><i className="dot-risk"/>At risk</span><span><i className="dot-recovered"/>Recovered</span><span><i className="dot-lost"/>Lost</span></div>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenueTrend}>
            <defs>
              <linearGradient id="riskRose" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#b86f86" stopOpacity={0.28}/><stop offset="100%" stopColor="#b86f86" stopOpacity={0}/></linearGradient>
              <linearGradient id="recoveredSage" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6d9279" stopOpacity={0.20}/><stop offset="100%" stopColor="#6d9279" stopOpacity={0}/></linearGradient>
            </defs>
            <CartesianGrid stroke="#eadeda" vertical={false} />
            <XAxis dataKey="name" stroke="#9b8f92" tickLine={false} axisLine={false} fontSize={11}/>
            <YAxis stroke="#9b8f92" tickLine={false} axisLine={false} fontSize={11} tickFormatter={(v) => `₹${Math.round(v/1000)}k`} />
            <Tooltip contentStyle={{ background: '#fffaf8', border: '1px solid #e7d8d3', borderRadius: 12, color:'#322a2d' }} />
            <Area type="monotone" dataKey="risk" name="At Risk" stroke="#b86f86" fill="url(#riskRose)" strokeWidth={2.5} />
            <Area type="monotone" dataKey="recovered" name="Recovered" stroke="#6d9279" fill="url(#recoveredSage)" strokeWidth={2.4} />
            <Area type="monotone" dataKey="lost" name="Lost" stroke="#c89452" fill="transparent" strokeWidth={1.8} strokeDasharray="5 5" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
