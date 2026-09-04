import { useState } from 'react'
import SearchInput from '../ui/SearchInput'

export default function TransactionFilters({
  search,
  setSearch,
  filter,
  setFilter,
  recoveryStatus,
  setRecoveryStatus,
  riskLevel,
  setRiskLevel
}) {
  const filters = [
    'ALL',
    'PAYMENT_FAILED',
    'CHECKOUT_ABANDONED',
    'SUCCESSFUL_PURCHASE'
  ]

  const [recoveryOpen, setRecoveryOpen] = useState(false)

  const recoveryOptions = [
    { value: '', label: 'Recovery Status', className: 'recovery-neutral' },
    { value: 'RECOVERED', label: 'Recovered', className: 'recovery-green' },
    { value: 'PENDING', label: 'Pending', className: 'recovery-amber' },
    { value: 'FAILED', label: 'Failed', className: 'recovery-red' }
  ]

  const selectedRecovery =
    recoveryOptions.find((option) => option.value === recoveryStatus) ||
    recoveryOptions[0]

  function chooseRecoveryStatus(value) {
    setRecoveryStatus(value)
    setRecoveryOpen(false)
  }

  return (
    <div className="filters-bar">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search transactions..."
      />

      <div className="filter-pills">
        {filters.map((f) => (
          <button
            key={f}
            className={filter === f ? 'active' : ''}
            onClick={() => setFilter(f)}
          >
            {f === 'ALL'
              ? 'All'
              : f
                  .split('_')
                  .map((x) => x[0] + x.slice(1).toLowerCase())
                  .join(' ')}
          </button>
        ))}
      </div>

      <select
  value={riskLevel}
  onChange={(e) => setRiskLevel(e.target.value)}
>
  <option value="">Risk Level</option>
  <option value="HIGH">High</option>
  <option value="MEDIUM">Medium</option>
  <option value="LOW">Low</option>
</select>

      <div className="recovery-dropdown">
        <button
          type="button"
          className={`recovery-dropdown-trigger ${selectedRecovery.className}`}
          onClick={() => setRecoveryOpen((prev) => !prev)}
        >
          <span>{selectedRecovery.label}</span>
          <span className="recovery-chevron">
            {recoveryOpen ? '▲' : '▼'}
          </span>
        </button>

        {recoveryOpen && (
          <div className="recovery-dropdown-menu">
            {recoveryOptions.map((option) => (
              <button
                type="button"
                key={option.value || 'ALL'}
                className={`recovery-dropdown-option ${option.className}`}
                onClick={() => chooseRecoveryStatus(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}