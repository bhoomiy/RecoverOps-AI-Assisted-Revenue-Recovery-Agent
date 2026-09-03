import { Bell, Search, Sparkles } from 'lucide-react'

export default function Header({ onMenu }) {
  return (
    <header className="topbar">
      <button className="mobile-menu" onClick={onMenu}>☰</button>
      <div className="workspace-note"><Sparkles size={14}/><span>RecoverOps workspace</span></div>
      <div className="header-actions">
        <button className="search-circle" aria-label="Search"><Search size={16}/></button>
        <button className="notification" aria-label="Notifications"><Bell size={16}/><i/></button>
        <div className="avatar">DY</div>
      </div>
    </header>
  )
}
