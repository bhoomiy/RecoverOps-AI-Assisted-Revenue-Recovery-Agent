import SearchInput from '../ui/SearchInput'

export default function TransactionFilters({ search, setSearch, filter, setFilter }) {
  const filters = ['ALL', 'PAYMENT_FAILED', 'CHECKOUT_ABANDONED', 'SUCCESSFUL_PURCHASE']
  return (
    <div className="filters-bar">
      <SearchInput value={search} onChange={setSearch} placeholder="Search transactions..." />
      <div className="filter-pills">
        {filters.map(f => <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>{f === 'ALL' ? 'All' : f.split('_').map(x=>x[0]+x.slice(1).toLowerCase()).join(' ')}</button>)}
      </div>
      <select><option>Risk Level</option><option>High</option><option>Medium</option><option>Low</option></select>
      <select><option>Recovery Status</option><option>Recovered</option><option>Pending</option><option>Failed</option></select>
    </div>
  )
}
