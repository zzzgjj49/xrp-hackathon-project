import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Stake from './pages/Stake'
import Tasks from './pages/Tasks'
import TaskDetail from './pages/TaskDetail'
import Admin from './pages/Admin'
import WalletManagement from './pages/WalletManagement'
import WalletConnect from './pages/WalletConnect'
import Navigation from './components/Navigation'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/stake" element={<Stake />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/wallets" element={<WalletManagement />} />
          <Route path="/wallet-connect" element={<WalletConnect />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
