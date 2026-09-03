import { useMemo, useState } from 'react'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import TransactionFilters from '../components/transactions/TransactionFilters'
import TransactionTable from '../components/transactions/TransactionTable'
import { transactions } from '../data/mockTransactions'

export default function Transactions() {
  const [search,setSearch]=useState('')
  const [filter,setFilter]=useState('ALL')
  const rows=useMemo(()=>transactions.filter(t => (filter==='ALL'||t.eventType===filter) && (`${t.id} ${t.customerId}`.includes(search))),[search,filter])
  return <>
    <PageHeader title="Transactions" subtitle="Monitor purchase events, payment failures and checkout abandonment." actions={<button className="primary-button">Export CSV</button>} />
    <Card className="table-card"><TransactionFilters {...{search,setSearch,filter,setFilter}}/><TransactionTable rows={rows}/><div className="pagination"><span>Showing {rows.length} of 4,000 transactions</span><div><button disabled>Previous</button><button className="active">1</button><button>2</button><button>3</button><button>Next</button></div></div></Card>
  </>
}
