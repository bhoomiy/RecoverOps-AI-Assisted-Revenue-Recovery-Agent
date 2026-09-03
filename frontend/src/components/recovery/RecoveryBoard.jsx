import RecoveryCard from './RecoveryCard'

export default function RecoveryBoard({ transactions }) {
  const cols = [
    ['Needs Recovery', transactions.filter(t=>t.status==='PENDING').slice(0,2)],
    ['In Progress', transactions.filter(t=>t.status==='PENDING').slice(1,3)],
    ['Recovered', transactions.filter(t=>t.status==='RECOVERED')],
    ['Failed', transactions.filter(t=>t.status==='FAILED')],
  ]
  return <div className="recovery-board">{cols.map(([name,items])=><section className="recovery-column" key={name}><header><h3>{name}</h3><span>{items.length}</span></header><div>{items.map((x,i)=><RecoveryCard key={`${x.id}-${i}`} item={x}/>)}</div></section>)}</div>
}
