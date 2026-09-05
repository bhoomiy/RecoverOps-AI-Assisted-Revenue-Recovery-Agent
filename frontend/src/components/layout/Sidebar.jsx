import { Activity, BarChart3, Bot, ChevronLeft, CreditCard, LayoutDashboard, Settings, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const nav = [
  ['Dashboard', '/dashboard', LayoutDashboard],
  ['Transactions', '/transactions', CreditCard],
  ['Recovery Center', '/recovery', ShieldCheck],
  ['Customers', '/customers', Users],
  ['Analytics', '/analytics', BarChart3],
  ['Agent Activity', '/agent-activity', Activity],
  ['Settings', '/settings', Settings],
]

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="brand">
        <span className="brand-mark"><Bot size={18}/></span>
        {!collapsed && <div><strong>recover<span>ops</span></strong><small>revenue recovery studio</small></div>}
      </div>
      {!collapsed && <div className="sidebar-caption"><Sparkles size={12}/> automated recovery, minus the chaos</div>}
      <nav>
        {nav.map(([label, path, Icon]) => (
          <NavLink key={path} to={path} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <Icon size={17}/>{!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-bottom">
        {!collapsed && <div className="agent-status"><div><span className="status-dot"/>Agent status</div><strong>Operational</strong><small>Risk detection & recovery active.</small></div>}
        <button className="collapse-button" onClick={onToggle}><ChevronLeft size={17}/></button>
      </div>
    </aside>
  )
}
