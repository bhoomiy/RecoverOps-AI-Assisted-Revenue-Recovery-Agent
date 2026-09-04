import Card from '../ui/Card'

export default function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  accent = 'blue'
}) {
  return (
    <Card className="metric-card">

      <div className="metric-topline">
        <span>{label}</span>

        <span className={`metric-icon metric-icon-${accent}`}>
          {Icon && <Icon size={16} />}
        </span>
      </div>

      <strong>{value}</strong>

      <div className="metric-detail">
        <span>{detail}</span>
      </div>

    </Card>
  )
}