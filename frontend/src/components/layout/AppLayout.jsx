import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  return (
    <div className="app-shell">
      <div className={mobileOpen ? 'mobile-overlay show' : 'mobile-overlay'} onClick={() => setMobileOpen(false)} />
      <div className={mobileOpen ? 'mobile-sidebar show' : 'mobile-sidebar'}><Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} /></div>
      <div className="desktop-sidebar"><Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} /></div>
      <main className="main-shell">
        <Header onMenu={() => setMobileOpen(true)} />
        <div className="page-content"><Outlet /></div>
      </main>
    </div>
  )
}
