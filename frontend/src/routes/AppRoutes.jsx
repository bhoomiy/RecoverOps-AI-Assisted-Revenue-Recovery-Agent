import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import Dashboard from '../pages/Dashboard'
import Transactions from '../pages/Transactions'
import TransactionIntelligence from '../pages/TransactionIntelligence'
import RecoveryCenter from '../pages/RecoveryCenter'
import Customers from '../pages/Customers'
import Analytics from '../pages/Analytics'
import AgentActivity from '../pages/AgentActivity'
import Settings from '../pages/Settings'

export default function AppRoutes(){return <Routes><Route element={<AppLayout/>}><Route index element={<Navigate to="/dashboard" replace/>}/><Route path="/dashboard" element={<Dashboard/>}/><Route path="/transactions" element={<Transactions/>}/><Route path="/transactions/:id" element={<TransactionIntelligence/>}/><Route path="/recovery" element={<RecoveryCenter/>}/><Route path="/customers" element={<Customers/>}/><Route path="/analytics" element={<Analytics/>}/><Route path="/agent-activity" element={<AgentActivity/>}/><Route path="/settings" element={<Settings/>}/></Route></Routes>}
