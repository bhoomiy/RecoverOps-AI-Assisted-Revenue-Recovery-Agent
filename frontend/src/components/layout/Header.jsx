import { Bell, Search, Sparkles } from 'lucide-react'

export default function Header({ onMenu }) {
  return (
    <header className="topbar">
      <button className="mobile-menu" onClick={onMenu}>☰</button>
      <div className="workspace-note"><Sparkles size={14}/><span>RecoverOps workspace</span></div>
    </header>
  )
}
