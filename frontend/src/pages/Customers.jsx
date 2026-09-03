import { useState } from 'react'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import SearchInput from '../components/ui/SearchInput'
import { customers } from '../data/mockCustomers'
import { formatCurrency } from '../utils/formatCurrency'

export default function Customers(){const[q,setQ]=useState('');const rows=customers.filter(c=>String(c.id).includes(q));return <><PageHeader title="Customers" subtitle="Customer value, lifetime revenue and recovery exposure."/><Card className="table-card"><div className="filters-bar"><SearchInput value={q} onChange={setQ} placeholder="Search customers..."/></div><div className="table-scroll"><table className="data-table"><thead><tr><th>Customer</th><th>Type</th><th>Previous Purchases</th><th>Total Spending</th><th>CLV</th><th>Customer Value</th><th>Revenue At Risk</th><th>Recovered</th></tr></thead><tbody>{rows.map(c=><tr key={c.id}><td><strong>C{String(c.id).padStart(3,'0')}</strong></td><td>{c.type}</td><td>{c.previousPurchases}</td><td>{formatCurrency(c.totalSpending)}</td><td>{formatCurrency(c.clv)}</td><td><Badge value={c.value}/></td><td>{formatCurrency(c.atRisk)}</td><td className="success-text">{formatCurrency(c.recovered)}</td></tr>)}</tbody></table></div></Card></>}
