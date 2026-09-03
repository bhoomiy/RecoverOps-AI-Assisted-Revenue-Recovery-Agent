import { Bot, CheckCircle2, CreditCard, RefreshCw, ShieldAlert, Users } from 'lucide-react'

const steps = [
  ['Payment Failed', CreditCard],
  ['Risk Detector', ShieldAlert],
  ['Customer Analyzer', Users],
  ['Decision Agent', Bot],
  ['Recovery', RefreshCw],
  ['Success', CheckCircle2],
]

export default function AgentPipeline() {
  return (
    <div className="pipeline">
      {steps.map(([label, Icon], i) => (
        <div className="pipeline-piece" key={label}>
          <div className={`pipeline-node ${i === steps.length - 1 ? 'success-node' : ''}`}>
            <span><Icon size={17}/></span><strong>{label}</strong><small>{i === 0 ? 'Event received' : i === steps.length - 1 ? 'Recovered' : 'Completed'}</small>
          </div>
          {i < steps.length - 1 && <div className="pipeline-line"><i/></div>}
        </div>
      ))}
    </div>
  )
}
