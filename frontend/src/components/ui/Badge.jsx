import { labelize, toneFor } from '../../utils/statusStyles'

export default function Badge({ value, children, tone }) {
  return <span className={`badge badge-${tone || toneFor(value || '')}`}>{children || labelize(value)}</span>
}
