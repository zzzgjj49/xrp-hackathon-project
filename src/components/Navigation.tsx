import { Link, useLocation } from 'react-router-dom'
import { Home, Coins, ClipboardList, Shield, Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function Navigation() {
  const location = useLocation()
  const { t } = useTranslation('common')

  const navItems = [
    { path: '/', label: 'ホーム', icon: Home },
    { path: '/dashboard', label: t('nav.dashboard'), icon: Home },
    { path: '/stake', label: t('nav.stake'), icon: Coins },
    { path: '/tasks', label: t('nav.tasks'), icon: ClipboardList },
    { path: '/admin', label: t('nav.admin'), icon: Shield }
  ]

  return (
    <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="w-6 h-6 text-green-400" />
          <span className="text-xl font-bold text-green-400">{t('brand')}</span>
        </div>
        
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  isActive
                    ? 'bg-green-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}