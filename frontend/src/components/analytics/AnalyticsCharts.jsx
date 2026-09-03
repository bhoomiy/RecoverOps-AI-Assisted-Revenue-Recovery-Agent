import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Card from '../ui/Card'
import { actionSuccess, failureReasons } from '../../data/mockAnalytics'

const tip = {background:'#fffaf8',border:'1px solid #e7d8d3',borderRadius:12,color:'#322a2d'}

export function FailureReasonChart() {
  return <Card className="chart-card"><div><span className="section-kicker">failure patterns</span><h3>Recovery by Failure Reason</h3><p>Which payment failures recover most reliably.</p></div><div className="chart-wrap medium"><ResponsiveContainer width="100%" height="100%"><BarChart data={failureReasons}><CartesianGrid stroke="#eadeda" vertical={false}/><XAxis dataKey="name" stroke="#9b8f92" tickLine={false} axisLine={false} fontSize={10}/><YAxis stroke="#9b8f92" tickLine={false} axisLine={false} tickFormatter={v=>`${v}%`} fontSize={10}/><Tooltip contentStyle={tip}/><Bar dataKey="success" fill="#b86f86" radius={[8,8,0,0]}/></BarChart></ResponsiveContainer></div></Card>
}

export function ActionSuccessChart() {
  return <Card className="chart-card"><div><span className="section-kicker">agent effectiveness</span><h3>Recovery Success by Action</h3><p>How each recovery strategy performs.</p></div><div className="chart-wrap medium"><ResponsiveContainer width="100%" height="100%"><BarChart layout="vertical" data={actionSuccess}><CartesianGrid stroke="#eadeda" horizontal={false}/><XAxis type="number" stroke="#9b8f92" tickFormatter={v=>`${v}%`} domain={[0,100]} fontSize={10}/><YAxis type="category" dataKey="name" stroke="#706368" width={130} tickLine={false} axisLine={false} fontSize={10}/><Tooltip contentStyle={tip}/><Bar dataKey="value" fill="#6d9279" radius={[0,8,8,0]}/></BarChart></ResponsiveContainer></div></Card>
}
