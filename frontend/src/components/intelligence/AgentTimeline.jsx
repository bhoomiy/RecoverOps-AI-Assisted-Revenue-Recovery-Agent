import { CheckCircle2 } from 'lucide-react'
import Card from '../ui/Card'
import { agentActivity } from '../../data/mockAgentActivity'

export default function AgentTimeline() {
  return <Card className="timeline-card"><div className="section-title-row"><div><h3>Agent Reasoning Timeline</h3><p>Trace every decision made for this recovery</p></div><span className="live-chip"><i/> Complete trace</span></div><div className="timeline">{agentActivity.map((a,i)=><div className="timeline-item" key={i}><div className="timeline-rail"><span><CheckCircle2 size={15}/></span>{i<agentActivity.length-1&&<i/>}</div><time>{a.time}</time><div><strong>{a.title}</strong><p>{a.detail}</p></div><small>{a.module}</small></div>)}</div></Card>
}
