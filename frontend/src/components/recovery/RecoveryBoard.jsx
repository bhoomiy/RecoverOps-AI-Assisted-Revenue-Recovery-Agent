import RecoveryCard from './RecoveryCard'

export default function RecoveryBoard({
  transactions,
  onRecoveryExecuted
}) {
  const cols = [
  [
    'Needs Recovery',
    transactions.filter(t => t.status === 'NEEDS_RECOVERY')
  ],
  [
    'Recovered',
    transactions.filter(t => t.status === 'RECOVERED')
  ],
  [
    'Failed',
    transactions.filter(t => t.status === 'FAILED')
  ]
]


  return (
    <div className="recovery-board">
      {cols.map(([name, items]) => (
        <section className="recovery-column" key={name}>
          <header>
            <h3>{name}</h3>
            <span>{items.length}</span>
          </header>

          <div className="recovery-column-content">
            {items.length > 0 ? (
              items.map(item => (
                <RecoveryCard
                  key={item.id}
                  item={item}
                  onRecoveryExecuted={onRecoveryExecuted}
                />
              ))
            ) : (
              <div className="recovery-empty">
                No recovery attempts
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  )
}