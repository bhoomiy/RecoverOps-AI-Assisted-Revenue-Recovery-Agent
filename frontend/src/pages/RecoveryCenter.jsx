import { CircleCheckBig, CircleX, Clock3, ShieldAlert } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import MetricCard from '../components/dashboard/MetricCard'
import RecoveryBoard from '../components/recovery/RecoveryBoard'
import { transactions } from '../data/mockTransactions'

export default function RecoveryCenter(){return <><PageHeader title="Recovery Center" subtitle="Track and manage revenue recovery attempts across the recovery lifecycle."/><div className="metric-grid"><MetricCard label="Needs Recovery" value="32" detail="4.1%" icon={ShieldAlert} accent="red"/><MetricCard label="In Progress" value="18" detail="3.4%" icon={Clock3} accent="blue"/><MetricCard label="Recovered" value="128" detail="12.4%" icon={CircleCheckBig} accent="green"/><MetricCard label="Failed" value="21" detail="1.8%" icon={CircleX} accent="violet"/></div><RecoveryBoard transactions={transactions.filter(t=>t.eventType!=='SUCCESSFUL_PURCHASE')}/></>}
