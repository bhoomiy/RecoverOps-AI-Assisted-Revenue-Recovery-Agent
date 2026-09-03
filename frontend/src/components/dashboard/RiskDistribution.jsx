import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import Card from '../ui/Card'
import { riskDistribution } from '../../data/mockAnalytics'

const colors = ['#b95f6f', '#c89452', '#6d9279']

export default function RiskDistribution() {
  return (
    <Card className="chart-card risk-card">
      <div><span className="section-kicker">exposure mix</span><h3>Risk Distribution</h3><p>A quick look at where attention is needed.</p></div>
      <div className="donut-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={riskDistribution} dataKey="value" nameKey="name" innerRadius={56} outerRadius={79} paddingAngle={5} cornerRadius={6}>
              {riskDistribution.map((_, i) => <Cell key={i} fill={colors[i]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: '#fffaf8', border: '1px solid #e7d8d3', borderRadius: 12, color:'#322a2d' }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-center"><strong>1,374</strong><span>at-risk events</span></div>
      </div>
      <div className="risk-legend">
        {riskDistribution.map((r, i) => <div key={r.name}><span><i style={{background: colors[i]}} />{r.name}</span><strong>{r.value}%</strong></div>)}
      </div>
      <div className="risk-note">Most exposure sits in <strong>medium risk</strong> — ideal for automated recovery.</div>
    </Card>
  )
}
