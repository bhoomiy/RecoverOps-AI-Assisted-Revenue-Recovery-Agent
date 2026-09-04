import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from 'recharts'

import Card from '../ui/Card'

const colors = [
  '#b95f6f',
  '#c89452',
  '#6d9279'
]

export default function RiskDistribution({
  data = [],
  total = 0
}) {

  const highestRisk =
    data.length > 0
      ? [...data].sort(
          (a, b) => b.count - a.count
        )[0]
      : null

  return (
    <Card className="chart-card risk-card">

      <div>
        <span className="section-kicker">
          exposure mix
        </span>

        <h3>
          Risk Distribution
        </h3>

        <p>
          A quick look at where attention is needed.
        </p>
      </div>


      <div className="donut-wrap">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <PieChart>

            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={56}
              outerRadius={79}
              paddingAngle={5}
              cornerRadius={6}
            >
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={colors[i]}
                />
              ))}
            </Pie>

            <Tooltip
              contentStyle={{
                background: '#fffaf8',
                border: '1px solid #e7d8d3',
                borderRadius: 12,
                color: '#322a2d'
              }}
            />

          </PieChart>
        </ResponsiveContainer>


        <div className="donut-center">
          <strong>
            {total.toLocaleString()}
          </strong>

          <span>
            at-risk events
          </span>
        </div>

      </div>


      <div className="risk-legend">

        {data.map((r, i) => (
          <div key={r.name}>

            <span>
              <i
                style={{
                  background: colors[i]
                }}
              />

              {r.name}
            </span>

            <strong>
              {r.value}%
            </strong>

          </div>
        ))}

      </div>


      {highestRisk && (
        <div className="risk-note">

          Most exposure currently sits in{' '}

          <strong>
            {highestRisk.name.toLowerCase()} risk
          </strong>.

        </div>
      )}

    </Card>
  )
}